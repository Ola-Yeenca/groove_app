from django.urls import path
from .views import RoomView, CreateRoomView, RoomRetrieve, JoinRoom, UserInRoom, ExitRoom, UpdateRoom



urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('get-room', RoomRetrieve.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('exit-room', ExitRoom.as_view()),
    path('update-room', UpdateRoom.as_view()),
]
