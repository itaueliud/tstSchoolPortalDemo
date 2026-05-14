from io import BytesIO
from datetime import date, datetime, time
import base64
import json
import secrets
import urllib.error
import urllib.parse
import urllib.request

import mongoengine as me
from mongoengine import Q
from django.conf import settings
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from apps.accounts.models import SchoolUser

from .models import (
    Announcement,
    Assignment,
    AssignmentMaterial,
    AdminAuditLog,
    FeeInvoice,
    FeePayment,
    AttendanceRecord,
    GradeRecord,
    MarkEntry,
    ParentProfile,
    SchoolClass,
    StudentProfile,
    StudentResult,
    TeacherProfile,
    AssignmentSubmission,
    update_class_rankings,
    update_student_result,
    assignment_submission_unique_key,
)
from .serializers import (
    AdminFeeInvoiceWriteSerializer,
    AdminClassWriteSerializer,
    AttendanceBulkSerializer,
    AttendanceRecordWriteSerializer,
    AdminUserWriteSerializer,
    MarkEntrySerializer,
    RankingQuerySerializer,
    StudentResultSerializer,
    AssignmentSerializer,
    AssignmentWriteSerializer,
    AssignmentMaterialSerializer,
    AssignmentMaterialWriteSerializer,
    AssignmentSubmissionSerializer,
    AssignmentSubmissionWriteSerializer,
    AssignmentGradeWriteSerializer,
    FeePaymentSerializer,
    MpesaPaymentWriteSerializer,
    MpesaCallbackSerializer,
)


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, role: str):
        role = role.lower()
        self._requested_child_id = request.query_params.get('child_id', '').strip() if role == 'parent' else ''
        payload = {
            'role': role,
            'summary': self._summary_for_role(role, request.user),
            'announcements': list(
                Announcement.objects(is_active=True)
                .only('id', 'title', 'body', 'audience', 'published_at')
                .limit(5)
                .as_pymongo()
            ),
        }
        return Response(payload)

    def _summary_for_role(self, role: str, user: SchoolUser):
        if role == 'admin':
            students = StudentProfile.objects.count() or 842
            teachers = TeacherProfile.objects.count() or 36
            classes = SchoolClass.objects.count() or 24
            
            fee_total = 0
            try:
                invoices = FeeInvoice.objects()
                fee_total = sum(float(inv.paid_amount) for inv in invoices) or 1590800
            except Exception:
                fee_total = 1590800
            
            return {
                'students': students,
                'teachers': teachers,
                'classes': classes,
                'revenue': str(fee_total),
            }

        if role == 'teacher':
            try:
                teacher_profile = TeacherProfile.objects.get(user_id=user.id)
                class_count = len(teacher_profile.classes_taught) if teacher_profile.classes_taught else 3
            except TeacherProfile.DoesNotExist:
                class_count = 3
            
            student_count = StudentProfile.objects.count() or 120
            assignment_count = Assignment.objects(is_published=True).count() or 8
            pending_grades = 14
            
            return {
                'classes': class_count,
                'students': student_count,
                'assignments': assignment_count,
                'pending_grades': pending_grades,
            }

        if role == 'student':
            try:
                student_profile = StudentProfile.objects.get(user_id=user.id)
                attendance = str(student_profile.attendance_rate) if student_profile else '92'
                balance = str(student_profile.fee_balance) if student_profile else '12450'
                assignment_count = Assignment.objects(school_class=student_profile.current_class, is_published=True).count() if student_profile.current_class else 0
            except StudentProfile.DoesNotExist:
                attendance = '92'
                balance = '12450'
                assignment_count = 3
            
            return {
                'next_class': 'Mathematics - 09:00 AM',
                'attendance': attendance,
                'fees_due': balance,
                'assignments': assignment_count,
            }

        if role == 'parent':
            parent_profile = _parent_profile(user)
            if not parent_profile:
                return {
                    'child_name': 'No child linked',
                    'attendance': '0',
                    'fees_due': '0',
                    'latest_grade': 'N/A',
                    'communication': _parent_communication_payload(user, None, []),
                }

            children = [child for child in parent_profile.children_ids if child is not None]
            primary_child = children[0] if children else None
            requested_child_id = getattr(self, '_requested_child_id', '')
            active_child = _select_parent_child(children, requested_child_id) or primary_child
            fee_due_total = sum(max(float(child.fee_balance or 0), 0) for child in children)
            child_rows = [_serialize_parent_child(child) for child in children]

            latest_grade = 'N/A'
            if active_child:
                latest_result = StudentResult.objects(student_id=active_child).order_by('-updated_at').first()
                if latest_result:
                    latest_grade = latest_result.grade
                elif active_child.gpa:
                    latest_grade = f'{float(active_child.gpa):.1f}'

            return {
                'child_name': active_child.full_display_name if active_child else 'No child linked',
                'child_class': active_child.current_class.name if active_child and active_child.current_class else '',
                'class_teacher': active_child.current_class.class_teacher if active_child and active_child.current_class else '',
                'admission_number': active_child.admission_number if active_child else '',
                'attendance': f'{float(active_child.attendance_rate or 0):.0f}%' if active_child else '0%',
                'fees_due': f'{fee_due_total:,.0f}',
                'latest_grade': latest_grade,
                'children_count': len(children),
                'primary_child_id': str(primary_child.id) if primary_child else '',
                'active_child_id': str(active_child.id) if active_child else '',
                'children': child_rows,
                'communication': _parent_communication_payload(user, active_child, children),
            }

        return {
            'message': 'Role dashboard summary not available.',
        }


class AdminOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can access overview data.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            students = list(StudentProfile.objects.order_by('admission_number'))
            teachers = list(TeacherProfile.objects.order_by('subject'))
            classes = list(SchoolClass.objects.order_by('name'))
            invoices = list(FeeInvoice.objects.order_by('-due_date').limit(12))
            announcements = list(
                Announcement.objects(is_active=True)
                .only('id', 'title', 'body', 'audience', 'published_at')
                .order_by('-published_at')
                .limit(5)
                .as_pymongo()
            )

            report_items = self._report_items()
            analytics = self._analytics()
            lms_analytics = self._lms_analytics()

            # Safe aggregations with null checks
            total_paid = sum(float(invoice.paid_amount or 0) for invoice in invoices)
            pending_balance = sum(max(float(invoice.amount or 0) - float(invoice.paid_amount or 0), 0) for invoice in invoices)

            # Build fees list with safe attribute access
            fees_list = []
            for invoice in invoices[:10]:
                try:
                    student = invoice.student_id
                    if student:
                        class_name = student.current_class.name if student.current_class else 'N/A'
                    else:
                        class_name = 'N/A'
                    
                    fees_list.append({
                        'reference': invoice.reference,
                        'student': student.admission_number if student else 'Unknown',
                        'class': class_name,
                        'amount': f'{float(invoice.amount or 0):,.0f}',
                        'paid': f'{float(invoice.paid_amount or 0):,.0f}',
                        'status': invoice.status.title() if invoice.status else 'Unknown',
                    })
                except Exception as e:
                    # Skip malformed invoices
                    continue

            return Response({
                'summary': {
                    'students': len(students),
                    'teachers': len(teachers),
                    'classes': len(classes),
                    'revenue': f'{total_paid:,.0f}',
                    'pending_balance': f'{pending_balance:,.0f}',
                },
                'analytics': analytics,
                'lms_analytics': lms_analytics,
                'users': [
                    {
                        'id': str(user.id),
                        'name': user.full_display_name,
                        'role': user.role.title(),
                        'email': user.email,
                        'status': 'Active' if user.is_active else 'Inactive',
                    }
                    for user in self._admin_users(students, teachers)
                ],
                'fees': fees_list,
                'reports': report_items,
                'announcements': announcements,
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Error loading admin overview data.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _admin_users(self, students, teachers):
        combined = []
        seen = set()

        for student in students:
            try:
                user = SchoolUser.objects.get(id=student.user_id)
                if str(user.id) not in seen:
                    combined.append(user)
                    seen.add(str(user.id))
            except SchoolUser.DoesNotExist:
                continue

        for teacher in teachers:
            try:
                user = SchoolUser.objects.get(id=teacher.user_id)
                if str(user.id) not in seen:
                    combined.append(user)
                    seen.add(str(user.id))
            except SchoolUser.DoesNotExist:
                continue

        for user in SchoolUser.objects.order_by('role', 'username').limit(8):
            if str(user.id) not in seen:
                combined.append(user)
                seen.add(str(user.id))

        return combined[:12]

    def _analytics(self):
        months = [
            ('Jan', 1),
            ('Feb', 2),
            ('Mar', 3),
            ('Apr', 4),
            ('May', 5),
        ]

        average_attendance = 0
        students = list(StudentProfile.objects)
        if students:
            average_attendance = round(sum(float(student.attendance_rate or 0) for student in students) / len(students), 2)

        fee_monthly = []
        for month_name, month_number in months:
            month_entries = [invoice for invoice in FeeInvoice.objects if getattr(invoice.due_date, 'month', None) == month_number]
            month_paid = sum(float(invoice.paid_amount) for invoice in month_entries) if month_entries else 0
            month_attendance = average_attendance or max(75, 90 - (5 - month_number) * 2)
            fee_monthly.append({
                'month': month_name,
                'attendance': int(month_attendance),
                'revenue': int(month_paid / 1000) if month_paid else 120 + month_number * 12,
            })

        return fee_monthly

    def _lms_analytics(self):
        assignments = list(Assignment.objects(is_published=True))
        submissions = list(AssignmentSubmission.objects)

        expected_submissions = 0
        for assignment in assignments:
            expected_submissions += StudentProfile.objects(current_class=assignment.school_class).count()

        total_submissions = len(submissions)
        late_submissions = 0
        graded_submissions = 0
        turnaround_hours = []

        for submission in submissions:
            is_late = submission.status == AssignmentSubmission.SubmissionStatus.LATE
            if submission.assignment and submission.assignment.due_date and submission.submitted_at:
                if submission.submitted_at > submission.assignment.due_date:
                    is_late = True
            if is_late:
                late_submissions += 1

            if submission.graded_at:
                graded_submissions += 1
                if submission.submitted_at:
                    elapsed_hours = (submission.graded_at - submission.submitted_at).total_seconds() / 3600
                    if elapsed_hours >= 0:
                        turnaround_hours.append(elapsed_hours)

        submission_rate = round((total_submissions / expected_submissions) * 100, 2) if expected_submissions else 0
        late_rate = round((late_submissions / total_submissions) * 100, 2) if total_submissions else 0
        average_turnaround_hours = round(sum(turnaround_hours) / len(turnaround_hours), 2) if turnaround_hours else 0

        return {
            'published_assignments': len(assignments),
            'expected_submissions': expected_submissions,
            'submitted': total_submissions,
            'submission_rate': submission_rate,
            'late_submissions': late_submissions,
            'late_rate': late_rate,
            'graded_submissions': graded_submissions,
            'pending_grading': max(total_submissions - graded_submissions, 0),
            'average_grading_turnaround_hours': average_turnaround_hours,
        }

    def _report_items(self):
        return [
            {'name': 'Monthly Attendance Report', 'date': datetime.utcnow().strftime('%Y-%m-%d'), 'type': 'PDF', 'key': 'attendance'},
            {'name': 'Fee Collection Summary', 'date': datetime.utcnow().strftime('%Y-%m-%d'), 'type': 'PDF', 'key': 'fees'},
            {'name': 'Student Performance', 'date': datetime.utcnow().strftime('%Y-%m-%d'), 'type': 'PDF', 'key': 'performance'},
        ]


class AdminActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            blocked = self._require_admin(request)
            if blocked:
                return blocked

            page, page_size = self._pagination(request)
            queryset = AdminAuditLog.objects.order_by('-created_at')
            total = queryset.count()
            items = list(queryset.skip((page - 1) * page_size).limit(page_size))

            return Response({
                'items': [
                    {
                        'id': str(item.id),
                        'action': item.action,
                        'entity_type': item.entity_type,
                        'entity_id': item.entity_id,
                        'actor_username': item.actor_username,
                        'details': item.details,
                        'created_at': item.created_at.isoformat() if item.created_at else '',
                    }
                    for item in items
                ],
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': max((total + page_size - 1) // page_size, 1),
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Error loading activity logs.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _pagination(self, request):
        try:
            page = max(int(request.query_params.get('page', 1)), 1)
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 10))
        except (TypeError, ValueError):
            page_size = 10

        page_size = min(max(page_size, 1), 50)
        return page, page_size

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can view activity logs.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AdminClassCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blocked = self._require_admin(request)
        if blocked:
            return blocked

        page, page_size = self._pagination(request)
        search = (request.query_params.get('search') or '').strip()
        queryset = SchoolClass.objects.order_by('name')
        if search:
            queryset = queryset.filter(
                me.Q(name__icontains=search) |
                me.Q(grade_level__icontains=search) |
                me.Q(room__icontains=search) |
                me.Q(class_teacher__icontains=search)
            )

        total = queryset.count()
        classes = [self._serialize_class(item) for item in queryset.skip((page - 1) * page_size).limit(page_size)]
        return Response({'classes': classes, 'page': page, 'page_size': page_size, 'total': total, 'total_pages': max((total + page_size - 1) // page_size, 1)})

    def post(self, request):
        blocked = self._require_admin(request)
        if blocked:
            return blocked

        serializer = AdminClassWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if SchoolClass.objects(name__iexact=data['name']).first():
            return Response({'detail': 'Class name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        school_class = SchoolClass(
            name=data['name'],
            grade_level=data.get('grade_level', '') or '',
            room=data.get('room', '') or '',
            class_teacher=data.get('class_teacher', '') or '',
        )
        school_class.save()
        self._log_action(request, 'create', 'class', str(school_class.id), self._class_details(school_class))
        return Response({'class': self._serialize_class(school_class)}, status=status.HTTP_201_CREATED)

    def _serialize_class(self, school_class: SchoolClass):
        return {
            'id': str(school_class.id),
            'name': school_class.name,
            'grade_level': school_class.grade_level or '',
            'room': school_class.room or '',
            'class_teacher': school_class.class_teacher or '',
            'student_count': StudentProfile.objects(current_class=school_class).count(),
        }

    def _class_details(self, school_class: SchoolClass):
        return {
            'name': school_class.name,
            'grade_level': school_class.grade_level or '',
            'room': school_class.room or '',
            'class_teacher': school_class.class_teacher or '',
        }

    def _log_action(self, request, action: str, entity_type: str, entity_id: str, details: dict):
        AdminAuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_id=str(getattr(request.user, 'id', '')),
            actor_username=getattr(request.user, 'username', 'system'),
            details=details,
        ).save()

    def _pagination(self, request):
        try:
            page = max(int(request.query_params.get('page', 1)), 1)
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 10))
        except (TypeError, ValueError):
            page_size = 10

        page_size = min(max(page_size, 1), 50)
        return page, page_size

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can manage classes.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AdminClassDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, class_id: str):
        blocked = self._require_admin(request)
        if blocked:
            return blocked

        school_class = SchoolClass.objects.get(id=class_id)
        serializer = AdminClassWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if 'name' in data:
            existing = SchoolClass.objects(name__iexact=data['name']).first()
            if existing and str(existing.id) != str(school_class.id):
                return Response({'detail': 'Class name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            school_class.name = data['name']
        if 'grade_level' in data:
            school_class.grade_level = data['grade_level']
        if 'room' in data:
            school_class.room = data['room']
        if 'class_teacher' in data:
            school_class.class_teacher = data['class_teacher']

        school_class.save()
        AdminClassCollectionView()._log_action(request, 'update', 'class', str(school_class.id), AdminClassCollectionView()._class_details(school_class))
        return Response({'class': AdminClassCollectionView()._serialize_class(school_class)})

    def delete(self, request, class_id: str):
        blocked = self._require_admin(request)
        if blocked:
            return blocked

        school_class = SchoolClass.objects.get(id=class_id)
        student_count = StudentProfile.objects(current_class=school_class).count()
        teacher_count = TeacherProfile.objects(classes_taught=school_class).count()

        if student_count:
            return Response({'detail': 'Move or clear students from this class before deleting it.'}, status=status.HTTP_400_BAD_REQUEST)
        if teacher_count:
            return Response({'detail': 'Remove this class from teacher assignments before deleting it.'}, status=status.HTTP_400_BAD_REQUEST)

        AdminClassCollectionView()._log_action(request, 'delete', 'class', str(school_class.id), AdminClassCollectionView()._class_details(school_class))
        school_class.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can manage classes.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AdminSchoolClassListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blocked = self._require_admin(request)
        if blocked:
            return blocked

        classes = SchoolClass.objects.order_by('name')
        classes_data = [
            {
                'id': str(cls.id),
                'name': cls.name,
                'grade_level': cls.grade_level or '',
                'room': cls.room or '',
            }
            for cls in classes
        ]
        return Response({'classes': classes_data})

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can access this.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AdminStudentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blocked = self._require_admin(request)
        if blocked:
            return blocked

        students = StudentProfile.objects.order_by('admission_number')
        students_data = []
        for student in students:
            user = SchoolUser.objects(id=student.user_id).first()
            if user:
                students_data.append({
                    'id': str(student.id),
                    'admission_number': student.admission_number,
                    'name': user.full_display_name,
                    'class_name': student.current_class.name if student.current_class else 'N/A',
                })
        return Response({'students': students_data})

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can access this.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AttendanceContextView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blocked = self._require_teacher_or_admin(request)
        if blocked:
            return blocked

        school_class_id = request.query_params.get('school_class_id')
        attendance_date = self._parse_date(request.query_params.get('date'))
        attendance_moment = self._attendance_moment(attendance_date) if attendance_date else None
        classes = SchoolClass.objects.order_by('name')
        students_query = StudentProfile.objects

        selected_class = None
        if school_class_id:
            try:
                selected_class = SchoolClass.objects.get(id=school_class_id)
                students_query = StudentProfile.objects(current_class=selected_class)
            except SchoolClass.DoesNotExist:
                return Response({'detail': 'Selected class not found.'}, status=status.HTTP_404_NOT_FOUND)

        students = students_query.order_by('admission_number')
        records = []
        if selected_class and attendance_moment:
            student_ids = [student.id for student in students]
            records = list(AttendanceRecord.objects(student_id__in=student_ids, date=attendance_moment).order_by('student_id'))

        return Response({
            'classes': [
                {
                    'id': str(item.id),
                    'name': item.name,
                    'grade_level': item.grade_level or '',
                    'room': item.room or '',
                    'class_teacher': item.class_teacher or '',
                    'student_count': StudentProfile.objects(current_class=item).count(),
                }
                for item in classes
            ],
            'students': [
                self._serialize_student(student)
                for student in students
            ],
            'records': [self._serialize_record(record) for record in records],
            'date': attendance_date.isoformat() if attendance_date else '',
            'summary': self._summary_for_class(selected_class, attendance_moment) if selected_class and attendance_moment else None,
        })

    def _serialize_student(self, student: StudentProfile):
        return {
            'id': str(student.id),
            'name': student.full_display_name,
            'admission_number': student.admission_number,
            'class_name': student.current_class.name if student.current_class else '',
            'attendance_rate': round(float(student.attendance_rate or 0), 2),
        }

    def _serialize_record(self, record: AttendanceRecord):
        return {
            'id': str(record.id),
            'student_id': str(record.student_id.id),
            'student_name': record.student_id.full_display_name,
            'admission_number': record.student_id.admission_number,
            'school_class_id': str(record.student_id.current_class.id) if record.student_id.current_class else '',
            'school_class': record.student_id.current_class.name if record.student_id.current_class else '',
            'date': record.date.isoformat() if record.date else '',
            'status': record.status,
        }

    def _summary_for_class(self, school_class: SchoolClass, attendance_moment: datetime):
        student_ids = [student.id for student in StudentProfile.objects(current_class=school_class)]
        records = list(AttendanceRecord.objects(student_id__in=student_ids, date=attendance_moment))
        present = sum(1 for record in records if record.status == AttendanceRecord.PRESENT)
        late = sum(1 for record in records if record.status == AttendanceRecord.LATE)
        absent = sum(1 for record in records if record.status == AttendanceRecord.ABSENT)
        leave = sum(1 for record in records if record.status == AttendanceRecord.LEAVE)
        total = len(records)
        return {
            'total': total,
            'present': present,
            'late': late,
            'absent': absent,
            'leave': leave,
            'attendance_rate': round(((present + late) / total) * 100, 2) if total else 0,
        }

    def _parse_date(self, value: str | None):
        if not value:
            return None
        try:
            return datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            return None

    def _attendance_moment(self, attendance_date: date):
        return datetime.combine(attendance_date, time.min)

    def _require_teacher_or_admin(self, request):
        if getattr(request.user, 'role', None) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers or admins can access attendance data.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AttendanceRecordCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blocked = self._require_teacher_or_admin(request)
        if blocked:
            return blocked

        school_class_id = request.query_params.get('school_class_id')
        attendance_date = self._parse_date(request.query_params.get('date'))
        attendance_moment = self._attendance_moment(attendance_date) if attendance_date else None
        page, page_size = self._pagination(request)

        queryset = AttendanceRecord.objects.order_by('-date', 'student_id')
        if school_class_id:
            school_class = SchoolClass.objects.get(id=school_class_id)
            student_ids = [student.id for student in StudentProfile.objects(current_class=school_class)]
            queryset = queryset(student_id__in=student_ids)
        if attendance_moment:
            queryset = queryset(date=attendance_moment)

        total = queryset.count()
        records = [self._serialize_record(record) for record in queryset.skip((page - 1) * page_size).limit(page_size)]
        return Response({'records': records, 'page': page, 'page_size': page_size, 'total': total, 'total_pages': max((total + page_size - 1) // page_size, 1)})

    def post(self, request):
        blocked = self._require_teacher_or_admin(request)
        if blocked:
            return blocked

        serializer = AttendanceBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        school_class = SchoolClass.objects.get(id=data['school_class_id'])
        attendance_moment = self._attendance_moment(data['date'])

        records = []
        for row in data['records']:
            student = StudentProfile.objects.get(id=row['student_id'])
            if not student.current_class or str(student.current_class.id) != str(school_class.id):
                return Response({'detail': f'{student.admission_number} is not assigned to {school_class.name}.'}, status=status.HTTP_400_BAD_REQUEST)

            record = AttendanceRecord.objects(student_id=student, date=attendance_moment).first()
            if record is None:
                record = AttendanceRecord(student_id=student, date=attendance_moment)
            record.status = row['status']
            record.save()
            records.append(record)

        self._recalculate_class_attendance(school_class)
        self._log_action(request, 'bulk_update', 'attendance', f'{school_class.id}:{attendance_moment.date().isoformat()}', {'school_class': school_class.name, 'date': attendance_moment.date().isoformat(), 'count': len(records)})
        return Response({'records': [self._serialize_record(record) for record in records]}, status=status.HTTP_201_CREATED)

    def _serialize_record(self, record: AttendanceRecord):
        return {
            'id': str(record.id),
            'student_id': str(record.student_id.id),
            'student_name': record.student_id.full_display_name,
            'admission_number': record.student_id.admission_number,
            'school_class_id': str(record.student_id.current_class.id) if record.student_id.current_class else '',
            'school_class': record.student_id.current_class.name if record.student_id.current_class else '',
            'date': record.date.isoformat() if record.date else '',
            'status': record.status,
        }

    def _recalculate_class_attendance(self, school_class: SchoolClass):
        students = list(StudentProfile.objects(current_class=school_class))
        for student in students:
            self._recalculate_student_attendance(student)

    def _recalculate_student_attendance(self, student: StudentProfile):
        records = list(AttendanceRecord.objects(student_id=student))
        total = len(records)
        if not total:
            student.attendance_rate = 0
            student.save()
            return

        present = sum(1 for record in records if record.status == AttendanceRecord.PRESENT)
        late = sum(1 for record in records if record.status == AttendanceRecord.LATE)
        student.attendance_rate = round(((present + late) / total) * 100, 2)
        student.save()

    def _log_action(self, request, action: str, entity_type: str, entity_id: str, details: dict):
        AdminAuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_id=str(getattr(request.user, 'id', '')),
            actor_username=getattr(request.user, 'username', 'system'),
            details=details,
        ).save()

    def _parse_date(self, value: str | None):
        if not value:
            return None
        try:
            return datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            return None

    def _pagination(self, request):
        try:
            page = max(int(request.query_params.get('page', 1)), 1)
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 10))
        except (TypeError, ValueError):
            page_size = 10

        page_size = min(max(page_size, 1), 50)
        return page, page_size

    def _require_teacher_or_admin(self, request):
        if getattr(request.user, 'role', None) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers or admins can manage attendance.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AttendanceRecordDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, record_id: str):
        blocked = self._require_teacher_or_admin(request)
        if blocked:
            return blocked

        record = AttendanceRecord.objects.get(id=record_id)
        serializer = AttendanceRecordWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        previous_student = record.student_id
        previous_class = record.student_id.current_class
        previous_date = record.date

        if 'student_id' in data:
            student = StudentProfile.objects.get(id=data['student_id'])
            if 'school_class_id' in data and (not student.current_class or str(student.current_class.id) != str(data['school_class_id'])):
                return Response({'detail': 'Student is not assigned to the selected class.'}, status=status.HTTP_400_BAD_REQUEST)
            record.student_id = student
        if 'school_class_id' in data:
            school_class = SchoolClass.objects.get(id=data['school_class_id'])
            if not record.student_id.current_class or str(record.student_id.current_class.id) != str(school_class.id):
                return Response({'detail': 'Student is not assigned to the selected class.'}, status=status.HTTP_400_BAD_REQUEST)
        if 'date' in data:
            record.date = datetime.combine(data['date'], time.min)
        if 'status' in data:
            record.status = data['status']

        record.save()
        AttendanceRecordCollectionView()._recalculate_student_attendance(previous_student)
        if record.student_id and str(record.student_id.id) != str(previous_student.id):
            AttendanceRecordCollectionView()._recalculate_student_attendance(record.student_id)
        if previous_class:
            AttendanceRecordCollectionView()._recalculate_class_attendance(previous_class)
        if record.student_id.current_class:
            AttendanceRecordCollectionView()._recalculate_class_attendance(record.student_id.current_class)

        AttendanceRecordCollectionView()._log_action(request, 'update', 'attendance', str(record.id), {'student': record.student_id.admission_number, 'date': record.date.isoformat() if record.date else '', 'status': record.status})
        return Response({'record': AttendanceRecordCollectionView()._serialize_record(record)})

    def delete(self, request, record_id: str):
        blocked = self._require_teacher_or_admin(request)
        if blocked:
            return blocked

        record = AttendanceRecord.objects.get(id=record_id)
        student = record.student_id
        school_class = student.current_class
        AttendanceRecordCollectionView()._log_action(request, 'delete', 'attendance', str(record.id), {'student': student.admission_number, 'date': record.date.isoformat() if record.date else '', 'status': record.status})
        record.delete()
        AttendanceRecordCollectionView()._recalculate_student_attendance(student)
        if school_class:
            AttendanceRecordCollectionView()._recalculate_class_attendance(school_class)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _require_teacher_or_admin(self, request):
        if getattr(request.user, 'role', None) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers or admins can manage attendance.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def _attendance_moment(self, attendance_date: date):
        return datetime.combine(attendance_date, time.min)


class AdminUserCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            blocked = self._require_admin(request)
            if blocked:
                return blocked
            page, page_size = self._pagination(request)
            queryset = SchoolUser.objects.order_by('role', 'username')
            total = queryset.count()
            users = [self._serialize_user(user) for user in queryset.skip((page - 1) * page_size).limit(page_size)]
            return Response({'users': users, 'page': page, 'page_size': page_size, 'total': total, 'total_pages': max((total + page_size - 1) // page_size, 1)})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Error loading users.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        blocked = self._require_admin(request)
        if blocked:
            return blocked
        serializer = AdminUserWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        role = data['role']

        if SchoolUser.objects(username__iexact=data['username']).first():
            return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        if SchoolUser.objects(email__iexact=data['email']).first():
            return Response({'detail': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Student-specific validation
        if role == SchoolUser.STUDENT:
            if not data.get('admission_number'):
                return Response({'detail': 'Admission number is required for students.'}, status=status.HTTP_400_BAD_REQUEST)
            if StudentProfile.objects(admission_number=data['admission_number']).first():
                return Response({'detail': 'Admission number already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            if not data.get('class_id'):
                return Response({'detail': 'Class assignment is required for students.'}, status=status.HTTP_400_BAD_REQUEST)

        user = SchoolUser(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=role,
            phone_number=data.get('phone_number', '') or '',
            is_active=data.get('is_active', True),
            is_staff=role == SchoolUser.ADMIN,
        )
        password = data.get('password') or None
        if not password:
            return Response({'detail': 'Password is required when creating a user.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()

        # Create role-specific profiles
        if role == SchoolUser.STUDENT:
            try:
                school_class = SchoolClass.objects.get(id=data['class_id'])
            except SchoolClass.DoesNotExist:
                user.delete()
                return Response({'detail': 'School class not found.'}, status=status.HTTP_404_NOT_FOUND)
            StudentProfile(
                user_id=user.id,
                admission_number=data['admission_number'],
                current_class=school_class,
                attendance_rate=0,
                fee_balance=0,
                gpa=0,
            ).save()
        elif role == SchoolUser.TEACHER:
            classes_taught = []
            if data.get('classes_taught'):
                for class_id in data['classes_taught']:
                    try:
                        school_class = SchoolClass.objects.get(id=class_id)
                        classes_taught.append(school_class)
                    except SchoolClass.DoesNotExist:
                        pass
            TeacherProfile(
                user_id=user.id,
                subject=data.get('subject', '') or '',
                classes_taught=classes_taught,
            ).save()
        elif role == SchoolUser.PARENT:
            children_ids = []
            if data.get('student_ids'):
                for student_id in data['student_ids']:
                    try:
                        student = StudentProfile.objects.get(id=student_id)
                        children_ids.append(student)
                    except StudentProfile.DoesNotExist:
                        pass
            ParentProfile(
                user_id=user.id,
                children_ids=children_ids,
            ).save()

        self._log_action(request, 'create', 'user', str(user.id), {'username': user.username, 'role': role})
        return Response({'user': self._serialize_user(user)}, status=status.HTTP_201_CREATED)

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can manage users.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def _serialize_user(self, user: SchoolUser):
        return {
            'id': str(user.id),
            'username': user.username,
            'name': user.full_display_name,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
            'phone_number': user.phone_number or '',
            'status': 'Active' if user.is_active else 'Inactive',
            'is_active': user.is_active,
        }

    def _log_action(self, request, action: str, entity_type: str, entity_id: str, details: dict):
        AdminAuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_id=str(getattr(request.user, 'id', '')),
            actor_username=getattr(request.user, 'username', 'system'),
            details=details,
        ).save()

    def _pagination(self, request):
        try:
            page = max(int(request.query_params.get('page', 1)), 1)
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 10))
        except (TypeError, ValueError):
            page_size = 10

        page_size = min(max(page_size, 1), 50)
        return page, page_size


class AdminUserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, user_id: str):
        blocked = self._require_admin(request)
        if blocked:
            return blocked
        user = SchoolUser.objects.get(id=user_id)
        serializer = AdminUserWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        if 'username' in data:
            existing = SchoolUser.objects(username__iexact=data['username']).first()
            if existing and str(existing.id) != str(user.id):
                return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = data['username']
        if 'email' in data:
            existing = SchoolUser.objects(email__iexact=data['email']).first()
            if existing and str(existing.id) != str(user.id):
                return Response({'detail': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = data['email']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'role' in data:
            user.role = data['role']
            user.is_staff = data['role'] == SchoolUser.ADMIN
        if 'phone_number' in data:
            user.phone_number = data['phone_number'] or ''
        if 'is_active' in data:
            user.is_active = data['is_active']
        if data.get('password'):
            user.set_password(data['password'])

        user.save()
        AdminUserCollectionView()._log_action(request, 'update', 'user', str(user.id), {'username': user.username, 'role': user.role})
        return Response({'user': AdminUserCollectionView()._serialize_user(user)})

    def delete(self, request, user_id: str):
        blocked = self._require_admin(request)
        if blocked:
            return blocked
        user = SchoolUser.objects.get(id=user_id)
        if str(user.id) == str(getattr(request.user, 'id', '')):
            return Response({'detail': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        AdminUserCollectionView()._log_action(request, 'delete', 'user', str(user.id), {'username': user.username, 'role': user.role})
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can manage users.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AdminFeeCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            blocked = self._require_admin(request)
            if blocked:
                return blocked
            page, page_size = self._pagination(request)
            queryset = FeeInvoice.objects.order_by('-due_date', '-id')
            total = queryset.count()
            fees = [self._serialize_fee(invoice) for invoice in queryset.skip((page - 1) * page_size).limit(page_size)]
            students = [self._serialize_student(student) for student in StudentProfile.objects.order_by('admission_number')]
            return Response({'fees': fees, 'students': students, 'page': page, 'page_size': page_size, 'total': total, 'total_pages': max((total + page_size - 1) // page_size, 1)})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Error loading fees.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        blocked = self._require_admin(request)
        if blocked:
            return blocked
        serializer = AdminFeeInvoiceWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = self._resolve_student(serializer.validated_data)
        if student is None:
            return Response({'detail': 'Student not found.'}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        if FeeInvoice.objects(reference=data['reference']).first():
            return Response({'detail': 'Fee reference already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        invoice = FeeInvoice(
            student_id=student,
            reference=data['reference'],
            amount=data['amount'],
            paid_amount=data.get('paid_amount', 0),
            status=data.get('status', FeeInvoice.PENDING),
            due_date=data.get('due_date') or datetime.utcnow(),
        )
        invoice.save()
        self._sync_fee_balance(student)
        AdminUserCollectionView()._log_action(request, 'create', 'fee_invoice', str(invoice.id), {'reference': invoice.reference, 'student': student.admission_number, 'amount': invoice.amount, 'status': invoice.status})
        return Response({'fee': self._serialize_fee(invoice)}, status=status.HTTP_201_CREATED)

    def _pagination(self, request):
        try:
            page = max(int(request.query_params.get('page', 1)), 1)
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 10))
        except (TypeError, ValueError):
            page_size = 10

        page_size = min(max(page_size, 1), 50)
        return page, page_size

    def _resolve_student(self, validated_data):
        student_id = validated_data.get('student_id')
        admission_number = validated_data.get('student_admission_number')

        if student_id:
            try:
                return StudentProfile.objects.get(id=student_id)
            except StudentProfile.DoesNotExist:
                return None

        if admission_number:
            return StudentProfile.objects(admission_number=admission_number).first()

        return None

    def _serialize_student(self, student: StudentProfile):
        try:
            return {
                'id': str(student.id),
                'admission_number': student.admission_number,
                'name': str(student),
                'class_name': student.current_class.name if student.current_class else 'N/A',
            }
        except Exception:
            return {
                'id': str(student.id) if student else 'Unknown',
                'admission_number': student.admission_number if student else 'Unknown',
                'name': str(student) if student else 'Unknown',
                'class_name': 'N/A',
            }

    def _serialize_fee(self, invoice: FeeInvoice):
        try:
            payment_count = FeePayment.objects(invoice=invoice).count()
            latest_payment = FeePayment.objects(invoice=invoice).order_by('-initiated_at').first()
            phone_number = ''
            
            student = invoice.student_id
            if not student:
                return {
                    'id': str(invoice.id),
                    'reference': invoice.reference,
                    'student_id': 'Unknown',
                    'student': 'Unknown',
                    'class': 'N/A',
                    'amount': '0',
                    'paid_amount': '0',
                    'status': invoice.status.title() if invoice.status else 'Unknown',
                    'due_date': invoice.due_date.isoformat() if invoice.due_date else '',
                    'phone_number': '',
                    'outstanding_amount': '0',
                    'payment_count': 0,
                    'latest_payment_status': '',
                }
            
            try:
                user = SchoolUser.objects.get(id=student.user_id)
                phone_number = user.phone_number or ''
            except Exception:
                phone_number = ''

            return {
                'id': str(invoice.id),
                'reference': invoice.reference,
                'student_id': str(student.id),
                'student': student.admission_number,
                'class': student.current_class.name if student.current_class else 'N/A',
                'amount': f'{float(invoice.amount or 0):,.0f}',
                'paid_amount': f'{float(invoice.paid_amount or 0):,.0f}',
                'status': invoice.status.title() if invoice.status else 'Unknown',
                'due_date': invoice.due_date.isoformat() if invoice.due_date else '',
                'phone_number': phone_number,
                'outstanding_amount': f'{max(float(invoice.amount or 0) - float(invoice.paid_amount or 0), 0):,.0f}',
                'payment_count': payment_count,
                'latest_payment_status': latest_payment.status.title() if latest_payment else '',
            }
        except Exception as e:
            return {
                'id': str(invoice.id),
                'reference': invoice.reference,
                'student_id': 'Error',
                'student': 'Error',
                'class': 'Error',
                'amount': '0',
                'paid_amount': '0',
                'status': 'Error',
                'due_date': '',
                'phone_number': '',
                'outstanding_amount': '0',
                'payment_count': 0,
                'latest_payment_status': '',
                'error': str(e),
            }

    def _sync_fee_balance(self, student: StudentProfile):
        try:
            invoices = FeeInvoice.objects(student_id=student)
            student.fee_balance = sum(max(float(inv.amount or 0) - float(inv.paid_amount or 0), 0) for inv in invoices)
            student.save()
        except Exception:
            # Silently fail, don't let this break the main flow
            pass

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can manage fees.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class AdminFeeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, fee_id: str):
        blocked = self._require_admin(request)
        if blocked:
            return blocked
        invoice = FeeInvoice.objects.get(id=fee_id)
        previous_student = invoice.student_id

        serializer = AdminFeeInvoiceWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if 'reference' in data:
            existing = FeeInvoice.objects(reference=data['reference']).first()
            if existing and str(existing.id) != str(invoice.id):
                return Response({'detail': 'Fee reference already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            invoice.reference = data['reference']
        if 'amount' in data:
            invoice.amount = data['amount']
        if 'paid_amount' in data:
            invoice.paid_amount = data['paid_amount']
        if 'status' in data:
            invoice.status = data['status']
        if 'due_date' in data and data['due_date'] is not None:
            invoice.due_date = data['due_date']

        new_student = None
        if 'student_id' in data or 'student_admission_number' in data:
            new_student = AdminFeeCollectionView()._resolve_student(data)
            if new_student is None:
                return Response({'detail': 'Student not found.'}, status=status.HTTP_400_BAD_REQUEST)
            invoice.student_id = new_student

        invoice.save()
        helper = AdminFeeCollectionView()
        helper._sync_fee_balance(previous_student)
        if new_student and str(new_student.id) != str(previous_student.id):
            helper._sync_fee_balance(new_student)
        else:
            helper._sync_fee_balance(invoice.student_id)

        AdminUserCollectionView()._log_action(request, 'update', 'fee_invoice', str(invoice.id), {'reference': invoice.reference, 'student': invoice.student_id.admission_number, 'amount': invoice.amount, 'status': invoice.status})

        return Response({'fee': helper._serialize_fee(invoice)})

    def delete(self, request, fee_id: str):
        blocked = self._require_admin(request)
        if blocked:
            return blocked
        invoice = FeeInvoice.objects.get(id=fee_id)
        student = invoice.student_id
        AdminUserCollectionView()._log_action(request, 'delete', 'fee_invoice', str(invoice.id), {'reference': invoice.reference, 'student': student.admission_number, 'amount': invoice.amount, 'status': invoice.status})
        invoice.delete()
        AdminFeeCollectionView()._sync_fee_balance(student)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _require_admin(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can manage fees.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def _admin_users(self, students, teachers):
        combined = []
        seen = set()

        for student in students:
            try:
                user = SchoolUser.objects.get(id=student.user_id)
                if str(user.id) not in seen:
                    combined.append(user)
                    seen.add(str(user.id))
            except SchoolUser.DoesNotExist:
                continue

        for teacher in teachers:
            try:
                user = SchoolUser.objects.get(id=teacher.user_id)
                if str(user.id) not in seen:
                    combined.append(user)
                    seen.add(str(user.id))
            except SchoolUser.DoesNotExist:
                continue

        for user in SchoolUser.objects.order_by('role', 'username').limit(8):
            if str(user.id) not in seen:
                combined.append(user)
                seen.add(str(user.id))

        return combined[:12]

    def _analytics(self):
        months = [
            ('Jan', 1),
            ('Feb', 2),
            ('Mar', 3),
            ('Apr', 4),
            ('May', 5),
        ]

        average_attendance = 0
        students = list(StudentProfile.objects)
        if students:
            average_attendance = round(sum(float(student.attendance_rate or 0) for student in students) / len(students), 2)

        fee_monthly = []
        for month_name, month_number in months:
            month_entries = [invoice for invoice in FeeInvoice.objects if getattr(invoice.due_date, 'month', None) == month_number]
            month_paid = sum(float(invoice.paid_amount) for invoice in month_entries) if month_entries else 0
            month_attendance = average_attendance or max(75, 90 - (5 - month_number) * 2)
            fee_monthly.append({
                'month': month_name,
                'attendance': int(month_attendance),
                'revenue': int(month_paid / 1000) if month_paid else 120 + month_number * 12,
            })

        return fee_monthly

    def _report_items(self):
        return [
            {'name': 'Monthly Attendance Report', 'date': datetime.utcnow().strftime('%Y-%m-%d'), 'type': 'PDF', 'key': 'attendance'},
            {'name': 'Fee Collection Summary', 'date': datetime.utcnow().strftime('%Y-%m-%d'), 'type': 'PDF', 'key': 'fees'},
            {'name': 'Student Performance', 'date': datetime.utcnow().strftime('%Y-%m-%d'), 'type': 'PDF', 'key': 'performance'},
        ]


def _pagination(request):
    try:
        page = max(int(request.query_params.get('page', 1)), 1)
    except (TypeError, ValueError):
        page = 1

    try:
        page_size = int(request.query_params.get('page_size', 10))
    except (TypeError, ValueError):
        page_size = 10

    page_size = min(max(page_size, 1), 50)
    return page, page_size


def _user_role(user):
    return getattr(user, 'role', None)


def _teacher_classes(user):
    profile = TeacherProfile.objects(user_id=getattr(user, 'id', None)).first()
    if not profile or not profile.classes_taught:
        return []
    return [school_class for school_class in profile.classes_taught if school_class is not None]


def _student_profile(user):
    return StudentProfile.objects(user_id=getattr(user, 'id', None)).first()


def _parent_profile(user):
    return ParentProfile.objects(user_id=getattr(user, 'id', None)).first()


def _select_parent_child(children, requested_child_id: str):
    if not requested_child_id:
        return None

    for child in children:
        if str(child.id) == str(requested_child_id):
            return child
    return None


def _serialize_parent_child(child: StudentProfile):
    school_class = child.current_class
    latest_result = StudentResult.objects(student_id=child).order_by('-updated_at').first()
    latest_grade = 'N/A'
    if latest_result:
        latest_grade = latest_result.grade
    elif child.gpa:
        latest_grade = f'{float(child.gpa):.1f}'

    return {
        'id': str(child.id),
        'name': child.full_display_name,
        'admission_number': child.admission_number,
        'class_name': school_class.name if school_class else 'N/A',
        'class_teacher': school_class.class_teacher if school_class else '',
        'attendance': f'{float(child.attendance_rate or 0):.0f}%',
        'fees_due': f'{max(float(child.fee_balance or 0), 0):,.0f}',
        'latest_grade': latest_grade,
        'gpa': f'{float(child.gpa or 0):.1f}',
    }


def _parent_communication_payload(user: SchoolUser, active_child: StudentProfile | None, children):
    office_phone = getattr(settings, 'SCHOOL_OFFICE_PHONE', '') or ''
    office_email = getattr(settings, 'SCHOOL_OFFICE_EMAIL', '') or ''
    office_hours = getattr(settings, 'SCHOOL_OFFICE_HOURS', 'Mon-Fri 8:00 AM - 5:00 PM')

    return {
        'office': {
            'name': 'School Office',
            'phone_number': office_phone,
            'email': office_email,
            'hours': office_hours,
        },
        'parent': {
            'name': user.full_display_name,
            'email': user.email,
            'phone_number': user.phone_number or '',
        },
        'active_child': {
            'id': str(active_child.id) if active_child else '',
            'name': active_child.full_display_name if active_child else 'No child linked',
            'admission_number': active_child.admission_number if active_child else '',
            'class_name': active_child.current_class.name if active_child and active_child.current_class else '',
            'class_teacher': active_child.current_class.class_teacher if active_child and active_child.current_class else '',
        },
        'children': [
            {
                'id': str(child.id),
                'name': child.full_display_name,
                'admission_number': child.admission_number,
                'class_name': child.current_class.name if child.current_class else '',
                'class_teacher': child.current_class.class_teacher if child.current_class else '',
                'primary_contact': 'School office',
            }
            for child in children
        ],
        'notes': [
            'Use the school office for official communication and fee queries.',
            'For class-specific matters, ask the school office to connect you with the selected child\'s class teacher.',
            'Announcements contain school-wide notices and schedule changes.',
        ],
    }


def _assignment_payload(assignment: Assignment, student: StudentProfile | None = None):
    materials = list(AssignmentMaterial.objects(assignment=assignment).order_by('-created_at'))
    submissions = AssignmentSubmission.objects(assignment=assignment)
    submission_count = submissions.count()
    class_students = StudentProfile.objects(current_class=assignment.school_class).count() if assignment.school_class else 0
    student_submission = None
    if student:
        own = submissions(student_id=student).first()
        if own:
            student_submission = {
                'id': str(own.id),
                'status': own.status,
                'submitted_at': own.submitted_at.isoformat() if own.submitted_at else '',
                'score': own.score,
                'max_score': own.max_score,
                'teacher_feedback': own.teacher_feedback,
                'content': own.content,
            }
            # indicate late state for the student's own submission (computed, not mutating DB)
            try:
                if own.submitted_at and assignment.due_date and own.submitted_at > assignment.due_date:
                    student_submission['is_late'] = True
                else:
                    student_submission['is_late'] = False
            except Exception:
                student_submission['is_late'] = False

    # compute deadline/reminder flags
    now = datetime.utcnow()
    due_date = assignment.due_date
    is_due_soon = False
    is_overdue = False
    due_in_days = None
    overdue_count = 0
    try:
        if due_date:
            delta = due_date - now
            due_in_days = round(delta.total_seconds() / 86400, 1)
            # due soon within 3 days
            is_due_soon = 0 < delta.total_seconds() <= (3 * 24 * 3600)
            pending = max(class_students - submission_count, 0)
            if now > due_date and pending > 0:
                is_overdue = True
                overdue_count = pending
    except Exception:
        is_due_soon = False
        is_overdue = False
        due_in_days = None
        overdue_count = 0
    return {
        'id': str(assignment.id),
        'title': assignment.title,
        'description': assignment.description or '',
        'subject': assignment.subject,
        'school_class_id': str(assignment.school_class.id),
        'school_class': assignment.school_class.name,
        'max_score': assignment.max_score,
        'due_date': assignment.due_date.isoformat() if assignment.due_date else '',
        'is_published': bool(assignment.is_published),
        'published_at': assignment.published_at.isoformat() if assignment.published_at else '',
        'created_at': assignment.created_at.isoformat() if assignment.created_at else '',
        'updated_at': assignment.updated_at.isoformat() if assignment.updated_at else '',
        'submission_count': submission_count,
        'pending_count': max(class_students - submission_count, 0),
        'materials': [
            {
                'id': str(item.id),
                'title': item.title,
                'material_type': item.material_type,
                'content': item.content,
                'created_at': item.created_at.isoformat() if item.created_at else '',
            }
            for item in materials
        ],
        'student_submission': student_submission,
        'is_due_soon': bool(is_due_soon),
        'is_overdue': bool(is_overdue),
        'due_in_days': due_in_days,
        'overdue_count': int(overdue_count),
    }


def _can_manage_assignment(user, assignment: Assignment):
    role = _user_role(user)
    if role == 'admin':
        return True
    if role != 'teacher':
        return False
    teacher_class_ids = {str(item.id) for item in _teacher_classes(user)}
    return str(assignment.school_class.id) in teacher_class_ids


def _can_view_assignment(user, assignment: Assignment):
    role = _user_role(user)
    if role == 'admin':
        return True
    if role == 'teacher':
        teacher_class_ids = {str(item.id) for item in _teacher_classes(user)}
        return str(assignment.school_class.id) in teacher_class_ids
    if role == 'student':
        student = _student_profile(user)
        if not student or not student.current_class:
            return False
        if not assignment.is_published:
            return False
        return str(student.current_class.id) == str(assignment.school_class.id)
    if role == 'parent':
        # Parent workflow can be expanded with child scoped LMS views.
        return bool(assignment.is_published)
    return False


class AssignmentCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = _user_role(request.user)
        page, page_size = _pagination(request)
        class_id = request.query_params.get('school_class_id')
        search = (request.query_params.get('search') or '').strip()
        include_unpublished = request.query_params.get('include_unpublished') == '1'

        queryset = Assignment.objects.order_by('-due_date', '-created_at')

        if role == 'teacher':
            teacher_classes = _teacher_classes(request.user)
            if not teacher_classes:
                return Response({'assignments': [], 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})
            queryset = queryset(school_class__in=teacher_classes)
            if not include_unpublished:
                queryset = queryset(is_published=True)
        elif role == 'student':
            student = _student_profile(request.user)
            if not student or not student.current_class:
                return Response({'assignments': [], 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})
            queryset = queryset(school_class=student.current_class, is_published=True)
        elif role == 'admin':
            if not include_unpublished:
                queryset = queryset(is_published=True)
        else:
            return Response({'detail': 'Role cannot access assignments.'}, status=status.HTTP_403_FORBIDDEN)

        if class_id:
            queryset = queryset(school_class=SchoolClass.objects.get(id=class_id))
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(subject__icontains=search) | Q(description__icontains=search))

        total = queryset.count()
        rows = list(queryset.skip((page - 1) * page_size).limit(page_size))
        student = _student_profile(request.user) if role == 'student' else None

        return Response({
            'assignments': [_assignment_payload(item, student=student) for item in rows],
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': max((total + page_size - 1) // page_size, 1),
        })

    def post(self, request):
        if _user_role(request.user) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers or admins can create assignments.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AssignmentWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        school_class = SchoolClass.objects.get(id=data['school_class_id'])

        if _user_role(request.user) == 'teacher':
            teacher_class_ids = {str(item.id) for item in _teacher_classes(request.user)}
            if str(school_class.id) not in teacher_class_ids:
                return Response({'detail': 'You are not assigned to this class.'}, status=status.HTTP_403_FORBIDDEN)

        assignment = Assignment(
            title=data['title'],
            description=data.get('description', ''),
            subject=data['subject'],
            school_class=school_class,
            created_by=getattr(request.user, 'id', None),
            max_score=data.get('max_score', 100),
            due_date=data['due_date'],
            is_published=data.get('is_published', True),
            published_at=datetime.utcnow() if data.get('is_published', True) else None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        assignment.save()

        AdminAuditLog(
            action='create',
            entity_type='assignment',
            entity_id=str(assignment.id),
            actor_id=str(getattr(request.user, 'id', '')),
            actor_username=getattr(request.user, 'username', 'system'),
            details={'title': assignment.title, 'subject': assignment.subject, 'school_class': assignment.school_class.name},
        ).save()

        return Response({'assignment': _assignment_payload(assignment)}, status=status.HTTP_201_CREATED)


class AssignmentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, assignment_id: str):
        assignment = Assignment.objects.get(id=assignment_id)
        if not _can_view_assignment(request.user, assignment):
            return Response({'detail': 'You do not have access to this assignment.'}, status=status.HTTP_403_FORBIDDEN)
        student = _student_profile(request.user) if _user_role(request.user) == 'student' else None
        return Response({'assignment': _assignment_payload(assignment, student=student)})

    def patch(self, request, assignment_id: str):
        assignment = Assignment.objects.get(id=assignment_id)
        if not _can_manage_assignment(request.user, assignment):
            return Response({'detail': 'Only class teachers or admins can update this assignment.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AssignmentWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if 'school_class_id' in data:
            school_class = SchoolClass.objects.get(id=data['school_class_id'])
            if _user_role(request.user) == 'teacher':
                teacher_class_ids = {str(item.id) for item in _teacher_classes(request.user)}
                if str(school_class.id) not in teacher_class_ids:
                    return Response({'detail': 'You are not assigned to this class.'}, status=status.HTTP_403_FORBIDDEN)
            assignment.school_class = school_class
        if 'title' in data:
            assignment.title = data['title']
        if 'description' in data:
            assignment.description = data['description']
        if 'subject' in data:
            assignment.subject = data['subject']
        if 'max_score' in data:
            assignment.max_score = data['max_score']
        if 'due_date' in data:
            assignment.due_date = data['due_date']
        if 'is_published' in data:
            assignment.is_published = data['is_published']
            if data['is_published'] and assignment.published_at is None:
                assignment.published_at = datetime.utcnow()
        assignment.updated_at = datetime.utcnow()
        assignment.save()

        AdminAuditLog(
            action='update',
            entity_type='assignment',
            entity_id=str(assignment.id),
            actor_id=str(getattr(request.user, 'id', '')),
            actor_username=getattr(request.user, 'username', 'system'),
            details={'title': assignment.title, 'subject': assignment.subject, 'school_class': assignment.school_class.name},
        ).save()

        return Response({'assignment': _assignment_payload(assignment)})

    def delete(self, request, assignment_id: str):
        assignment = Assignment.objects.get(id=assignment_id)
        if not _can_manage_assignment(request.user, assignment):
            return Response({'detail': 'Only class teachers or admins can delete this assignment.'}, status=status.HTTP_403_FORBIDDEN)

        if AssignmentSubmission.objects(assignment=assignment).count() > 0:
            return Response({'detail': 'Cannot delete assignment with existing submissions.'}, status=status.HTTP_400_BAD_REQUEST)

        AssignmentMaterial.objects(assignment=assignment).delete()
        AdminAuditLog(
            action='delete',
            entity_type='assignment',
            entity_id=str(assignment.id),
            actor_id=str(getattr(request.user, 'id', '')),
            actor_username=getattr(request.user, 'username', 'system'),
            details={'title': assignment.title, 'subject': assignment.subject, 'school_class': assignment.school_class.name},
        ).save()
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssignmentMaterialCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        assignment_id = request.query_params.get('assignment_id')
        if not assignment_id:
            return Response({'detail': 'assignment_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        assignment = Assignment.objects.get(id=assignment_id)
        if not _can_view_assignment(request.user, assignment):
            return Response({'detail': 'You do not have access to this assignment.'}, status=status.HTTP_403_FORBIDDEN)

        materials = AssignmentMaterial.objects(assignment=assignment).order_by('-created_at')
        return Response({'materials': [AssignmentMaterialSerializer(item).data for item in materials]})

    def post(self, request):
        serializer = AssignmentMaterialWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        assignment = Assignment.objects.get(id=data['assignment_id'])
        if not _can_manage_assignment(request.user, assignment):
            return Response({'detail': 'Only class teachers or admins can add materials.'}, status=status.HTTP_403_FORBIDDEN)

        material = AssignmentMaterial(
            assignment=assignment,
            title=data['title'],
            material_type=data.get('material_type', 'link'),
            content=data['content'],
            created_at=datetime.utcnow(),
        )
        material.save()
        assignment.updated_at = datetime.utcnow()
        assignment.save()

        return Response({'material': AssignmentMaterialSerializer(material).data}, status=status.HTTP_201_CREATED)


class AssignmentMaterialDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, material_id: str):
        material = AssignmentMaterial.objects.get(id=material_id)
        assignment = material.assignment
        if not _can_manage_assignment(request.user, assignment):
            return Response({'detail': 'Only class teachers or admins can update materials.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AssignmentMaterialWriteSerializer(data={**request.data, 'assignment_id': str(assignment.id)}, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if 'title' in data:
            material.title = data['title']
        if 'material_type' in data:
            material.material_type = data['material_type']
        if 'content' in data:
            material.content = data['content']
        material.save()
        assignment.updated_at = datetime.utcnow()
        assignment.save()
        return Response({'material': AssignmentMaterialSerializer(material).data})

    def delete(self, request, material_id: str):
        material = AssignmentMaterial.objects.get(id=material_id)
        assignment = material.assignment
        if not _can_manage_assignment(request.user, assignment):
            return Response({'detail': 'Only class teachers or admins can delete materials.'}, status=status.HTTP_403_FORBIDDEN)
        material.delete()
        assignment.updated_at = datetime.utcnow()
        assignment.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssignmentSubmissionsCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = _user_role(request.user)
        page, page_size = _pagination(request)
        assignment_id = request.query_params.get('assignment_id')

        queryset = AssignmentSubmission.objects.order_by('-submitted_at')
        if assignment_id:
            assignment = Assignment.objects.get(id=assignment_id)
            if not _can_view_assignment(request.user, assignment):
                return Response({'detail': 'You do not have access to this assignment.'}, status=status.HTTP_403_FORBIDDEN)
            queryset = queryset(assignment=assignment)

        if role == 'student':
            student = _student_profile(request.user)
            if not student:
                return Response({'submissions': [], 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})
            queryset = queryset(student_id=student)
        elif role == 'teacher':
            class_ids = [school_class.id for school_class in _teacher_classes(request.user)]
            assignments = Assignment.objects(school_class__in=class_ids) if class_ids else []
            queryset = queryset(assignment__in=assignments)
        elif role != 'admin':
            return Response({'detail': 'Role cannot access submissions.'}, status=status.HTTP_403_FORBIDDEN)

        total = queryset.count()
        rows = list(queryset.skip((page - 1) * page_size).limit(page_size))
        return Response({
            'submissions': [
                {
                    'id': str(item.id),
                    'assignment_id': str(item.assignment.id),
                    'assignment_title': item.assignment.title,
                    'school_class': item.assignment.school_class.name,
                    'student_id': str(item.student_id.id),
                    'student_name': item.student_id.full_display_name,
                    'admission_number': item.student_id.admission_number,
                    'content': item.content,
                    'status': item.status,
                    'score': item.score,
                    'max_score': item.max_score,
                    'teacher_feedback': item.teacher_feedback,
                    'submitted_at': item.submitted_at.isoformat() if item.submitted_at else '',
                    'graded_at': item.graded_at.isoformat() if item.graded_at else '',
                }
                for item in rows
            ],
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': max((total + page_size - 1) // page_size, 1),
        })

    def post(self, request):
        if _user_role(request.user) != 'student':
            return Response({'detail': 'Only students can submit assignments.'}, status=status.HTTP_403_FORBIDDEN)

        student = _student_profile(request.user)
        if not student or not student.current_class:
            return Response({'detail': 'Student profile or class assignment is missing.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AssignmentSubmissionWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        assignment = Assignment.objects.get(id=data['assignment_id'])
        if not assignment.is_published:
            return Response({'detail': 'This assignment is not published yet.'}, status=status.HTTP_400_BAD_REQUEST)
        if str(assignment.school_class.id) != str(student.current_class.id):
            return Response({'detail': 'You can only submit assignments for your class.'}, status=status.HTTP_403_FORBIDDEN)

        unique_key = assignment_submission_unique_key(assignment, student)
        submission = AssignmentSubmission.objects(unique_key=unique_key).first()
        if submission is None:
            submission = AssignmentSubmission(
                assignment=assignment,
                student_id=student,
                unique_key=unique_key,
            )

        submission.content = data['content']
        submission.max_score = assignment.max_score
        submission.submitted_at = datetime.utcnow()
        submission.status = 'late' if assignment.due_date and datetime.utcnow() > assignment.due_date else 'submitted'
        submission.save()

        return Response({'submission': AssignmentSubmissionSerializer(submission).data}, status=status.HTTP_201_CREATED)


class AssignmentSubmissionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, submission_id: str):
        submission = AssignmentSubmission.objects.get(id=submission_id)
        role = _user_role(request.user)

        if role == 'student':
            student = _student_profile(request.user)
            if not student or str(submission.student_id.id) != str(student.id):
                return Response({'detail': 'You can only update your own submissions.'}, status=status.HTTP_403_FORBIDDEN)
            if submission.status == 'graded':
                return Response({'detail': 'Graded submissions cannot be edited.'}, status=status.HTTP_400_BAD_REQUEST)
            content = request.data.get('content', '')
            if not isinstance(content, str) or not content.strip():
                return Response({'detail': 'content is required.'}, status=status.HTTP_400_BAD_REQUEST)
            submission.content = content
            submission.submitted_at = datetime.utcnow()
            submission.status = 'late' if submission.assignment.due_date and datetime.utcnow() > submission.assignment.due_date else 'submitted'
            submission.save()
            return Response({'submission': AssignmentSubmissionSerializer(submission).data})

        if role not in {'teacher', 'admin'}:
            return Response({'detail': 'Role cannot grade submissions.'}, status=status.HTTP_403_FORBIDDEN)

        if role == 'teacher' and not _can_manage_assignment(request.user, submission.assignment):
            return Response({'detail': 'You can only grade submissions in your classes.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AssignmentGradeWriteSerializer(data={**request.data, 'submission_id': submission_id})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if 'teacher_feedback' in data:
            submission.teacher_feedback = data['teacher_feedback']
        if 'max_score' in data:
            submission.max_score = data['max_score']
        if 'score' in data:
            if data['score'] > submission.max_score:
                return Response({'detail': 'Score cannot exceed max score.'}, status=status.HTTP_400_BAD_REQUEST)
            submission.score = data['score']
        submission.status = data.get('status', 'graded')
        submission.graded_at = datetime.utcnow()
        submission.save()

        return Response({'submission': AssignmentSubmissionSerializer(submission).data})

    def delete(self, request, submission_id: str):
        submission = AssignmentSubmission.objects.get(id=submission_id)
        role = _user_role(request.user)
        if role not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers or admins can delete submissions.'}, status=status.HTTP_403_FORBIDDEN)
        if role == 'teacher' and not _can_manage_assignment(request.user, submission.assignment):
            return Response({'detail': 'You can only delete submissions in your classes.'}, status=status.HTTP_403_FORBIDDEN)
        submission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MarkEntryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', None) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers can view marks.'}, status=status.HTTP_403_FORBIDDEN)

        school_class_id = request.query_params.get('school_class_id')
        term = request.query_params.get('term', 'term-1')

        marks = MarkEntry.objects(term=term)
        if school_class_id:
            marks = marks(school_class=SchoolClass.objects.get(id=school_class_id))

        payload = []
        for mark in marks.order_by('-recorded_at'):
            result = StudentResult.objects(student_id=mark.student_id, school_class=mark.school_class, term=mark.term).first()
            payload.append({
                'id': str(mark.id),
                'student_id': str(mark.student_id.id),
                'student_name': mark.student_id.__str__(),
                'admission_number': mark.student_id.admission_number,
                'school_class_id': str(mark.school_class.id),
                'school_class': mark.school_class.name,
                'subject': mark.subject,
                'assessment_name': mark.assessment_name,
                'score': mark.score,
                'max_score': mark.max_score,
                'term': mark.term,
                'total_score': result.total_score if result else mark.score,
                'percentage': result.percentage if result else 0,
                'grade': result.grade if result else '',
                'rank': result.rank if result else 0,
            })

        return Response({'marks': payload})

    def post(self, request):
        if getattr(request.user, 'role', None) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers can enter marks.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MarkEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = StudentProfile.objects.get(id=serializer.validated_data['student_id'])
        school_class = SchoolClass.objects.get(id=serializer.validated_data['school_class_id'])
        term = serializer.validated_data['term']

        entry = MarkEntry(
            student_id=student,
            school_class=school_class,
            subject=serializer.validated_data['subject'],
            assessment_name=serializer.validated_data['assessment_name'],
            score=serializer.validated_data['score'],
            max_score=serializer.validated_data['max_score'],
            term=term,
            teacher_id=getattr(request.user, 'id', None),
        )
        entry.save()

        result = update_student_result(student, school_class, term)
        rankings = update_class_rankings(school_class, term)

        return Response({
            'entry': {
                'id': str(entry.id),
                'student_id': str(student.id),
                'school_class_id': str(school_class.id),
                'subject': entry.subject,
                'assessment_name': entry.assessment_name,
                'score': entry.score,
                'max_score': entry.max_score,
                'term': entry.term,
            },
            'result': StudentResultSerializer({
                'student_id': str(student.id),
                'student_name': student.__str__(),
                'admission_number': student.admission_number,
                'school_class': school_class.name,
                'term': result.term,
                'total_score': result.total_score,
                'max_score': result.max_score,
                'percentage': result.percentage,
                'grade': result.grade,
                'rank': result.rank,
            }).data,
            'rankings': [
                {
                    'student_id': str(rank.student_id.id),
                    'student_name': rank.student_id.__str__(),
                    'admission_number': rank.student_id.admission_number,
                    'total_score': rank.total_score,
                    'percentage': rank.percentage,
                    'grade': rank.grade,
                    'rank': rank.rank,
                }
                for rank in rankings
            ],
        }, status=status.HTTP_201_CREATED)


class MarkEntryDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, mark_id: str):
        if getattr(request.user, 'role', None) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers can edit marks.'}, status=status.HTTP_403_FORBIDDEN)

        mark = MarkEntry.objects.get(id=mark_id)
        previous_context = (mark.student_id, mark.school_class, mark.term)

        serializer = MarkEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = StudentProfile.objects.get(id=serializer.validated_data['student_id'])
        school_class = SchoolClass.objects.get(id=serializer.validated_data['school_class_id'])

        mark.student_id = student
        mark.school_class = school_class
        mark.subject = serializer.validated_data['subject']
        mark.assessment_name = serializer.validated_data['assessment_name']
        mark.score = serializer.validated_data['score']
        mark.max_score = serializer.validated_data['max_score']
        mark.term = serializer.validated_data['term']
        mark.teacher_id = getattr(request.user, 'id', None)
        mark.save()

        for student_profile, class_profile, term in {previous_context, (student, school_class, mark.term)}:
            result = update_student_result(student_profile, class_profile, term)
            update_class_rankings(class_profile, term)

        result = StudentResult.objects(student_id=student, school_class=school_class, term=mark.term).first()

        return Response({
            'entry': {
                'id': str(mark.id),
                'student_id': str(student.id),
                'school_class_id': str(school_class.id),
                'subject': mark.subject,
                'assessment_name': mark.assessment_name,
                'score': mark.score,
                'max_score': mark.max_score,
                'term': mark.term,
            },
            'result': StudentResultSerializer({
                'student_id': str(student.id),
                'student_name': student.__str__(),
                'admission_number': student.admission_number,
                'school_class': school_class.name,
                'term': result.term if result else mark.term,
                'total_score': result.total_score if result else mark.score,
                'max_score': result.max_score if result else mark.max_score,
                'percentage': result.percentage if result else 0,
                'grade': result.grade if result else '',
                'rank': result.rank if result else 0,
            }).data,
        })

    def delete(self, request, mark_id: str):
        if getattr(request.user, 'role', None) not in {'teacher', 'admin'}:
            return Response({'detail': 'Only teachers can delete marks.'}, status=status.HTTP_403_FORBIDDEN)

        mark = MarkEntry.objects.get(id=mark_id)
        context = (mark.student_id, mark.school_class, mark.term)
        mark.delete()

        result = update_student_result(*context)
        update_class_rankings(context[1], context[2])

        return Response({
            'detail': 'Mark deleted.',
            'result_deleted': result is None,
        }, status=status.HTTP_200_OK)


class MarkEntryContextView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        school_class_id = request.query_params.get('school_class_id')

        classes = SchoolClass.objects.all().order_by('name')
        students_query = StudentProfile.objects

        if school_class_id:
            try:
                selected_class = SchoolClass.objects.get(id=school_class_id)
                students_query = StudentProfile.objects(current_class=selected_class)
            except SchoolClass.DoesNotExist:
                return Response({'detail': 'Selected class not found.'}, status=status.HTTP_404_NOT_FOUND)

        students = students_query.order_by('admission_number')

        return Response({
            'classes': [
                {
                    'id': str(item.id),
                    'name': item.name,
                    'grade_level': item.grade_level,
                    'room': item.room,
                }
                for item in classes
            ],
            'students': [
                {
                    'id': str(item.id),
                    'name': item.__str__(),
                    'admission_number': item.admission_number,
                    'class_name': item.current_class.name if item.current_class else '',
                    'gpa': item.gpa,
                }
                for item in students
            ],
        })


class ClassRankingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = RankingQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        school_class = SchoolClass.objects.get(id=serializer.validated_data['school_class_id'])
        term = serializer.validated_data['term']

        rankings = list(
            StudentResult.objects(school_class=school_class, term=term)
            .order_by('-percentage', 'student_id')
        )

        return Response({
            'school_class': school_class.name,
            'term': term,
            'rankings': [
                {
                    'student_id': str(rank.student_id.id),
                    'student_name': rank.student_id.__str__(),
                    'admission_number': rank.student_id.admission_number,
                    'total_score': rank.total_score,
                    'percentage': rank.percentage,
                    'grade': rank.grade,
                    'rank': rank.rank,
                }
                for rank in rankings
            ],
        })


class ReportPdfView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, report_key: str):
        role = getattr(request.user, 'role', None)
        if role not in {'admin', 'teacher'}:
            return Response({'detail': 'Only admins and teachers can generate reports.'}, status=status.HTTP_403_FORBIDDEN)

        report = self._build_report(report_key, request)
        buffer = BytesIO()
        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Title'],
            textColor=colors.HexColor('#0f172a'),
            fontSize=20,
            leading=24,
            spaceAfter=8,
        )
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['BodyText'],
            textColor=colors.HexColor('#334155'),
            fontSize=10,
            leading=14,
        )

        story = [
            Paragraph(report['title'], title_style),
            Paragraph(report['subtitle'], body_style),
            Spacer(1, 10),
        ]

        metric_rows = [[Paragraph('<b>Metric</b>', body_style), Paragraph('<b>Value</b>', body_style)]]
        for metric in report['metrics']:
            metric_rows.append([Paragraph(metric['label'], body_style), Paragraph(metric['value'], body_style)])

        metric_table = Table(metric_rows, colWidths=[75 * mm, 75 * mm])
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dcfce7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#14532d')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.extend([metric_table, Spacer(1, 14)])

        if report['rows']:
            table_data = [[Paragraph('<b>' + header + '</b>', body_style) for header in report['table_headers']]]
            for row in report['rows']:
                table_data.append([Paragraph(str(cell), body_style) for cell in row])

            data_table = Table(table_data, repeatRows=1)
            data_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#cbd5e1')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.extend([Paragraph(report['table_title'], styles['Heading3']), Spacer(1, 6), data_table])
        else:
            story.append(Paragraph('No detailed rows were available for this report.', body_style))

        document.build(story)
        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{report["filename"]}"'
        return response

    def _build_report(self, report_key: str, request):
        if report_key == 'attendance':
            records = list(AttendanceRecord.objects.order_by('-date').limit(12))
            present = sum(1 for record in records if record.status == AttendanceRecord.PRESENT)
            late = sum(1 for record in records if record.status == AttendanceRecord.LATE)
            absent = sum(1 for record in records if record.status == AttendanceRecord.ABSENT)
            leave = sum(1 for record in records if record.status == AttendanceRecord.LEAVE)
            return {
                'title': 'Monthly Attendance Report',
                'subtitle': 'Attendance snapshots, daily status totals, and the latest register activity.',
                'filename': 'monthly-attendance-report.pdf',
                'metrics': [
                    {'label': 'Active Students', 'value': str(StudentProfile.objects.count() or 0)},
                    {'label': 'Present', 'value': str(present)},
                    {'label': 'Late', 'value': str(late)},
                    {'label': 'Absent', 'value': str(absent)},
                    {'label': 'Leave', 'value': str(leave)},
                    {'label': 'Classes', 'value': str(SchoolClass.objects.count() or 0)},
                ],
                'table_title': 'Recent Attendance Entries',
                'table_headers': ['Student', 'Class', 'Date', 'Status'],
                'rows': [
                    [
                        record.student_id.admission_number,
                        record.student_id.current_class.name if record.student_id.current_class else 'N/A',
                        record.date.strftime('%Y-%m-%d') if record.date else '',
                        record.status.title(),
                    ]
                    for record in records
                ],
            }

        if report_key == 'report-card':
            student_id = request.query_params.get('student_id')
            term = request.query_params.get('term', 'term-1')

            if not student_id:
                return {
                    'title': 'Student Report Card',
                    'subtitle': 'A report card requires a student_id query parameter.',
                    'filename': 'student-report-card.pdf',
                    'metrics': [],
                    'table_title': 'Details',
                    'table_headers': ['Field', 'Value'],
                    'rows': [],
                }

            student = StudentProfile.objects.get(id=student_id)
            school_class = student.current_class
            result = StudentResult.objects(student_id=student, school_class=school_class, term=term).first() if school_class else None
            marks = list(MarkEntry.objects(student_id=student, term=term).order_by('subject', 'assessment_name'))
            attendance_rate = student.attendance_rate or 0
            fee_balance = student.fee_balance or 0

            subject_rows = []
            subject_totals = {}
            for mark in marks:
                bucket = subject_totals.setdefault(mark.subject, {'score': 0, 'max_score': 0})
                bucket['score'] += float(mark.score)
                bucket['max_score'] += float(mark.max_score)

            for subject, totals in sorted(subject_totals.items()):
                percentage = round((totals['score'] / totals['max_score']) * 100, 2) if totals['max_score'] else 0
                subject_rows.append([
                    subject,
                    f"{totals['score']:.0f}/{totals['max_score']:.0f}",
                    f'{percentage}%',
                    calculate_grade(percentage),
                ])

            return {
                'title': f'{student.full_display_name} Report Card',
                'subtitle': f'Term {term} academic report for {student.admission_number}.',
                'filename': f'{student.admission_number}-{term}-report-card.pdf',
                'metrics': [
                    {'label': 'Student', 'value': student.full_display_name},
                    {'label': 'Admission Number', 'value': student.admission_number},
                    {'label': 'Class', 'value': school_class.name if school_class else 'N/A'},
                    {'label': 'Attendance', 'value': f'{attendance_rate}%'},
                    {'label': 'Fee Balance', 'value': f'KES {float(fee_balance):,.0f}'},
                    {'label': 'Overall Grade', 'value': result.grade if result else 'N/A'},
                    {'label': 'Overall Rank', 'value': f'#{result.rank}' if result and result.rank else 'N/A'},
                ],
                'table_title': 'Subject Breakdown',
                'table_headers': ['Subject', 'Total', 'Percentage', 'Grade'],
                'rows': subject_rows,
            }

        if report_key == 'fees':
            invoices = list(FeeInvoice.objects.order_by('-due_date').limit(10))
            paid_total = sum(float(invoice.paid_amount) for invoice in invoices)
            balance_total = sum(max(float(invoice.amount) - float(invoice.paid_amount), 0) for invoice in invoices)
            return {
                'title': 'Fee Collection Summary',
                'subtitle': 'Fee collection overview, balances, and the latest payment activity.',
                'filename': 'fee-collection-summary.pdf',
                'metrics': [
                    {'label': 'Invoices Tracked', 'value': str(len(invoices))},
                    {'label': 'Paid Total', 'value': f'KES {paid_total:,.0f}'},
                    {'label': 'Outstanding Balance', 'value': f'KES {balance_total:,.0f}'},
                ],
                'table_title': 'Recent Fee Invoices',
                'table_headers': ['Reference', 'Student', 'Amount', 'Paid', 'Status'],
                'rows': [
                    [
                        invoice.reference,
                        invoice.student_id.admission_number,
                        f'KES {float(invoice.amount):,.0f}',
                        f'KES {float(invoice.paid_amount):,.0f}',
                        invoice.status.title(),
                    ]
                    for invoice in invoices
                ],
            }

        if report_key == 'performance':
            results = list(StudentResult.objects.order_by('-percentage').limit(10))
            return {
                'title': 'Student Performance Report',
                'subtitle': 'Top performance rows generated from the latest computed term results.',
                'filename': 'student-performance-report.pdf',
                'metrics': [
                    {'label': 'Ranked Students', 'value': str(len(results))},
                    {'label': 'Top Percentage', 'value': f"{results[0].percentage}%" if results else '0%'},
                    {'label': 'Average Percentage', 'value': f"{(sum(result.percentage for result in results) / len(results)):.2f}%" if results else '0%'},
                ],
                'table_title': 'Top Ranked Students',
                'table_headers': ['Rank', 'Student', 'Class', 'Percentage', 'Grade'],
                'rows': [
                    [
                        result.rank or idx,
                        result.student_id.admission_number,
                        result.school_class.name,
                        f'{result.percentage}%',
                        result.grade,
                    ]
                    for idx, result in enumerate(results, start=1)
                ],
            }

        return {
            'title': 'School Portal Report',
            'subtitle': 'Generic school report generated from backend data.',
            'filename': f'{report_key or "report"}.pdf',
            'metrics': [],
            'table_title': 'Details',
            'table_headers': ['Field', 'Value'],
            'rows': [],
        }


def _resolve_fee_invoice(identifier: str):
    if not identifier:
        return None

    invoice = FeeInvoice.objects(id=identifier).first()
    if invoice:
        return invoice

    return FeeInvoice.objects(reference=identifier).first()


def _normalize_mpesa_phone(phone_number: str) -> str:
    digits = ''.join(character for character in (phone_number or '') if character.isdigit())
    if not digits:
        return ''
    if digits.startswith('0') and len(digits) >= 10:
        return f'254{digits[1:]}'
    if digits.startswith('254'):
        return digits
    if len(digits) == 9:
        return f'254{digits}'
    return digits


def _student_phone_number(student: StudentProfile) -> str:
    try:
        user = SchoolUser.objects.get(id=student.user_id)
        return _normalize_mpesa_phone(user.phone_number or '')
    except Exception:
        return ''


def _sync_fee_invoice_totals(invoice: FeeInvoice):
    successful_payments = FeePayment.objects(invoice=invoice, status=FeePayment.SUCCESS)
    paid_total = round(sum(float(payment.amount) for payment in successful_payments), 2)
    invoice.paid_amount = min(paid_total, float(invoice.amount))

    if invoice.paid_amount >= float(invoice.amount):
        invoice.status = FeeInvoice.PAID
    elif invoice.paid_amount > 0:
        invoice.status = FeeInvoice.PARTIAL
    elif invoice.due_date and invoice.due_date < datetime.utcnow():
        invoice.status = FeeInvoice.OVERDUE
    else:
        invoice.status = FeeInvoice.PENDING

    invoice.save()
    AdminFeeCollectionView()._sync_fee_balance(invoice.student_id)


def _serialize_fee_payment(payment: FeePayment):
    try:
        return {
            'id': str(payment.id),
            'invoice_id': str(payment.invoice.id) if payment.invoice else 'Unknown',
            'invoice_reference': payment.invoice.reference if payment.invoice else 'Unknown',
            'student_id': str(payment.student_id.id) if payment.student_id else 'Unknown',
            'student': payment.student_id.admission_number if payment.student_id else 'Unknown',
            'payment_method': payment.payment_method,
            'phone_number': payment.phone_number,
            'amount': f'{float(payment.amount or 0):,.0f}',
            'status': payment.status,
            'checkout_request_id': payment.checkout_request_id or '',
            'merchant_request_id': payment.merchant_request_id or '',
            'mpesa_receipt_number': payment.mpesa_receipt_number or '',
            'result_code': payment.result_code or '',
            'result_description': payment.result_description or '',
            'initiated_at': payment.initiated_at.isoformat() if payment.initiated_at else '',
            'completed_at': payment.completed_at.isoformat() if payment.completed_at else '',
            'raw_payload': payment.raw_payload or {},
        }
    except Exception as e:
        # Return a minimal response if serialization fails
        return {
            'id': str(payment.id),
            'invoice_id': 'Error',
            'invoice_reference': 'Error',
            'student_id': 'Error',
            'student': 'Error',
            'payment_method': payment.payment_method,
            'phone_number': payment.phone_number,
            'amount': '0',
            'status': payment.status,
            'error': str(e),
        }


def _serialize_fee_invoice_statement(invoice: FeeInvoice):
    try:
        payments = list(FeePayment.objects(invoice=invoice).order_by('-initiated_at'))
        student = invoice.student_id
        
        return {
            'id': str(invoice.id),
            'reference': invoice.reference,
            'student_id': str(student.id) if student else 'Unknown',
            'student': student.admission_number if student else 'Unknown',
            'student_name': student.full_display_name if student else 'Unknown',
            'class': student.current_class.name if student and student.current_class else 'N/A',
            'amount': float(invoice.amount or 0),
            'paid_amount': float(invoice.paid_amount or 0),
            'outstanding_amount': max(float(invoice.amount or 0) - float(invoice.paid_amount or 0), 0),
            'status': invoice.status,
            'due_date': invoice.due_date.isoformat() if invoice.due_date else '',
            'payments': [_serialize_fee_payment(payment) for payment in payments],
        }
    except Exception as e:
        # Return a minimal response if serialization fails
        return {
            'id': str(invoice.id),
            'reference': invoice.reference,
            'student_id': 'Error',
            'student': 'Error',
            'student_name': 'Error',
            'class': 'Error',
            'amount': 0,
            'paid_amount': 0,
            'outstanding_amount': 0,
            'status': invoice.status,
            'due_date': '',
            'payments': [],
            'error': str(e),
        }


def _receipt_filename(payment: FeePayment):
    reference = payment.invoice.reference if payment.invoice else 'receipt'
    return f'{reference}-receipt.pdf'


def _mpesa_configured():
    required = [
        settings.MPESA_CONSUMER_KEY,
        settings.MPESA_CONSUMER_SECRET,
        settings.MPESA_SHORTCODE,
        settings.MPESA_PASSKEY,
        settings.MPESA_CALLBACK_URL,
    ]
    return bool(settings.MPESA_ENABLED and all(required))


def _mpesa_base_url():
    return 'https://sandbox.safaricom.co.ke' if settings.MPESA_ENVIRONMENT != 'production' else 'https://api.safaricom.co.ke'


def _mpesa_access_token():
    credentials = f'{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}'.encode('utf-8')
    request = urllib.request.Request(
        f"{_mpesa_base_url()}/oauth/v1/generate?grant_type=client_credentials",
        headers={
            'Authorization': f"Basic {base64.b64encode(credentials).decode('utf-8')}",
        },
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.loads(response.read().decode('utf-8'))
    return payload.get('access_token') or ''


def _mpesa_timestamp(now: datetime | None = None):
    return (now or datetime.utcnow()).strftime('%Y%m%d%H%M%S')


def _mpesa_password(timestamp: str):
    raw = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}".encode('utf-8')
    return base64.b64encode(raw).decode('utf-8')


def _mpesa_stk_push(phone_number: str, amount: float, reference: str, description: str):
    access_token = _mpesa_access_token()
    if not access_token:
        raise RuntimeError('Unable to obtain M-Pesa access token.')

    timestamp = _mpesa_timestamp()
    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE,
        'Password': _mpesa_password(timestamp),
        'Timestamp': timestamp,
        'TransactionType': 'CustomerPayBillOnline',
        'Amount': int(round(amount)),
        'PartyA': phone_number,
        'PartyB': settings.MPESA_SHORTCODE,
        'PhoneNumber': phone_number,
        'CallBackURL': settings.MPESA_CALLBACK_URL,
        'AccountReference': settings.MPESA_ACCOUNT_REFERENCE or reference,
        'TransactionDesc': description or settings.MPESA_TRANSACTION_DESC,
    }

    request = urllib.request.Request(
        f'{_mpesa_base_url()}/mpesa/stkpush/v1/processrequest',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))


class FeePaymentCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            role = _user_role(request.user)
            page, page_size = _pagination(request)
            queryset = FeePayment.objects.order_by('-initiated_at')

            if role == 'student':
                student = _student_profile(request.user)
                if not student:
                    return Response({'payments': [], 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})
                queryset = queryset(student_id=student)
            elif role == 'parent':
                parent = _parent_profile(request.user)
                if not parent:
                    return Response({'payments': [], 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})
                child_ids = [child.id for child in parent.children_ids if child is not None]
                queryset = queryset(student_id__in=child_ids)
            elif role != 'admin':
                return Response({'detail': 'Role cannot access fee payments.'}, status=status.HTTP_403_FORBIDDEN)

            total = queryset.count()
            payments = [_serialize_fee_payment(payment) for payment in queryset.skip((page - 1) * page_size).limit(page_size)]
            return Response({'payments': payments, 'page': page, 'page_size': page_size, 'total': total, 'total_pages': max((total + page_size - 1) // page_size, 1)})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Error loading fee payments.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        role = _user_role(request.user)
        if role not in {'student', 'parent', 'admin'}:
            return Response({'detail': 'Only students, parents, or admins can initiate fee payments.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MpesaPaymentWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        invoice = None
        if data.get('invoice_id'):
            invoice = _resolve_fee_invoice(data['invoice_id'])
        elif data.get('reference'):
            invoice = _resolve_fee_invoice(data['reference'])

        if invoice is None and role in {'student', 'parent'}:
            current_student = _student_profile(request.user)
            if current_student:
                for candidate in FeeInvoice.objects(student_id=current_student).order_by('-due_date', '-id'):
                    if float(candidate.paid_amount or 0) < float(candidate.amount or 0):
                        invoice = candidate
                        break
            else:
                parent = _parent_profile(request.user)
                if parent:
                    child_ids = [child.id for child in parent.children_ids if child is not None]
                    for candidate in FeeInvoice.objects(student_id__in=child_ids).order_by('-due_date', '-id'):
                        if float(candidate.paid_amount or 0) < float(candidate.amount or 0):
                            invoice = candidate
                            break

        if invoice is None:
            return Response({'detail': 'Fee invoice not found.'}, status=status.HTTP_404_NOT_FOUND)

        student = invoice.student_id
        if not student:
            return Response({'detail': 'Invoice student reference is invalid.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if role == 'student':
            current_student = _student_profile(request.user)
            if not current_student or str(current_student.id) != str(student.id):
                return Response({'detail': 'You can only pay your own fee invoices.'}, status=status.HTTP_403_FORBIDDEN)
        elif role == 'parent':
            parent = _parent_profile(request.user)
            child_ids = {str(child.id) for child in parent.children_ids if child is not None} if parent else set()
            if str(student.id) not in child_ids:
                return Response({'detail': 'You can only pay invoices for your children.'}, status=status.HTTP_403_FORBIDDEN)

        # Safe calculation with null checks
        amount_due = max(float(invoice.amount or 0) - float(invoice.paid_amount or 0), 0)
        amount = float(data.get('amount') or amount_due or invoice.amount or 0)
        if amount <= 0:
            return Response({'detail': 'Invoice does not have an outstanding amount.'}, status=status.HTTP_400_BAD_REQUEST)
        if amount > amount_due and amount_due > 0:
            amount = amount_due

        phone_number = _normalize_mpesa_phone(data.get('phone_number') or _student_phone_number(student))
        if not phone_number:
            return Response({'detail': 'A valid phone number is required for M-Pesa payment initiation.'}, status=status.HTTP_400_BAD_REQUEST)

        checkout_request_id = f'ws-{secrets.token_hex(8)}'
        merchant_request_id = f'mr-{secrets.token_hex(6)}'

        payment = FeePayment(
            invoice=invoice,
            student_id=student,
            payment_method=FeePayment.PAYMENT_METHOD_MPESA,
            phone_number=phone_number,
            amount=round(amount, 2),
            status=FeePayment.PENDING,
            checkout_request_id=checkout_request_id,
            merchant_request_id=merchant_request_id,
            initiated_at=datetime.utcnow(),
            raw_payload={
                'initiated_by': getattr(request.user, 'username', 'system'),
                'invoice_reference': invoice.reference,
                'simulated': True,
            },
        )
        payment.save()

        if _mpesa_configured():
            try:
                mpesa_response = _mpesa_stk_push(
                    phone_number=phone_number,
                    amount=amount,
                    reference=invoice.reference,
                    description=f'Fee payment for {student.admission_number}',
                )
                payment.checkout_request_id = mpesa_response.get('CheckoutRequestID', payment.checkout_request_id)
                payment.merchant_request_id = mpesa_response.get('MerchantRequestID', payment.merchant_request_id)
                payment.raw_payload = {
                    'gateway': 'safaricom',
                    'response': mpesa_response,
                }
                payment.save()

                return Response({
                    'payment': _serialize_fee_payment(payment),
                    'message': mpesa_response.get('CustomerMessage') or 'M-Pesa STK push sent to the provided phone number.',
                }, status=status.HTTP_201_CREATED)
            except (urllib.error.URLError, RuntimeError, ValueError) as exc:
                payment.status = FeePayment.FAILED
                payment.result_description = str(exc)
                payment.raw_payload = {
                    'gateway': 'safaricom',
                    'error': str(exc),
                }
                payment.save()
                return Response({'detail': f'M-Pesa request failed: {exc}'}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({
            'payment': _serialize_fee_payment(payment),
            'message': 'M-Pesa payment request created in demo mode. Configure MPESA_* environment variables to enable live STK Push.',
        }, status=status.HTTP_201_CREATED)


class FeeStatementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            role = _user_role(request.user)
            page, page_size = _pagination(request)

            invoices = []
            student_ids = []

            if role == 'student':
                student = _student_profile(request.user)
                if not student:
                    return Response({'statements': [], 'payments': [], 'summary': {}, 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})
                student_ids = [student.id]
            elif role == 'parent':
                parent = _parent_profile(request.user)
                if not parent:
                    return Response({'statements': [], 'payments': [], 'summary': {}, 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})
                student_ids = [child.id for child in parent.children_ids if child is not None]
            elif role == 'admin':
                student_ids = [student.id for student in StudentProfile.objects]
            else:
                return Response({'detail': 'Role cannot access fee statements.'}, status=status.HTTP_403_FORBIDDEN)

            if not student_ids:
                return Response({'statements': [], 'payments': [], 'summary': {'invoiced': 0, 'paid': 0, 'outstanding': 0}, 'page': page, 'page_size': page_size, 'total': 0, 'total_pages': 1})

            invoices = list(FeeInvoice.objects(student_id__in=student_ids).order_by('-due_date', '-id'))
            payments_query = FeePayment.objects(student_id__in=student_ids).order_by('-initiated_at')
            total = len(invoices)
            statement_rows = [_serialize_fee_invoice_statement(invoice) for invoice in invoices[(page - 1) * page_size: page * page_size]]
            payment_rows = [_serialize_fee_payment(payment) for payment in list(payments_query.limit(12))]

            # Safe aggregations with null checks
            invoiced_total = sum(float(invoice.amount or 0) for invoice in invoices)
            paid_total = sum(float(invoice.paid_amount or 0) for invoice in invoices)
            outstanding_total = sum(max(float(invoice.amount or 0) - float(invoice.paid_amount or 0), 0) for invoice in invoices)

            return Response({
                'statements': statement_rows,
                'payments': payment_rows,
                'summary': {
                    'invoiced': f'{invoiced_total:,.0f}',
                    'paid': f'{paid_total:,.0f}',
                    'outstanding': f'{outstanding_total:,.0f}',
                },
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': max((total + page_size - 1) // page_size, 1),
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Error loading fee statements.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FeePaymentReceiptPdfView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_id: str):
        payment = FeePayment.objects.get(id=payment_id)
        role = _user_role(request.user)

        if role == 'student':
            student = _student_profile(request.user)
            if not student or str(student.id) != str(payment.student_id.id):
                return Response({'detail': 'You can only view your own receipts.'}, status=status.HTTP_403_FORBIDDEN)
        elif role == 'parent':
            parent = _parent_profile(request.user)
            child_ids = {str(child.id) for child in parent.children_ids if child is not None} if parent else set()
            if str(payment.student_id.id) not in child_ids:
                return Response({'detail': 'You can only view receipts for your children.'}, status=status.HTTP_403_FORBIDDEN)
        elif role != 'admin':
            return Response({'detail': 'Role cannot access receipts.'}, status=status.HTTP_403_FORBIDDEN)

        buffer = BytesIO()
        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'ReceiptTitle',
            parent=styles['Title'],
            textColor=colors.HexColor('#0f172a'),
            fontSize=20,
            leading=24,
            spaceAfter=8,
        )
        body_style = ParagraphStyle(
            'ReceiptBody',
            parent=styles['BodyText'],
            textColor=colors.HexColor('#334155'),
            fontSize=10,
            leading=14,
        )

        story = [
            Paragraph('Fee Payment Receipt', title_style),
            Paragraph(f'Student: {payment.student_id.full_display_name}', body_style),
            Paragraph(f'Admission Number: {payment.student_id.admission_number}', body_style),
            Paragraph(f'Invoice Reference: {payment.invoice.reference}', body_style),
            Paragraph(f'Payment Status: {payment.status.title()}', body_style),
            Spacer(1, 10),
        ]

        detail_rows = [[Paragraph('<b>Field</b>', body_style), Paragraph('<b>Value</b>', body_style)]]
        detail_rows.extend([
            [Paragraph('Amount', body_style), Paragraph(f'KES {float(payment.amount):,.0f}', body_style)],
            [Paragraph('Phone Number', body_style), Paragraph(payment.phone_number or '', body_style)],
            [Paragraph('Checkout Request ID', body_style), Paragraph(payment.checkout_request_id or '', body_style)],
            [Paragraph('Merchant Request ID', body_style), Paragraph(payment.merchant_request_id or '', body_style)],
            [Paragraph('Receipt Number', body_style), Paragraph(payment.mpesa_receipt_number or 'Pending', body_style)],
            [Paragraph('Initiated At', body_style), Paragraph(payment.initiated_at.isoformat() if payment.initiated_at else '', body_style)],
            [Paragraph('Completed At', body_style), Paragraph(payment.completed_at.isoformat() if payment.completed_at else '', body_style)],
        ])

        detail_table = Table(detail_rows, colWidths=[75 * mm, 75 * mm])
        detail_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dcfce7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#14532d')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        story.append(detail_table)
        document.build(story)
        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{_receipt_filename(payment)}"'
        return response


class FeePaymentCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        callback_data = request.data

        if 'Body' in callback_data and isinstance(callback_data['Body'], dict):
            stk = callback_data['Body'].get('stkCallback', {})
            callback_metadata = stk.get('CallbackMetadata', {}).get('Item', [])
            parsed = {
                'checkout_request_id': stk.get('CheckoutRequestID', ''),
                'result_code': str(stk.get('ResultCode', '')),
                'result_description': stk.get('ResultDesc', ''),
                'raw_payload': callback_data,
            }
            for item in callback_metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    parsed['mpesa_receipt_number'] = item.get('Value', '')
                if item.get('Name') == 'Amount':
                    parsed['amount'] = item.get('Value', 0)
            serializer = MpesaCallbackSerializer(data=parsed)
        else:
            serializer = MpesaCallbackSerializer(data=callback_data)

        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        payment = FeePayment.objects(checkout_request_id=data['checkout_request_id']).first()
        if payment is None:
            return Response({'detail': 'Payment request not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment.raw_payload = data.get('raw_payload') or request.data
        payment.result_code = str(data.get('result_code', payment.result_code or '0'))
        payment.result_description = data.get('result_description', payment.result_description or '')
        payment.mpesa_receipt_number = data.get('mpesa_receipt_number', payment.mpesa_receipt_number or '')
        if data.get('amount'):
            payment.amount = data['amount']
        payment.completed_at = datetime.utcnow()

        success_code = payment.result_code in {'0', '00', 'Success'}
        if success_code:
            payment.status = FeePayment.SUCCESS
            if not payment.mpesa_receipt_number:
                payment.mpesa_receipt_number = f'MPESA-{secrets.token_hex(4).upper()}'
            payment.save()
            _sync_fee_invoice_totals(payment.invoice)
        else:
            payment.status = FeePayment.FAILED
            payment.save()

        return Response({'payment': _serialize_fee_payment(payment)})
