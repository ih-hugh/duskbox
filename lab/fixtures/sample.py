import asyncio
from dataclasses import dataclass
from typing import Optional

MAX_RETRIES = 3

@dataclass
class Agent:
    name: str
    active: bool = True

    async def restore(self, attempts: Optional[int] = None) -> bool:
        global MAX_RETRIES
        for attempt in range(attempts or MAX_RETRIES):
            ok = await self._probe(f"agent/{self.name}/{attempt}")
            if ok:
                return True
        raise RuntimeError("restore failed")
