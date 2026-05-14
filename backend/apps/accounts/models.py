import mongoengine as me
from django.contrib.auth.hashers import make_password, check_password
from datetime import datetime


class SchoolUser(me.Document):
    ADMIN = 'admin'
    TEACHER = 'teacher'
    STUDENT = 'student'
    PARENT = 'parent'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (TEACHER, 'Teacher'),
        (STUDENT, 'Student'),
        (PARENT, 'Parent'),
    ]

    username = me.StringField(required=True, unique=True, max_length=150)
    email = me.EmailField(required=True, unique=True)
    password = me.StringField(required=True)
    first_name = me.StringField(max_length=150)
    last_name = me.StringField(max_length=150)
    role = me.StringField(choices=['admin', 'teacher', 'student', 'parent'], default=STUDENT)
    phone_number = me.StringField(max_length=30)
    is_active = me.BooleanField(default=True)
    is_staff = me.BooleanField(default=False)
    is_superuser = me.BooleanField(default=False)
    date_joined = me.DateTimeField(default=datetime.utcnow)
    last_login = me.DateTimeField()

    meta = {'collection': 'auth_users'}

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self) -> bool:
        # DRF/Django permission classes expect this attribute on request.user.
        return True

    @property
    def is_anonymous(self) -> bool:
        return False

    @property
    def full_display_name(self) -> str:
        name = f"{self.first_name} {self.last_name}".strip()
        return name or self.username

    def __str__(self) -> str:
        return self.username
