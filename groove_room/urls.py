from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
<<<<<<< HEAD:urls.py
    path('api/', include('api.urls')),
=======
    path('', include('api.urls')),
>>>>>>> 182f84f72f0df3eeabcab42e6bd3c44f952ded87:groove_room/urls.py
    path('', include('frontend.urls')),
]
