from django.urls import path

from .views import ReportPdfView

urlpatterns = [
    path('<str:report_key>/pdf/', ReportPdfView.as_view(), name='report-pdf'),
]