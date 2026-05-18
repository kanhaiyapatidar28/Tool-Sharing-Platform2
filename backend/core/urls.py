from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def index_view(request):
    return HttpResponse("<h2>ToolShare Backend is Running</h2><p>All API endpoints are located under <code>/api/</code>.</p>")

urlpatterns = [
    path('', index_view, name='index'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
