# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Persist an OpenAI-compatible custom model as ARTEMIS's default.

Users can point ARTEMIS at any OpenAI-compatible endpoint (a relay, a
self-hosted server, or local Ollama/vLLM) straight from the Web console. This
module is the backend half: it writes the pieces the runtime router reads so a
fresh task actually routes there —

  * ``OPENAI_API_KEY``   -> .env (and process env)
  * ``OPENAI_BASE_URL``  -> .env
  * ``config/artemis.jsonc`` every ``provider``/``model`` -> openai + <model>

The config rewrite covers *all* nodes (planner, hopper, object_detector,
explorer, ...) and their fallbacks so no Gemini model name or Google fallback
is left behind — that was what caused ``ChatGoogleGenerativeAI`` (no key) at
runtime after switching only the default.
"""

import logging
import re
from pathlib import Path

from artemis.config import constants
from artemis.config.paths import get_config_path, get_env_file

logger = logging.getLogger(__name__)

# Matches the "default" block of artemis.jsonc: a JSON object literal whose
# opening `"default": {` ... `}` we then rewrite key-by-key.
_DEFAULT_OPEN = re.compile(r'"default"\s*:\s*\{')
_PROVIDER_LINE = re.compile(r'^\s*"provider"\s*:\s*"[^"]*"(,)?\s*$')
_MODEL_LINE = re.compile(r'^\s*"model"\s*:\s*"[^"]*"(,)?\s*$')


def _rewrite_models(raw: str, model: str) -> str:
    """Return ``raw`` with every ``provider``/``model`` key rewritten to openai+model."""
    out: list[str] = []
    for line in raw.split("\n"):
        line = re.sub(r'("provider"\s*:\s*")[^"]*(")', r"\g<1>openai\g<2>", line)
        line = re.sub(r'("model"\s*:\s*")[^"]*(")', rf"\g<1>{model}\g<2>", line)
        out.append(line)
    return "\n".join(out)


def set_all_models(config_path: Path, model: str) -> bool:
    """Rewrite *every* ``provider``/``model`` key in the config to openai+model.

    ARTEMIS has per-node models (hopper, object_detector, explorer, ...) whose
    model names are Gemini-specific and whose fallbacks route to Google. Leaving
    those in place after switching the default is what caused
    ``ChatGoogleGenerativeAI`` (no key) at runtime. This covers them all so no
    Gemini model name or Google fallback survives.

    Only real config key lines are touched (``"provider": ...`` / ``"model": ...
    ``); commented mentions in prose are unaffected. Returns True.
    """
    config_path.write_text(
        _rewrite_models(config_path.read_text(encoding="utf-8"), model), encoding="utf-8"
    )
    return True


def update_default_model(config_path: Path, provider: str, model: str) -> bool:
    """Set provider+model on the *top level* of the "default" object.

    Nested objects (e.g. ``fallback``) are left untouched, and key lines keep
    their original indentation so the file reads cleanly. Returns True on
    success; raises if the config is absent or the default block is malformed.
    """
    raw = config_path.read_text(encoding="utf-8")
    open_match = _DEFAULT_OPEN.search(raw)
    if not open_match:
        raise ValueError("config has no 'default' block")
    start = raw.index("{", open_match.start())
    # Find the matching close brace (naive brace scan; JSONC has no braces in
    # strings here).
    depth = 0
    end = None
    for i in range(start, len(raw)):
        c = raw[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end is None:
        raise ValueError("unbalanced 'default' block")

    block = raw[start : end + 1]
    lines = block.split("\n")

    # One-deep children of "default" sit at the shallowest indent among the
    # block's content lines *excluding the closing brace*; nested objects
    # (fallback / presets) are deeper.
    body = lines[1:]
    child_indent = None
    for line in body:
        stripped = line.strip()
        if not stripped or stripped == "}" or stripped == "},":
            continue
        indent = len(line) - len(line.lstrip())
        child_indent = indent if child_indent is None else min(child_indent, indent)

    rebuilt: list[str] = []
    for line in body:
        indent = len(line) - len(line.lstrip())
        if child_indent is not None and indent > child_indent:
            rebuilt.append(line)  # nested child: untouched
            continue
        if not line.strip():
            rebuilt.append(line)
        elif _PROVIDER_LINE.match(line):
            rebuilt.append(
                re.sub(r'^(\s*"provider"\s*:\s*")[^"]*(")', rf"\g<1>{provider}\g<2>", line)
            )
        elif _MODEL_LINE.match(line):
            rebuilt.append(re.sub(r'^(\s*"model"\s*:\s*")[^"]*(")', rf"\g<1>{model}\g<2>", line))
        else:
            rebuilt.append(line)

    new_block = "\n".join([lines[0]] + rebuilt)
    new_raw = raw[:start] + new_block + raw[end + 1 :]
    config_path.write_text(new_raw, encoding="utf-8")
    return True


def _upsert_env(env_path: Path, key: str, value: str) -> None:
    """Set ``{key}={value}`` in a dotenv file, preserving other lines."""
    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
    written = False
    out: list[str] = []
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith(f"{key}="):
            out.append(f"{key}={value}")
            written = True
        else:
            out.append(line)
    if not written:
        out.append(f"{key}={value}")
    # Drop any commented duplicates (e.g. "# KEY=..." or "# KEY=...") that would
    # shadow the live value when the file is sourced.
    out = [line for line in out if not re.match(rf"^\s*#\s*{re.escape(key)}\s*=", line)]
    env_path.write_text("\n".join(out) + "\n", encoding="utf-8")


def apply_custom_model(base_url: str, model: str, api_key: str, persist: bool = True) -> dict:
    """Persist an OpenAI-compatible endpoint as the default model.

    Returns a short status summary. Never raises for a non-existent config;
    missing files are reported so the caller can surface a clear error.
    """
    from artemis.config import settings

    if not base_url.strip():
        raise ValueError("Base URL is required")
    if not model.strip():
        raise ValueError("Model name is required")

    # 1. API key (also sets process env so a running task can pick it up).
    settings.set_api_key("openai", api_key, persist_to_env=persist)

    # 2. Base URL -> .env (and process env for the running server).
    env_path = get_env_file()
    if persist:
        _upsert_env(env_path, constants.ENV_OPENAI_BASE_URL, base_url.strip())
    import os

    os.environ[constants.ENV_OPENAI_BASE_URL] = base_url.strip()

    # 3. Write a *local* config override (gitignored) with every node set to
    #    openai + the custom model, and point ARTEMIS at it via
    #    ARTEMIS_ARTEMIS_JSONC. The tracked config/artemis.jsonc stays clean.
    cfg = get_config_path(constants.ARTEMIS_CONFIG_FILENAME)
    if not cfg.exists():
        return {
            "applied": False,
            "warning": "config/artemis.jsonc not found; key+base URL saved but model not set as default",
            "base_url": base_url.strip(),
            "model": model.strip(),
        }
    local_cfg = cfg.with_name("artemis.local.jsonc")
    # Base the override on the *tracked* config so it stays a full, valid file.
    tracked_raw = cfg.read_text(encoding="utf-8")
    local_raw = _rewrite_models(tracked_raw, model.strip())
    local_cfg.write_text(local_raw, encoding="utf-8")

    env_var = f"ARTEMIS_{constants.ARTEMIS_CONFIG_FILENAME.upper().replace('.', '_')}"
    if persist:
        _upsert_env(env_path, env_var, str(local_cfg))
    import os

    os.environ[env_var] = str(local_cfg)

    # Note: a running server caches its LLM config; applying on a fresh task
    # reads the env var, but a restart guarantees the override is active.
    return {
        "applied": True,
        "base_url": base_url.strip(),
        "model": model.strip(),
        "provider": "openai",
        "local_config": str(local_cfg),
        "note": (
            "Custom model saved to a local override (config/artemis.local.jsonc). "
            "ARTEMIS_ARTEMIS_JSONC now points at it, so config/artemis.jsonc is "
            "not modified. NOTE: ARTEMIS's coordinate/visual grounding is designed "
            "around a Gemini ER model; a non-Gemini model may locate on-screen "
            "elements less precisely. Restart the service to guarantee the override "
            "is active."
        ),
    }
