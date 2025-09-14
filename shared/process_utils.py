"""Helpers for spawning and streaming subprocesses.

These functions are used by the cockpit to launch miniapps as separate
processes and forward their output back to the user. They can also be
imported by miniapps themselves if they need to run other commands.

All subprocesses are created with ``text=True`` and unbuffered
standard output to ensure that log messages appear immediately.
"""
from __future__ import annotations

import os
import subprocess
import threading
import queue
from typing import Iterator, Iterable, Tuple, Optional


def start_subprocess(cwd: str, entry: str, python_executable: Optional[str] = None) -> subprocess.Popen:
    """Launch a Python subprocess for the given entry point in a working directory.

    Parameters
    ----------
    cwd: str
        The working directory where the entry script resides.
    entry: str
        Path to the Python script relative to ``cwd`` that should be executed.
    python_executable: Optional[str]
        Absolute path to the Python interpreter to use. If ``None`` the
        interpreter from the current process (``sys.executable``) is used.

    Returns
    -------
    subprocess.Popen
        A handle to the started process. The caller is responsible for
        terminating it when appropriate.
    """
    import sys
    exe = python_executable or sys.executable
    cmd = [exe, entry]
    return subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True,
    )


def stream_process_output(proc: subprocess.Popen) -> Iterator[str]:
    """Yield lines of output from a running subprocess.

    The generator will block until the process terminates. To stop
    streaming early call ``proc.terminate()`` from another thread.

    Parameters
    ----------
    proc: subprocess.Popen
        The process whose output should be consumed.

    Yields
    ------
    str
        Lines of text output by the process.
    """
    if proc.stdout is None:
        return
    
    try:
        # Iterate over lines as they become available.
        for line in proc.stdout:
            yield line.rstrip("\n")
    except Exception as e:
        # Ensure process is terminated on error
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()
        except Exception:
            pass  # Process may already be terminated
        raise RuntimeError(f"Error reading subprocess output: {e}")