import logging
import os

from django.apps import AppConfig
from django.contrib.auth.hashers import make_password

logger = logging.getLogger(__name__)


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'

    def ready(self):
        bootstrap_enabled = os.environ.get('BOOTSTRAP_ADMIN_ON_STARTUP', 'False').lower() in {'1', 'true', 'yes'}
        if not bootstrap_enabled:
            return

        username = os.environ.get('BOOTSTRAP_ADMIN_USERNAME', '').strip()
        email = os.environ.get('BOOTSTRAP_ADMIN_EMAIL', '').strip()
        password = os.environ.get('BOOTSTRAP_ADMIN_PASSWORD', '')

        if not username or not email or not password:
            logger.warning(
                "BOOTSTRAP_ADMIN_ON_STARTUP is enabled, but one or more admin credentials are missing."
            )
            return

        try:
            from .models import SchoolUser

            user = SchoolUser.objects(username=username).first() or SchoolUser.objects(email__iexact=email).first()
            if user:
                user.username = username
                user.email = email
                user.password = make_password(password)
                user.role = SchoolUser.ADMIN
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.save()
                logger.info("Bootstrap admin user updated.")
                return

            user = SchoolUser(
                username=username,
                email=email,
                password=make_password(password),
                role=SchoolUser.ADMIN,
                is_staff=True,
                is_superuser=True,
                is_active=True,
            )
            user.save()
            logger.info("Bootstrap admin user created.")
        except Exception:
            logger.exception("Failed to bootstrap admin user at startup.")
