from .models import Room
from rest_framework import serializers
from django.core.exceptions import ValidationError


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause',
                'votes_to_skip', 'created_at')


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')


def validate_room_code(value):
    # Implement your validation logic here
    if not value.startswith('ROOM'):
        raise ValidationError("Room code must start with 'ROOM'.")
class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[validate_room_code])
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')
