from django.urls import path
from .views import RoomView, CreateRoomView, RoomRetrieve, JoinRoom



urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', RoomRetrieve.as_view()),
    path('join-room', JoinRoom.as_view()),
]
