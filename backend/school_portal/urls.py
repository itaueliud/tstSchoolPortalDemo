from django.contrib import admin
from django.urls import include, path

from apps.common.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/dashboard/', include('apps.portal.urls')),
    path('api/reports/', include('apps.portal.report_urls')),
]
