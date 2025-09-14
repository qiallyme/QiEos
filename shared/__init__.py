"""Shared utilities for the Qi miniapps ecosystem.

This package exposes helpers that can be reused by both the cockpit and
individual miniapps. To keep the surface area small, only import what you
need from the submodules (for example, ``from shared.process_utils import start_subprocess``).
"""

from .process_utils import start_subprocess, stream_process_output

__all__ = [
    "start_subprocess",
    "stream_process_output",
]