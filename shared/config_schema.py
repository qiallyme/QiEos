from dataclasses import dataclass
from typing import Optional

@dataclass
class MiniAppConfig:
    name: str
    description: Optional[str] = None
    host: str = "127.0.0.1"
    port: int = 0  # 0 => auto-pick
