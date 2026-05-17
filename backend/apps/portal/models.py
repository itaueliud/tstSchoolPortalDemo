import mongoengine as me
from datetime import datetime


class SchoolClass(me.Document):
    name = me.StringField(required=True, max_length=120)
    grade_level = me.StringField(max_length=80)
    room = me.StringField(max_length=40)
    class_teacher = me.StringField()

    meta = {'collection': 'school_classes'}

    def __str__(self) -> str:
        return self.name


class StudentProfile(me.Document):
    user_id = me.ObjectIdField(required=True)
    admission_number = me.StringField(required=True, unique=True, max_length=40)
    current_class = me.ReferenceField(SchoolClass, null=True)
    attendance_rate = me.FloatField(default=0)
    gpa = me.FloatField(default=0)
    fee_balance = me.FloatField(default=0)

    meta = {'collection': 'student_profiles'}

    def __str__(self) -> str:
        return f"Student {self.admission_number}"


class TeacherProfile(me.Document):
    user_id = me.ObjectIdField(required=True)
    subject = me.StringField(max_length=120)
    classes_taught = me.ListField(me.ReferenceField(SchoolClass))

    meta = {'collection': 'teacher_profiles'}

    def __str__(self) -> str:
        return f"Teacher {self.user_id}"


class TeacherTimetableEntry(me.Document):
    PENDING = 'pending'
    COMPLETED = 'completed'
    MISSED = 'missed'
    RESCHEDULED = 'rescheduled'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'),
        (MISSED, 'Missed'),
        (RESCHEDULED, 'Rescheduled'),
    ]

    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    teacher_id = me.ObjectIdField(required=True)
    school_class = me.ReferenceField(SchoolClass, required=True)
    subject = me.StringField(required=True, max_length=120)
    day_of_week = me.StringField(required=True, choices=[choice[0] for choice in DAY_CHOICES], max_length=20)
    start_time = me.StringField(required=True, max_length=10)
    end_time = me.StringField(required=True, max_length=10)
    room = me.StringField(default='', max_length=40)
    week_start = me.DateField(required=True)
    status = me.StringField(default=PENDING, choices=[choice[0] for choice in STATUS_CHOICES], max_length=20)
    notes = me.StringField(default='', max_length=1000)
    updated_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'teacher_timetable_entries',
        'indexes': [
            ('teacher_id', 'week_start'),
            ('teacher_id', 'week_start', 'day_of_week', 'start_time'),
            ('school_class', 'week_start'),
        ],
    }

    def __str__(self) -> str:
        return f"{self.subject} {self.day_of_week} {self.start_time}"


class ParentProfile(me.Document):
    user_id = me.ObjectIdField(required=True)
    children_ids = me.ListField(me.ReferenceField(StudentProfile))

    meta = {'collection': 'parent_profiles'}

    def __str__(self) -> str:
        return f"Parent {self.user_id}"


class Announcement(me.Document):
    title = me.StringField(required=True, max_length=180)
    body = me.StringField(required=True)
    audience = me.StringField(default='all', max_length=40)
    published_at = me.DateTimeField(default=datetime.utcnow)
    is_active = me.BooleanField(default=True)

    meta = {
        'collection': 'announcements',
        'indexes': ['-published_at']
    }

    def __str__(self) -> str:
        return self.title


class AdminAuditLog(me.Document):
    action = me.StringField(required=True, max_length=40)
    entity_type = me.StringField(required=True, max_length=40)
    entity_id = me.StringField(required=True, max_length=80)
    actor_id = me.StringField(required=True, max_length=80)
    actor_username = me.StringField(required=True, max_length=150)
    details = me.DictField(default=dict)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'admin_audit_logs',
        'indexes': ['-created_at', ('entity_type', 'entity_id')],
    }

    def __str__(self) -> str:
        return f'{self.action} {self.entity_type} {self.entity_id}'


