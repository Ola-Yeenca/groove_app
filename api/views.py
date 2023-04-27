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

class RoomRetrieve(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'roomCode'

    def get(self, request, format=None):
        room_code = request.GET.get(self.lookup_url_kwarg)
        if room_code != None:
            room = Room.objects.filter(code=room_code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                self.request.session['room_code'] = room.code
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'Bad Request': 'You need to provide a Room Code to enter'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    lookup_url_kwarg = 'roomCode'

    def post(self, request, format=None):
        # Check if the session exists
        if not self.request.session.exists(self.request.session.session_key):
            # Create a session
            self.request.session.create()

        # Get the room code from the request
        room_code = request.data.get(self.lookup_url_kwarg)
        # Check if the room code exists
        if room_code != None:
            # Get the room with the given code
            room = Room.objects.filter(code=room_code)
            # Check if the room exists
            if len(room) > 0:
                # Get the room
                room = room[0]
                # Add the user to the room
                self.request.session['room_code'] = room.code
                # Return the response
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            else:
                # Return the response
                return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Return the response
            return Response({'Bad Request': 'Invalid post data, did not find a room code'}, status=status.HTTP_400_BAD_REQUEST)



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
                self.request.session['room_code'] = room.code
                # Return the response
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                # If the room does not exist, create the room
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                # Save the room
                room.save()
                self.request.seeion['room_code'] = room.code
                # Return the response
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
