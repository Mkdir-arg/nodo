from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "username", "first_name", "last_name",
            "email", "is_staff", "is_superuser", "date_joined", "last_login",
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Extra claims útiles en el access token
        token["username"] = user.username
        token["email"] = user.email or ""
        token["is_staff"] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Devolvemos datos del usuario junto con los tokens
        data["user"] = UserSerializer(self.user).data
        return data