class AttendanceRecord(me.Document):
    PRESENT = 'present'
    ABSENT = 'absent'
    LATE = 'late'
    LEAVE = 'leave'

    STATUS_CHOICES = [
        (PRESENT, 'Present'),
        (ABSENT, 'Absent'),
        (LATE, 'Late'),
        (LEAVE, 'Leave'),
    ]

    student_id = me.ReferenceField(StudentProfile, required=True)
    date = me.DateTimeField(required=True)
    status = me.StringField(choices=['present', 'absent', 'late', 'leave'], required=True)

    meta = {
        'collection': 'attendance_records',
        'indexes': [('student_id', 'date')]
    }


class FeeInvoice(me.Document):
    PAID = 'paid'
    PENDING = 'pending'
    PARTIAL = 'partial'
    OVERDUE = 'overdue'

    student_id = me.ReferenceField(StudentProfile, required=True)
    reference = me.StringField(required=True, unique=True, max_length=60)
    amount = me.FloatField(required=True)
    paid_amount = me.FloatField(default=0)
    status = me.StringField(choices=['paid', 'pending', 'partial', 'overdue'], default=PENDING)
    due_date = me.DateTimeField()

    meta = {
        'collection': 'fee_invoices',
        'indexes': ['-due_date', '-id']
    }


class FeePayment(me.Document):
    PENDING = 'pending'
    SUCCESS = 'success'
    FAILED = 'failed'
    CANCELED = 'canceled'

    PAYMENT_STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SUCCESS, 'Success'),
        (FAILED, 'Failed'),
        (CANCELED, 'Canceled'),
    ]

    PAYMENT_METHOD_MPESA = 'mpesa_stk'
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_METHOD_MPESA, 'M-Pesa STK Push'),
    ]

    invoice = me.ReferenceField(FeeInvoice, required=True)
    student_id = me.ReferenceField(StudentProfile, required=True)
    payment_method = me.StringField(default=PAYMENT_METHOD_MPESA, choices=['mpesa_stk'])
    phone_number = me.StringField(required=True, max_length=30)
    amount = me.FloatField(required=True, min_value=0)
    status = me.StringField(default=PENDING, choices=['pending', 'success', 'failed', 'canceled'])
    checkout_request_id = me.StringField(unique=True, max_length=100)
    merchant_request_id = me.StringField(max_length=100)
    mpesa_receipt_number = me.StringField(max_length=100)
    result_code = me.StringField(max_length=20)
    result_description = me.StringField(max_length=500)
    initiated_at = me.DateTimeField(default=datetime.utcnow)
    completed_at = me.DateTimeField()
    raw_payload = me.DictField(default=dict)

    meta = {
        'collection': 'fee_payments',
        'indexes': [
            ('invoice', '-initiated_at'),
            ('student_id', '-initiated_at'),
            ('checkout_request_id',),
            ('status', '-initiated_at'),
        ],
    }


class Assignment(me.Document):
    title = me.StringField(required=True, max_length=180)
    description = me.StringField(default='', max_length=4000)
    subject = me.StringField(required=True, max_length=120)
    school_class = me.ReferenceField(SchoolClass, required=True)
    created_by = me.ObjectIdField(required=True)
    max_score = me.FloatField(default=100, min_value=1)
    due_date = me.DateTimeField(required=True)
    is_published = me.BooleanField(default=True)
    published_at = me.DateTimeField()
    created_at = me.DateTimeField(default=datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'assignments',
        'indexes': ['-due_date', '-created_at', ('school_class', 'is_published')],
    }

    def __str__(self) -> str:
        return self.title


class AssignmentMaterial(me.Document):
    assignment = me.ReferenceField(Assignment, required=True)
    title = me.StringField(required=True, max_length=180)
    material_type = me.StringField(choices=['link', 'note'], default='link')
    content = me.StringField(required=True, max_length=4000)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'assignment_materials',
        'indexes': [('assignment', '-created_at')],
    }


