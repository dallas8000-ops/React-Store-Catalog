import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_home(client):
    response = client.get(reverse("shop:home"))
    assert response.status_code == 200
    assert b"Computer Gadgets" in response.content or b"Gadget" in response.content


def test_health(client):
    response = client.get(reverse("shop:health"))
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
