from ai_service import ComponentDescriptor, describe_component


def test_describe_component_returns_ai_service_metadata() -> None:
    assert describe_component() == ComponentDescriptor(name="ai", role="service")
