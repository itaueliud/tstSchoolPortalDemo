from rest_framework import serializers

from apps.accounts.models import SchoolUser

from .models import (
    Announcement,
    Assignment,
    AssignmentMaterial,
    AssignmentSubmission,
    AttendanceRecord,
    FeeInvoice,
    FeePayment,
    GradeRecord,
    MarkEntry,
    SchoolClass,
    StudentProfile,
    StudentResult,
    TeacherProfile,
)


class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ['id', 'name', 'grade_level', 'room']


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['id', 'admission_number', 'attendance_rate', 'gpa', 'fee_balance', 'current_class']


class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = ['id', 'subject']


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'body', 'audience', 'published_at', 'is_active']


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'subject',
            'school_class',
            'created_by',
            'max_score',
            'due_date',
            'is_published',
            'published_at',
            'created_at',
            'updated_at',
        ]


class AssignmentMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentMaterial
        fields = ['id', 'assignment', 'title', 'material_type', 'content', 'created_at']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id',
            'assignment',
            'student_id',
            'submitted_at',
            'content',
            'status',
            'teacher_feedback',
            'score',
            'max_score',
            'graded_at',
        ]


class AssignmentSubmissionWriteSerializer(serializers.Serializer):
    assignment_id = serializers.CharField()
    content = serializers.CharField(max_length=4000)


class AssignmentWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=180)
    description = serializers.CharField(required=False, allow_blank=True, max_length=4000)
    subject = serializers.CharField(max_length=120)
    school_class_id = serializers.CharField()
    max_score = serializers.FloatField(required=False, min_value=1, default=100)
    due_date = serializers.DateTimeField()
    is_published = serializers.BooleanField(required=False, default=True)


class AssignmentMaterialWriteSerializer(serializers.Serializer):
    assignment_id = serializers.CharField()
    title = serializers.CharField(max_length=180)
    material_type = serializers.ChoiceField(choices=['link', 'note'], required=False, default='link')
    content = serializers.CharField(max_length=4000)


class AssignmentGradeWriteSerializer(serializers.Serializer):
    submission_id = serializers.CharField()
    teacher_feedback = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    score = serializers.FloatField(min_value=0, required=False)
    max_score = serializers.FloatField(min_value=1, required=False, default=100)
    status = serializers.ChoiceField(choices=['graded', 'returned', 'late'], required=False, default='graded')


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'student', 'date', 'status']


class FeeInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeInvoice
        fields = ['id', 'reference', 'amount', 'paid_amount', 'status', 'due_date', 'student']


class FeePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeePayment
        fields = [
            'id',
            'invoice',
            'student_id',
            'payment_method',
            'phone_number',
            'amount',
            'status',
            'checkout_request_id',
            'merchant_request_id',
            'mpesa_receipt_number',
            'result_code',
            'result_description',
            'initiated_at',
            'completed_at',
            'raw_payload',
        ]


class MpesaPaymentWriteSerializer(serializers.Serializer):
    invoice_id = serializers.CharField(required=False, allow_blank=True)
    reference = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=30)
    amount = serializers.FloatField(required=False, min_value=0)


class MpesaCallbackSerializer(serializers.Serializer):
    checkout_request_id = serializers.CharField()
    result_code = serializers.CharField(required=False, allow_blank=True)
    result_description = serializers.CharField(required=False, allow_blank=True)
    mpesa_receipt_number = serializers.CharField(required=False, allow_blank=True)
    amount = serializers.FloatField(required=False, min_value=0)
    raw_payload = serializers.JSONField(required=False)


class GradeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRecord
        fields = ['id', 'student', 'subject', 'score', 'grade', 'recorded_at']


class MarkEntrySerializer(serializers.Serializer):
    student_id = serializers.CharField()
    school_class_id = serializers.CharField()
    subject = serializers.CharField()
    assessment_name = serializers.CharField()
    score = serializers.FloatField(min_value=0)
    max_score = serializers.FloatField(min_value=1, default=100)
    term = serializers.CharField(default='term-1')


class StudentResultSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    student_name = serializers.CharField()
    admission_number = serializers.CharField()
    school_class = serializers.CharField()
    term = serializers.CharField()
    total_score = serializers.FloatField()
    max_score = serializers.FloatField()
    percentage = serializers.FloatField()
    grade = serializers.CharField()
    rank = serializers.IntegerField()


class RankingQuerySerializer(serializers.Serializer):
    school_class_id = serializers.CharField()
    term = serializers.CharField(default='term-1')


class AdminUserWriteSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    role = serializers.ChoiceField(choices=SchoolUser.ROLE_CHOICES)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=30)
    is_active = serializers.BooleanField(required=False)
    # Student-specific fields
    admission_number = serializers.CharField(required=False, allow_blank=True, max_length=40)
    class_id = serializers.CharField(required=False, allow_blank=True)
    # Teacher-specific fields
    subject = serializers.CharField(required=False, allow_blank=True, max_length=120)
    classes_taught = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    # Parent-specific fields
    student_ids = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class AdminFeeInvoiceWriteSerializer(serializers.Serializer):
    student_id = serializers.CharField(required=False, allow_blank=True)
    student_admission_number = serializers.CharField(required=False, allow_blank=True)
    reference = serializers.CharField(max_length=60)
    amount = serializers.FloatField(min_value=0)
    paid_amount = serializers.FloatField(required=False, min_value=0)
    status = serializers.ChoiceField(choices=['paid', 'pending', 'partial', 'overdue'], required=False)
    due_date = serializers.DateTimeField(required=False, allow_null=True)


class AdminClassWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    grade_level = serializers.CharField(required=False, allow_blank=True, max_length=80)
    room = serializers.CharField(required=False, allow_blank=True, max_length=40)
    class_teacher = serializers.CharField(required=False, allow_blank=True, max_length=150)


class AttendanceRecordWriteSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    school_class_id = serializers.CharField()
    date = serializers.DateField()
    status = serializers.ChoiceField(choices=['present', 'absent', 'late', 'leave'])


class AttendanceBulkSerializer(serializers.Serializer):
    school_class_id = serializers.CharField()
    date = serializers.DateField()
    records = AttendanceRecordWriteSerializer(many=True)
