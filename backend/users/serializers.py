from django.contrib.auth import authenticate, get_user_model
from rest_framework import exceptions, serializers
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


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = (
            attrs.get(self.username_field)
            or self.initial_data.get("identifier")
            or self.initial_data.get("email")
        )
        password = attrs.get("password")

        if not username_or_email or not password:
            raise exceptions.AuthenticationFailed("Missing credentials")

        user = None

        if "@" in username_or_email:
            try:
                candidate = User.objects.get(email__iexact=username_or_email)
                user = authenticate(
                    self.context.get("request"),
                    username=getattr(candidate, User.USERNAME_FIELD),
                    password=password,
                )
            except User.DoesNotExist:
                user = None

        if user is None:
            user = authenticate(
                self.context.get("request"),
                username=username_or_email,
                password=password,
            )

        if user is None:
            raise exceptions.AuthenticationFailed("No active account found")

        attrs[self.username_field] = getattr(user, user.USERNAME_FIELD)
        return super().validate(attrs)
