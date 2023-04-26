from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response


# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            # Create a session
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        # Check if the data is valid
        if serializer.is_valid():
            # Get the data from the serializer
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            # Get the user from the session
            host = self.request.session.session_key
            # Check if the room already exists
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                # If the room exists, update the room
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                # Save the room
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                # Return the response
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                # If the room does not exist, create the room
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                # Save the room
                room.save()
                # Return the response
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
