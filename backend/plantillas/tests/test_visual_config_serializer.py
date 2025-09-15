from plantillas.serializers import PlantillaVisualConfigSerializer


def test_visual_config_serializer_valid():
    s = PlantillaVisualConfigSerializer(data={"visual_config": {"render_mode": "visual"}})
    assert s.is_valid(), s.errors


def test_visual_config_serializer_invalid():
    s = PlantillaVisualConfigSerializer(data={"visual_config": "no"})
    assert not s.is_valid()
