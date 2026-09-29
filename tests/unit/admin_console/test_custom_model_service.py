# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");

"""Unit tests for the OpenAI-compatible custom-model persistence helper."""

from pathlib import Path

import pytest

from apps.admin_console.services.custom_model_service import (
    _upsert_env,
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
    assert "// =header=" in out                       # comments preserved
    assert '"provider": "openai"' in out              # default provider changed
    assert '"model": "my-custom-vision"' in out       # default model changed
    assert '"presets":' in out                        # presets block untouched
    assert '"provider": "google",' in out             # nested fallback provider kept
    assert '"gpt-4o"' in out                          # other preset model kept
    assert result is True


def test_update_default_model_replaces_existing_value(tmp_path: Path):
    cfg = tmp_path / "artemis.jsonc"
    cfg.write_text('{\n  "default": {\n    "provider": "google",\n    "model": "x",\n  }\n}\n', encoding="utf-8")
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