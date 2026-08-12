"""Static component metadata used by foundation checks."""

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True, slots=True)
class ComponentDescriptor:
    """Describe this package without starting application infrastructure."""

    name: str
    role: Literal["service"]


def describe_component() -> ComponentDescriptor:
    """Return stable, non-business metadata for the AI service package."""

    return ComponentDescriptor(name="ai", role="service")
