from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


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
    http_method_names = ['post']
    serializer_class = CreateRoomSerializer
    lookup_url_kwarg = 'roomCode'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            room_code = self.kwargs.get(self.lookup_url_kwarg)

            if room_code:
                # Retrieve existing room if it exists
                room = Room.objects.filter(code=room_code).first()
                if room:
                    room.guest_can_pause = guest_can_pause
                    room.votes_to_skip = votes_to_skip
                    room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                else:
                    return Response({'Error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Create a new room
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()

            self.request.session['room_code'] = room.code
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    def get(self, request, format=None):
        # Check if the session exists
        if not self.request.session.exists(self.request.session.session_key):
            # Create a session
            self.request.session.create()

        # Return the response
        data = {
            'code': self.request.session.get('room_code')
        }
        return Response(data, status=status.HTTP_200_OK)


class ExitRoom(APIView):
    def post(self, request, format=None):
        # check if the host wants to leave the room
        host_id = self.reques.session.session_key
        room = Room.objects.filter(host=host_id)
        if len(room) > 0:
            room = room[0]
            room.delete()
        # Check if the session exists
        if 'room_code' in self.request.session:
            # Delete the room code from the session
            self.request.session.pop('room_code')
            # Get the session key
            session_key = self.request.session.session_key
            # Delete the session
            self.request.session.delete(session_key)
        # Return the response
        return Response({'message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    lookup_url_kwarg = 'roomCode'


    def patch(self, request, format=None):
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
                # Check if the user is the host
                if self.request.session.session_key == room.host:
                    # Get the serializer
                    serializer = self.serializer_class(data=request.data)
                    # Check if the data is valid
                    if serializer.is_valid():
                        # Get the data from the serializer
                        guest_can_pause = serializer.data.get('guest_can_pause')
                        votes_to_skip = serializer.data.get('votes_to_skip')
                        # Update the room
                        room.guest_can_pause = guest_can_pause
                        room.votes_to_skip = votes_to_skip
                        # Save the room
                        room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                        # Return the response
                        return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
                    # Return the response
                    return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
                # Return the response
                return Response({'Forbidden': 'You are not the host of this room'}, status=status.HTTP_403_FORBIDDEN)
            # Return the response
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        # Return the response
        return Response({'Bad Request': 'Invalid post data, did not find a room code'}, status=status.HTTP_400_BAD_REQUEST)
