from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SchoolUser


class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    phone_number = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        identifier = attrs['identifier']
        password = attrs['password']
        role = attrs.get('role')

        user = None
        try:
            user = SchoolUser.objects.get(username=identifier)
        except SchoolUser.DoesNotExist:
            try:
                user = SchoolUser.objects.get(email__iexact=identifier)
            except SchoolUser.DoesNotExist:
                pass

        if user is None or not user.check_password(password):
            raise serializers.ValidationError('Invalid credentials.')

        if role and user.role != role:
            raise serializers.ValidationError('Selected role does not match this account.')

        refresh = RefreshToken.for_user(user)
        attrs['user'] = user
        attrs['tokens'] = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        return attrs