class AssignmentSubmission(me.Document):
    """Student submission for a published assignment."""

    class SubmissionStatus:
        SUBMITTED = 'submitted'
        GRADED = 'graded'
        RETURNED = 'returned'
        LATE = 'late'

    assignment = me.ReferenceField(Assignment, required=True)
    student_id = me.ReferenceField(StudentProfile, required=True)
    submitted_at = me.DateTimeField(default=datetime.utcnow)

    # For production you may want a file storage integration.
    # This demo uses plain text to keep the flow functional without extra storage.
    content = me.StringField(required=True)

    status = me.StringField(
        required=True,
        choices=['submitted', 'graded', 'returned', 'late'],
        default='submitted',
    )

    # Optional teacher feedback/score
    teacher_feedback = me.StringField(default='', max_length=2000)
    score = me.FloatField(default=0)
    max_score = me.FloatField(default=100, min_value=1)
    graded_at = me.DateTimeField()
    unique_key = me.StringField(required=True, unique=True, max_length=120)

    meta = {
        'collection': 'assignment_submissions',
        'indexes': [
            ('assignment', 'student_id'),
            'unique_key',
            ('-submitted_at',),
        ],
    }


def assignment_submission_unique_key(assignment: 'Assignment', student: 'StudentProfile') -> str:
    return f'{assignment.id}:{student.id}'


class GradeRecord(me.Document):
    student_id = me.ReferenceField(StudentProfile, required=True)
    subject = me.StringField(required=True, max_length=120)
    score = me.IntField(required=True)
    grade = me.StringField(required=True, max_length=10)
    recorded_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'grade_records',
        'indexes': ['-recorded_at']
    }


class MarkEntry(me.Document):
    student_id = me.ReferenceField(StudentProfile, required=True)
    school_class = me.ReferenceField(SchoolClass, required=True)
    subject = me.StringField(required=True, max_length=120)
    assessment_name = me.StringField(required=True, max_length=180)
    score = me.FloatField(required=True, min_value=0)
    max_score = me.FloatField(required=True, min_value=1, default=100)
    term = me.StringField(required=True, default='term-1', max_length=40)
    teacher_id = me.ObjectIdField()
    recorded_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'mark_entries',
        'indexes': [
            ('student_id', 'school_class', 'term'),
            ('school_class', 'term', 'subject'),
        ],
    }


class StudentResult(me.Document):
    student_id = me.ReferenceField(StudentProfile, required=True)
    school_class = me.ReferenceField(SchoolClass, required=True)
    term = me.StringField(required=True, max_length=40)
    total_score = me.FloatField(default=0)
    max_score = me.FloatField(default=0)
    percentage = me.FloatField(default=0)
    grade = me.StringField(default='E', max_length=10)
    rank = me.IntField(default=0)
    updated_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'student_results',
        'indexes': [
            ('school_class', 'term'),
            ('student_id', 'school_class', 'term'),
        ],
    }


GRADE_BANDS = [
    (90, 'A+'),
    (80, 'A'),
    (75, 'B+'),
    (70, 'B'),
    (65, 'B-'),
    (60, 'C+'),
    (55, 'C'),
    (50, 'C-'),
    (45, 'D+'),
    (40, 'D'),
]


def calculate_grade(percentage: float) -> str:
    for threshold, grade in GRADE_BANDS:
        if percentage >= threshold:
            return grade
    return 'E'


def update_student_result(student: StudentProfile, school_class: SchoolClass, term: str):
    entries = list(MarkEntry.objects(student_id=student, school_class=school_class, term=term))
    if not entries:
        result = StudentResult.objects(student_id=student, school_class=school_class, term=term).first()
        if result:
            result.delete()
        return None

    total_score = float(sum(entry.score for entry in entries))
    max_score = float(sum(entry.max_score for entry in entries))
    percentage = round((total_score / max_score) * 100, 2) if max_score else 0
    grade = calculate_grade(percentage)

    result = StudentResult.objects(student_id=student, school_class=school_class, term=term).first()
    if result is None:
        result = StudentResult(student_id=student, school_class=school_class, term=term)

    result.total_score = total_score
    result.max_score = max_score
    result.percentage = percentage
    result.grade = grade
    result.updated_at = datetime.utcnow()
    result.save()
    return result


def update_class_rankings(school_class: SchoolClass, term: str):
    results = list(
        StudentResult.objects(school_class=school_class, term=term)
        .order_by('-percentage', 'student_id')
    )

    for index, result in enumerate(results, start=1):
        result.rank = index
        result.save()

    return results
