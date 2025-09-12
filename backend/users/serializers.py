from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_active",
            "date_joined",
            "last_login",
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Acepta username O email. Si viene 'identifier' o 'email', lo traduce a username
    para que SimpleJWT valide normalmente.
    """

    def validate(self, attrs):
        identifier = (
            attrs.get("username")
            or self.initial_data.get("identifier")
            or self.initial_data.get("email")
        )

        if identifier and "@" in identifier:
            try:
                user = User.objects.get(email__iexact=identifier)
                attrs["username"] = getattr(
                    user, User.USERNAME_FIELD, user.username
                )
            except User.DoesNotExist:
                # Dejar que SimpleJWT falle con credenciales inválidas
                pass
        else:
            attrs["username"] = identifier

        return super().validate(attrs)
