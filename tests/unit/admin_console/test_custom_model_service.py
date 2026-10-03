# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");

"""Unit tests for the OpenAI-compatible custom-model persistence helper."""

from pathlib import Path

import pytest

from apps.admin_console.services.custom_model_service import (
    _upsert_env,
    apply_custom_model,
    set_all_models,
    update_default_model,
)

SAMPLE = """{
  // =header=
  "default": {
    "provider": "google",
    "model": "gemini-3.8-flash",
    "thinking_level": "medium",
    "fallback": {
      "provider": "google",
      "model": "gemini-3.7-flash"
    }
  },
  "presets": {
    "openai-gpt4o": {
      "provider": "openai",
      "model": "gpt-4o"
    }
  }
}
"""


def test_update_default_model_preserves_comments_and_other_blocks(tmp_path: Path):
    cfg = tmp_path / "artemis.jsonc"
    cfg.write_text(SAMPLE, encoding="utf-8")

    result = update_default_model(cfg, "openai", "my-custom-vision")

    out = cfg.read_text(encoding="utf-8")
    assert "// =header=" in out  # comments preserved
    assert '"provider": "openai"' in out  # default provider changed
    assert '"model": "my-custom-vision"' in out  # default model changed
    assert '"presets":' in out  # presets block untouched
    assert '"provider": "google",' in out  # nested fallback provider kept
    assert '"gpt-4o"' in out  # other preset model kept
    assert result is True


def test_update_default_model_replaces_existing_value(tmp_path: Path):
    cfg = tmp_path / "artemis.jsonc"
    cfg.write_text(
        '{\n  "default": {\n    "provider": "google",\n    "model": "x",\n  }\n}\n',
        encoding="utf-8",
    )
    update_default_model(cfg, "openai", "gpt-5")
    out = cfg.read_text(encoding="utf-8")
    assert '"provider": "openai"' in out
    assert '"model": "gpt-5"' in out
    assert '"model": "x"' not in out


def test_update_default_model_missing_block_raises(tmp_path: Path):
    cfg = tmp_path / "artemis.jsonc"
    cfg.write_text('{"presets": {}}', encoding="utf-8")
    with pytest.raises(ValueError):
        update_default_model(cfg, "openai", "gpt-5")


def test_upsert_env_sets_and_preserves(tmp_path: Path):
    env = tmp_path / ".env"
    env.write_text("OPENAI_API_KEY=abc\n# OPENAI_BASE_URL=http://old\nOTHER=1\n", encoding="utf-8")
    _upsert_env(env, "OPENAI_BASE_URL", "http://127.0.0.1:11434/v1")
    text = env.read_text(encoding="utf-8")
    assert "OPENAI_BASE_URL=http://127.0.0.1:11434/v1" in text
    assert "OPENAI_API_KEY=abc" in text
    assert "OTHER=1" in text
    assert "# OPENAI_BASE_URL" not in text  # stale commented duplicate removed


def test_upsert_env_appends_when_absent(tmp_path: Path):
    env = tmp_path / ".env"
    env.write_text("EXISTING=1\n", encoding="utf-8")
    _upsert_env(env, "OPENAI_BASE_URL", "http://relay/v1")
    text = env.read_text(encoding="utf-8")
    assert "OPENAI_BASE_URL=http://relay/v1" in text
    assert "EXISTING=1" in text


def test_apply_custom_model_writes_local_override(tmp_path: Path, monkeypatch):
    """Prove the custom model lands in a gitignored *local* override, not the
    tracked config, and that ARTEMIS_ARTEMIS_JSONC points at it.

    ``settings.set_api_key`` is patched to a no-op so the test never touches the
    real ``.env`` / credentials.
    """
    from third_party.mobile_use.utils.file import load_jsonc

    cfg = tmp_path / "artemis.jsonc"
    cfg.write_text(
        '{\n  "default": {\n    "provider": "google",\n    "model": "gemini-2.5-flash"\n  },\n  "presets": {}\n}\n',
        encoding="utf-8",
    )
    env = tmp_path / ".env"
    env.write_text("EXISTING=1\n# OPENAI_BASE_URL=http://old\n", encoding="utf-8")

    import apps.admin_console.services.custom_model_service as svc
    from artemis.config.settings import Settings
    from unittest.mock import patch

    # NEVER write real credentials from a unit test: intercept the class method
    # so apply_custom_model's settings.set_api_key(...) is a no-op.
    with patch.object(Settings, "set_api_key", lambda self, *a, **k: None):
        monkeypatch.setattr(svc, "get_config_path", lambda name, *a, **k: cfg)
        monkeypatch.setattr(svc, "get_env_file", lambda: env)

        result = apply_custom_model(
            base_url="http://127.0.0.1:11434/v1",
            model="llama3.2-vision",
            api_key="",
            persist=True,
        )
    assert result["applied"] is True
    assert result["provider"] == "openai"

    # The tracked config is untouched (still google default).
    with open(cfg, encoding="utf-8") as f:
        tracked = load_jsonc(f)
    assert tracked["default"]["provider"] == "google"

    # The *local* override carries provider=openai + the model everywhere.
    local = cfg.with_name("artemis.local.jsonc")
    assert local.exists()
    with open(local, encoding="utf-8") as f:
        local_cfg = load_jsonc(f)
    assert local_cfg["default"]["provider"] == "openai"
    assert local_cfg["default"]["model"] == "llama3.2-vision"

    # ARTEMIS_ARTEMIS_JSONC set in .env + process; OPENAI_BASE_URL persisted.
    env_text = env.read_text(encoding="utf-8")
    assert f"ARTEMIS_ARTEMIS_JSONC={local}" in env_text
    assert "OPENAI_BASE_URL=http://127.0.0.1:11434/v1" in env_text
    assert "# OPENAI_BASE_URL" not in env_text
    assert "EXISTING=1" in env_text


def test_set_all_models_covers_nodes_and_fallbacks(tmp_path: Path):
    """Every provider/model in the file (all nodes + fallbacks) is switched,
    so no Gemini model name or Google fallback survives."""
    cfg = tmp_path / "artemis.jsonc"
    cfg.write_text(
        "{ // note: gemini-robotics-er-2 mentioned in comment\n"
        '  "default": {\n'
        '    "provider": "google",\n    "model": "gemini-2.5-flash",\n'
        '    "fallback": { "provider": "google", "model": "gemini-2.0-flash" }\n'
        "  },\n"
        '  "nodes": {\n'
        '    "hopper": { "provider": "openai", "model": "gemini-3.5-flash-lite",'
        ' "fallback": { "provider": "google", "model": "gemini-3.1-flash-lite" } },\n'
        '    "object_detector": { "provider": "google", "model": "gemini-robotics-er-2-preview" }\n'
        "  }\n"
        "}\n",
        encoding="utf-8",
    )
    set_all_models(cfg, "my-model-vision")
    out = cfg.read_text(encoding="utf-8")
    # All live provider/model keys now point at the custom model.
    assert '"provider": "openai"' in out
    assert '"model": "my-model-vision"' in out
    # No Gemini-only provider or model left behind in real keys.
    assert '"provider": "google"' not in out
    assert "gemini-3.5-flash-lite" not in out
    assert "gemini-robotics-er-2-preview" not in out
    # Comment prose stays intact.
    assert "gemini-robotics-er-2 mentioned in comment" in out
