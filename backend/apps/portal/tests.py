from datetime import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from . import views


class FakeQuery:
    def __init__(self, items=None, first_item=None):
        self.items = list(items or [])
        self.first_item = first_item

    def only(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def skip(self, *args, **kwargs):
        return self

    def count(self):
        return len(self.items)

    def first(self):
        if self.first_item is not None:
            return self.first_item
        return self.items[0] if self.items else None

    def as_pymongo(self):
        return self.items

    def __iter__(self):
        return iter(self.items)


class FakeFeePayment:
    PENDING = 'pending'
    SUCCESS = 'success'
    FAILED = 'failed'
    CANCELED = 'canceled'
    PAYMENT_METHOD_MPESA = 'mpesa_stk'

    objects = None

    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 'payment-1')
        self.invoice = kwargs['invoice']
        self.student_id = kwargs['student_id']
        self.payment_method = kwargs.get('payment_method', self.PAYMENT_METHOD_MPESA)
        self.phone_number = kwargs.get('phone_number', '')
        self.amount = kwargs.get('amount', 0)
        self.status = kwargs.get('status', self.PENDING)
        self.checkout_request_id = kwargs.get('checkout_request_id', '')
        self.merchant_request_id = kwargs.get('merchant_request_id', '')
        self.mpesa_receipt_number = kwargs.get('mpesa_receipt_number', '')
        self.result_code = kwargs.get('result_code', '')
        self.result_description = kwargs.get('result_description', '')
        self.initiated_at = kwargs.get('initiated_at', datetime(2026, 5, 14, 10, 0, 0))
        self.completed_at = kwargs.get('completed_at')
        self.raw_payload = kwargs.get('raw_payload', {})

    def save(self):
        return self


class PortalParentFlowTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.parent_user = SimpleNamespace(
            id='parent-1',
            role='parent',
            username='parent.one',
            email='parent@example.com',
            phone_number='0711000000',
            full_display_name='Parent One',
        )
        self.child_one = SimpleNamespace(
            id='child-1',
            full_display_name='Child One',
            admission_number='ADM-001',
            current_class=SimpleNamespace(name='Grade 1', class_teacher='Mr Alpha'),
            attendance_rate=95,
            fee_balance=1200,
            gpa=3.4,
            user_id='student-1',
        )
        self.child_two = SimpleNamespace(
            id='child-2',
            full_display_name='Child Two',
            admission_number='ADM-002',
            current_class=SimpleNamespace(name='Grade 2', class_teacher='Ms Beta'),
            attendance_rate=88,
            fee_balance=3400,
            gpa=3.9,
            user_id='student-2',
        )
        self.parent_profile = SimpleNamespace(children_ids=[self.child_one, self.child_two])

    def _patch_dashboard_dependencies(self, active_grades=None):
        grades = active_grades or {'child-1': 'B+', 'child-2': 'A'}

        def result_query_factory(**kwargs):
            student = kwargs.get('student_id')
            return FakeQuery(first_item=SimpleNamespace(grade=grades.get(str(student.id), 'N/A')))

        announcements = [
            {'id': 'ann-1', 'title': 'Parent Meeting', 'body': 'Scheduled on Friday', 'audience': 'parent', 'published_at': '2026-05-14T08:00:00Z'},
        ]

        return patch.multiple(
            views,
            _parent_profile=MagicMock(return_value=self.parent_profile),
            StudentResult=SimpleNamespace(objects=MagicMock(side_effect=result_query_factory)),
            Announcement=SimpleNamespace(objects=MagicMock(return_value=FakeQuery(items=announcements))),
        )

    def test_parent_summary_switches_child_context_and_returns_communication(self):
        request = self.factory.get('/api/dashboard/parent/summary/?child_id=child-2')
        force_authenticate(request, user=self.parent_user)

        with self._patch_dashboard_dependencies():
            response = views.DashboardSummaryView.as_view()(request, role='parent')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data['summary']
        self.assertEqual(payload['active_child_id'], 'child-2')
        self.assertEqual(payload['child_name'], 'Child Two')
        self.assertEqual(payload['child_class'], 'Grade 2')
        self.assertEqual(payload['class_teacher'], 'Ms Beta')
        self.assertEqual(payload['admission_number'], 'ADM-002')
        self.assertEqual(payload['attendance'], '88%')
        self.assertEqual(payload['latest_grade'], 'A')
        self.assertEqual(payload['children_count'], 2)
        self.assertEqual(payload['communication']['office']['name'], 'School Office')
        self.assertEqual(payload['communication']['parent']['email'], 'parent@example.com')
        self.assertEqual(payload['communication']['active_child']['id'], 'child-2')
        self.assertEqual(payload['communication']['children'][1]['name'], 'Child Two')

    def test_parent_fee_payment_can_target_child_invoice(self):
        invoice = SimpleNamespace(
            id='invoice-1',
            reference='INV-001',
            amount=5000.0,
            paid_amount=1500.0,
            student_id=self.child_two,
        )
        request = self.factory.post(
            '/api/dashboard/fees/payments/',
            {'invoice_id': 'invoice-1', 'phone_number': '0711000000', 'amount': 2500},
            format='json',
        )
        force_authenticate(request, user=self.parent_user)

        with patch.multiple(
            views,
            _resolve_fee_invoice=MagicMock(return_value=invoice),
            _parent_profile=MagicMock(return_value=self.parent_profile),
            _mpesa_configured=MagicMock(return_value=False),
            _normalize_mpesa_phone=MagicMock(return_value='254711000000'),
            FeePayment=FakeFeePayment,
        ):
            response = views.FeePaymentCollectionView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['payment']['invoice_reference'], 'INV-001')
        self.assertEqual(response.data['payment']['phone_number'], '254711000000')
        self.assertEqual(response.data['payment']['status'], 'pending')
        self.assertIn('demo mode', response.data['message'])

    def test_parent_receipt_access_returns_pdf(self):
        invoice = SimpleNamespace(
            id='invoice-1',
            reference='INV-001',
            amount=5000.0,
            paid_amount=5000.0,
            student_id=self.child_two,
        )
        payment = SimpleNamespace(
            id='payment-1',
            invoice=invoice,
            student_id=self.child_two,
            status='success',
            amount=5000.0,
            phone_number='254711000000',
            checkout_request_id='checkout-1',
            merchant_request_id='merchant-1',
            mpesa_receipt_number='MPESA-123ABC',
            initiated_at=datetime(2026, 5, 14, 10, 0, 0),
            completed_at=datetime(2026, 5, 14, 10, 2, 0),
            raw_payload={},
        )
        fake_payment_model = SimpleNamespace(objects=SimpleNamespace(get=MagicMock(return_value=payment)))
        request = self.factory.get('/api/dashboard/fees/payments/payment-1/receipt/')
        force_authenticate(request, user=self.parent_user)

        with patch.multiple(
            views,
            _parent_profile=MagicMock(return_value=self.parent_profile),
            FeePayment=fake_payment_model,
        ):
            response = views.FeePaymentReceiptPdfView.as_view()(request, payment_id='payment-1')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('inline; filename="INV-001-receipt.pdf"', response['Content-Disposition'])
        self.assertGreater(len(response.content), 0)


class PortalAdminSmokeTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin_user = SimpleNamespace(id='admin-1', role='admin', username='admin.one', full_display_name='Admin One')
        self.student_one = SimpleNamespace(id='student-1', user_id='user-1', admission_number='ADM-101', current_class=SimpleNamespace(name='Grade 1'), attendance_rate=92, fee_balance=1200)
        self.student_two = SimpleNamespace(id='student-2', user_id='user-2', admission_number='ADM-102', current_class=SimpleNamespace(name='Grade 2'), attendance_rate=88, fee_balance=2400)
        self.teacher_one = SimpleNamespace(id='teacher-1', user_id='teacher-user-1', subject='Math')
        self.school_class = SimpleNamespace(id='class-1', name='Grade 1', grade_level='G1', room='A1', class_teacher='Mr Alpha')
        self.invoice = SimpleNamespace(id='invoice-1', reference='INV-100', amount=5000.0, paid_amount=3000.0, status='pending', due_date=datetime(2026, 5, 20), student_id=self.student_one)
        self.announcement = {'id': 'ann-1', 'title': 'Term Opening', 'body': 'School opens on Monday', 'audience': 'all', 'published_at': '2026-05-14T08:00:00Z'}

    def _make_user_collection(self, users):
        collection = MagicMock()
        collection.order_by.return_value = FakeQuery(items=users)
        collection.get.side_effect = lambda **kwargs: {'user-1': SimpleNamespace(id='user-1', username='student.one', full_display_name='Student One', email='student1@example.com', role='student', is_active=True), 'user-2': SimpleNamespace(id='user-2', username='student.two', full_display_name='Student Two', email='student2@example.com', role='student', is_active=True), 'teacher-user-1': SimpleNamespace(id='teacher-user-1', username='teacher.one', full_display_name='Teacher One', email='teacher1@example.com', role='teacher', is_active=True)}[str(kwargs.get('id'))]
        return collection

    def test_admin_overview_returns_live_metrics(self):
        students_collection = MagicMock(return_value=FakeQuery(items=[self.student_one]))
        students_collection.order_by.return_value = FakeQuery(items=[self.student_one, self.student_two])
        teachers_collection = MagicMock()
        teachers_collection.order_by.return_value = FakeQuery(items=[self.teacher_one])
        classes_collection = MagicMock()
        classes_collection.order_by.return_value = FakeQuery(items=[self.school_class])
        invoices_collection = FakeQuery(items=[self.invoice])
        assignments_collection = MagicMock(return_value=FakeQuery(items=[SimpleNamespace(id='assignment-1', school_class=self.school_class, due_date=datetime(2026, 5, 18))]))
        submissions_collection = FakeQuery(items=[])
        users_collection = self._make_user_collection([SimpleNamespace(id='user-1', username='student.one', full_display_name='Student One', email='student1@example.com', role='student', is_active=True), SimpleNamespace(id='user-2', username='student.two', full_display_name='Student Two', email='student2@example.com', role='student', is_active=True), SimpleNamespace(id='teacher-user-1', username='teacher.one', full_display_name='Teacher One', email='teacher1@example.com', role='teacher', is_active=True)])

        request = self.factory.get('/api/dashboard/admin/overview/')
        force_authenticate(request, user=self.admin_user)

        with patch.multiple(
            views,
            StudentProfile=SimpleNamespace(objects=students_collection),
            TeacherProfile=SimpleNamespace(objects=teachers_collection),
            SchoolClass=SimpleNamespace(objects=classes_collection),
            FeeInvoice=SimpleNamespace(objects=invoices_collection),
            Announcement=SimpleNamespace(objects=MagicMock(return_value=FakeQuery(items=[self.announcement]))),
            Assignment=SimpleNamespace(objects=assignments_collection),
            AssignmentSubmission=SimpleNamespace(objects=MagicMock(return_value=submissions_collection)),
            SchoolUser=SimpleNamespace(objects=users_collection),
        ):
            response = views.AdminOverviewView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['students'], 2)
        self.assertEqual(response.data['summary']['teachers'], 1)
        self.assertEqual(response.data['summary']['classes'], 1)
        self.assertEqual(response.data['lms_analytics']['published_assignments'], 1)
        self.assertEqual(response.data['users'][0]['name'], 'Student One')
        self.assertEqual(response.data['fees'][0]['reference'], 'INV-100')

    def test_admin_class_create_returns_serialized_class(self):
        class FakeSchoolClassModel:
            objects = MagicMock()

            def __init__(self, **kwargs):
                self.id = 'class-created-1'
                self.name = kwargs['name']
                self.grade_level = kwargs.get('grade_level', '')
                self.room = kwargs.get('room', '')
                self.class_teacher = kwargs.get('class_teacher', '')

            def save(self):
                return self

        FakeSchoolClassModel.objects.return_value = FakeQuery(items=[])

        student_objects = MagicMock()
        student_objects.return_value = FakeQuery(items=[])
        student_objects.current_class = None

        request = self.factory.post(
            '/api/dashboard/admin/classes/',
            {'name': 'Grade 3', 'grade_level': 'G3', 'room': 'B2', 'class_teacher': 'Ms Gamma'},
            format='json',
        )
        force_authenticate(request, user=self.admin_user)

        with patch.multiple(
            views,
            SchoolClass=FakeSchoolClassModel,
            StudentProfile=SimpleNamespace(objects=student_objects),
        ):
            response = views.AdminClassCollectionView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['class']['name'], 'Grade 3')
        self.assertEqual(response.data['class']['class_teacher'], 'Ms Gamma')

    def test_admin_user_create_returns_serialized_user(self):
        class FakeSchoolUserModel:
            ADMIN = 'admin'
            objects = MagicMock()

            def __init__(self, **kwargs):
                self.id = 'user-created-1'
                self.username = kwargs['username']
                self.email = kwargs['email']
                self.first_name = kwargs.get('first_name', '')
                self.last_name = kwargs.get('last_name', '')
                self.role = kwargs.get('role', 'teacher')
                self.phone_number = kwargs.get('phone_number', '')
                self.is_active = kwargs.get('is_active', True)
                self.is_staff = self.role == self.ADMIN

            def set_password(self, raw_password):
                self.password = raw_password

            def save(self):
                return self

            @property
            def full_display_name(self):
                return f'{self.first_name} {self.last_name}'.strip() or self.username

        FakeSchoolUserModel.objects.return_value = FakeQuery(items=[])
        FakeSchoolUserModel.objects.order_by.return_value = FakeQuery(items=[])

        request = self.factory.post(
            '/api/dashboard/admin/users/',
            {
                'username': 'new.parent',
                'email': 'new.parent@example.com',
                'password': 'secret123',
                'first_name': 'New',
                'last_name': 'Parent',
                'role': 'parent',
                'phone_number': '0712000000',
            },
            format='json',
        )
        force_authenticate(request, user=self.admin_user)

        with patch.object(views, 'SchoolUser', FakeSchoolUserModel):
            response = views.AdminUserCollectionView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'new.parent')
        self.assertEqual(response.data['user']['role'], 'parent')


class PortalTeacherTimetableTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.teacher_user = SimpleNamespace(id='teacher-1', role='teacher', username='teacher.one', full_display_name='Teacher One')
        self.admin_user = SimpleNamespace(id='admin-1', role='admin', username='admin.one', full_display_name='Admin One')
        self.school_class = SimpleNamespace(id='class-1', name='Grade 1', grade_level='G1', room='A1')

    def test_teacher_timetable_get_returns_entries_and_classes(self):
        timetable_entry = SimpleNamespace(
            id='timetable-1',
            teacher_id='teacher-1',
            school_class=self.school_class,
            subject='Mathematics',
            day_of_week='monday',
            start_time='09:00',
            end_time='10:00',
            room='Room 12',
            week_start=datetime(2026, 5, 11).date(),
            status='pending',
            notes='Take attendance',
            updated_at=datetime(2026, 5, 10, 8, 0, 0),
        )

        entries_collection = MagicMock(return_value=FakeQuery(items=[timetable_entry]))
        classes_collection = MagicMock()
        classes_collection.order_by.return_value = FakeQuery(items=[self.school_class])

        request = self.factory.get('/api/dashboard/timetable/?week_start=2026-05-11')
        force_authenticate(request, user=self.teacher_user)

        with patch.multiple(
            views,
            TeacherTimetableEntry=SimpleNamespace(objects=entries_collection),
            SchoolClass=SimpleNamespace(objects=classes_collection),
            _teacher_classes=MagicMock(return_value=[self.school_class]),
        ):
            response = views.TeacherTimetableView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['total'], 1)
        self.assertEqual(response.data['classes'][0]['name'], 'Grade 1')
        self.assertEqual(response.data['entries'][0]['subject'], 'Mathematics')

    def test_admin_timetable_get_includes_teacher_options(self):
        teacher_profile = SimpleNamespace(user_id='teacher-user-1', subject='Mathematics')
        user_collection = SimpleNamespace(get=MagicMock(return_value=SimpleNamespace(id='teacher-user-1', full_display_name='Teacher One', username='teacher.one')))

        request = self.factory.get('/api/dashboard/timetable/?week_start=2026-05-11')
        force_authenticate(request, user=self.admin_user)

        with patch.multiple(
            views,
            TeacherTimetableEntry=SimpleNamespace(objects=MagicMock(return_value=FakeQuery(items=[]))),
            TeacherProfile=SimpleNamespace(objects=SimpleNamespace(first=MagicMock(return_value=teacher_profile), order_by=MagicMock(return_value=[teacher_profile]))),
            SchoolClass=SimpleNamespace(objects=SimpleNamespace(order_by=MagicMock(return_value=FakeQuery(items=[self.school_class])))),
            SchoolUser=SimpleNamespace(objects=user_collection, DoesNotExist=Exception),
        ):
            response = views.TeacherTimetableView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['teacher_id'], 'teacher-user-1')
        self.assertEqual(response.data['teachers'][0]['name'], 'Teacher One')

    def test_teacher_timetable_post_marks_entry_and_exports_csv(self):
        created_entries = []

        class FakeTeacherTimetableEntry:
            objects = MagicMock()
            default_school_class = None

            def __init__(self, **kwargs):
                self.id = kwargs.get('id', f'timetable-{len(created_entries) + 1}')
                self.teacher_id = kwargs.get('teacher_id', 'teacher-1')
                self.school_class = kwargs.get('school_class', self.default_school_class)
                self.subject = kwargs.get('subject', '')
                self.day_of_week = kwargs.get('day_of_week', '')
                self.start_time = kwargs.get('start_time', '')
                self.end_time = kwargs.get('end_time', '')
                self.room = kwargs.get('room', '')
                self.week_start = kwargs.get('week_start', datetime(2026, 5, 11).date())
                self.status = kwargs.get('status', 'pending')
                self.notes = kwargs.get('notes', '')
                self.updated_at = kwargs.get('updated_at', datetime(2026, 5, 11, 8, 0, 0))

            def save(self):
                if self not in created_entries:
                    created_entries.append(self)
                return self

            def delete(self):
                if self in created_entries:
                    created_entries.remove(self)

        def entry_lookup(**kwargs):
            if kwargs.get('id'):
                matches = [item for item in created_entries if item.id == kwargs['id']]
                return FakeQuery(items=matches)
            matches = [item for item in created_entries if str(item.teacher_id) == str(kwargs.get('teacher_id')) and item.week_start == kwargs.get('week_start')]
            return FakeQuery(items=matches)

        FakeTeacherTimetableEntry.objects.side_effect = entry_lookup
        FakeTeacherTimetableEntry.default_school_class = self.school_class

        post_request = self.factory.post(
            '/api/dashboard/timetable/',
            {
                'week_start': '2026-05-11',
                'school_class_id': 'class-1',
                'subject': 'Mathematics',
                'day_of_week': 'monday',
                'start_time': '09:00',
                'end_time': '10:00',
                'room': 'Room 12',
                'status': 'completed',
                'notes': 'Lesson covered',
            },
            format='json',
        )
        force_authenticate(post_request, user=self.teacher_user)

        export_request = self.factory.get('/api/dashboard/timetable/export/?week_start=2026-05-11')
        force_authenticate(export_request, user=self.teacher_user)

        with patch.multiple(
            views,
            TeacherTimetableEntry=FakeTeacherTimetableEntry,
            SchoolClass=SimpleNamespace(objects=SimpleNamespace(get=MagicMock(return_value=self.school_class), order_by=MagicMock(return_value=FakeQuery(items=[self.school_class])))),
            _teacher_classes=MagicMock(return_value=[self.school_class]),
        ):
            post_response = views.TeacherTimetableView.as_view()(post_request)
            export_response = views.TeacherTimetableExportView.as_view()(export_request)

        self.assertEqual(post_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(post_response.data['entries'][0]['status'], 'completed')
        self.assertEqual(export_response.status_code, status.HTTP_200_OK)
        self.assertEqual(export_response['Content-Type'], 'text/csv')
        self.assertIn('teacher-timetable-2026-05-11.csv', export_response['Content-Disposition'])
        self.assertIn('Mathematics', export_response.content.decode())
