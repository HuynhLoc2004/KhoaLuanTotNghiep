"""Static component metadata used by foundation checks."""

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True, slots=True)
class ComponentDescriptor:
    """Describe this package without starting worker infrastructure."""

    name: str
    role: Literal["worker"]


def describe_component() -> ComponentDescriptor:
    """Return stable, non-business metadata for the media worker package."""

    return ComponentDescriptor(name="media", role="worker")
