from rest_framework import serializers
from django.utils import timezone
from .models import SessionSlot, Booking


class SessionSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionSlot
        fields = ["id", "start_time", "duration_minutes"]

    def validate_start_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError(
                "The session must start in the future."
            )
        return value


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "slot", "name", "email", "booked_at"]
        read_only_fields = ["id", "booked_at"]

    def validate_slot(self, slot):
        if slot.start_time <= timezone.now():
            raise serializers.ValidationError(
                "This session has already started and cannot be booked."
            )

        if Booking.objects.filter(slot=slot).exists():
            raise serializers.ValidationError(
                "This session has already been booked."
            )

        return slot
