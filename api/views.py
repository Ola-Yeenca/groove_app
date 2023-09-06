from rest_framework.decorators import permission_classes
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging


logger = logging.getLogger(__name__)
# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class RoomRetrieve(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'roomCode'

    def get(self, request, format=None):
        room_code = request.GET.get(self.lookup_url_kwarg)
        if room_code is not None:
            room = Room.objects.filter(code=room_code).first()
            if room:
                data = RoomSerializer(room).data
                data['is_host'] = self.request.session.session_key == room.host
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
        if room_code is not None:
            room = Room.objects.filter(code=room_code).first()
            if room:
                self.request.session['room_code'] = room.code
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            else:
                return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'Bad Request': 'Invalid post data, did not find a room code'}, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
class CreateRoomView(APIView):
    http_method_names = ['post']
    serializer_class = CreateRoomSerializer
    lookup_url_kwarg = 'roomCode'
    

    def post(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        host = request.session.session_key

        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        guest_can_pause = serializer.data.get('guest_can_pause')
        votes_to_skip = serializer.data.get('votes_to_skip')
        room_code = request.data.get(self.lookup_url_kwarg)

        try:
            room = Room.objects.get(code=room_code)
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
        except Room.DoesNotExist:
            room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
            room.save()

        request.session['room_code'] = room.code
        return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }
        return Response(data, status=status.HTTP_200_OK)

class ExitRoom(APIView):
    def post(self, request, format=None):
        # Check if the host wants to leave the room
        host_id = self.request.session.session_key
        room = Room.objects.filter(host=host_id).first()

        if room:
            room.delete()

        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            session_key = self.request.session.session_key
            self.request.session.delete(session_key)

        return Response({'message': 'Success'}, status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    lookup_url_kwarg = 'roomCode'

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        room_code = request.data.get(self.lookup_url_kwarg)
        if room_code is not None:
            room = Room.objects.filter(code=room_code).first()
            if room:
                if self.request.session.session_key == room.host:
                    serializer = self.serializer_class(data=request.data)
                    if serializer.is_valid():
                        guest_can_pause = serializer.data.get('guest_can_pause')
                        votes_to_skip = serializer.data.get('votes_to_skip')

                        room.guest_can_pause = guest_can_pause
                        room.votes_to_skip = votes_to_skip
                        room.save(update_fields=['guest_can_pause', 'votes_to_skip'])

                        return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
                    return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
                return Response({'Forbidden': 'You are not the host of this room'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': 'Invalid post data, did not find a room code'}, status=status.HTTP_400_BAD_REQUEST)
