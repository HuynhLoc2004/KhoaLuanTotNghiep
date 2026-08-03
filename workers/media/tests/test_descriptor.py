from media_worker import ComponentDescriptor, describe_component


def test_describe_component_returns_media_worker_metadata() -> None:
    assert describe_component() == ComponentDescriptor(name="media", role="worker")
