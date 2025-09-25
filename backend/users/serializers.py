from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from rest_framework import exceptions, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    groups = serializers.PrimaryKeyRelatedField(many=True, queryset=Group.objects.all(), required=False)
    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "is_staff",
            "is_active",
            "groups",
            "date_joined",
            "last_login",
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', [])
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        user.groups.set(groups)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        
        if groups is not None:
            instance.groups.set(groups)
        
        return instance


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


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
