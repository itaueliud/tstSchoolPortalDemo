from bson import ObjectId
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings

from .models import SchoolUser


class MongoJWTAuthentication(JWTAuthentication):
    """
    Resolve JWT users from mongoengine SchoolUser instead of Django's auth user model.
    """

    def get_user(self, validated_token):
        user_id = validated_token.get(api_settings.USER_ID_CLAIM)
        if user_id is None:
            raise exceptions.AuthenticationFailed("Token contained no recognizable user identification")

        candidates = [str(user_id)]
        try:
            candidates.append(ObjectId(str(user_id)))
        except Exception:
            pass

        user = None
        for candidate in candidates:
            try:
                user = SchoolUser.objects.get(id=candidate)
                break
            except SchoolUser.DoesNotExist:
                continue

        if user is None:
            raise exceptions.AuthenticationFailed("User not found", code="user_not_found")

        if not getattr(user, "is_active", True):
            raise exceptions.AuthenticationFailed("User is inactive", code="user_inactive")

        return user
