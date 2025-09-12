import pytest
from django.contrib.auth import get_user_model
from templates_app.models import Template

@pytest.mark.django_db
def test_create_template():
    user_model = get_user_model()
    user = user_model.objects.create(username="u")
    tpl = Template.objects.create(name="t1", schema={}, created_by=user)
    assert tpl.version == 1
