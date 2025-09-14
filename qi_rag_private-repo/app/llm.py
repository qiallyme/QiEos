"""LLM abstraction layer.

This module encapsulates calls to a local language model (via Ollama) or to a
remote provider.  It exposes a simple `generate_answer` function which
constructs a prompt from the user question and retrieved context.
"""

from __future__ import annotations

import os
import requests
from typing import List


def build_prompt(question: str, contexts: List[str]) -> str:
    """Compose a prompt for the language model.

    The prompt concatenates the retrieved contexts and asks the model to
    answer the question based solely on these documents.  If you change
    this function please update your retrieval logic accordingly.
    """
    context_str = "\n\n".join(contexts)
    prompt = (
        "You are an assistant with access to the following context documents:\n\n"
        f"{context_str}\n\n"
        "Answer the question using only the provided documents. "
        "Cite the document index when relevant (e.g. [1], [2]).\n\n"
        f"Question: {question}\nAnswer:"
    )
    return prompt


def call_ollama(prompt: str, model: str) -> str:
    """Send a prompt to a local Ollama server and return the generated text.

    Requires the `ollama/ollama` Docker container to be running with port
    11434 exposed.  See the project README for details.
    """
    url = "http://localhost:11434/api/generate"
    payload = {"model": model, "prompt": prompt, "stream": False}
    try:
        resp = requests.post(url, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        response = data.get("response", "").strip()
        if not response:
            raise RuntimeError("Empty response from Ollama")
        return response
    except requests.exceptions.Timeout:
        raise RuntimeError(f"Ollama request timed out after 60 seconds for model {model}")
    except requests.exceptions.ConnectionError:
        raise RuntimeError(f"Failed to connect to Ollama server at {url}. Is Ollama running?")
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f"Ollama HTTP error: {e.response.status_code} - {e.response.text}")
    except Exception as exc:
        raise RuntimeError(f"Failed to call Ollama with model {model}: {exc}")


def generate_answer(question: str, contexts: List[str]) -> str:
    """Generate an answer to a question given a list of context passages.

    Depending on your environment variables this function will either call a
    local Ollama server or another provider.  For the MVP we support only
    the local Ollama pathway.
    """
    prompt = build_prompt(question, contexts)
    model = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    # In a more complete implementation you could branch here based on
    # LLM_PROVIDER environment variables or similar.
    return call_ollama(prompt, model)