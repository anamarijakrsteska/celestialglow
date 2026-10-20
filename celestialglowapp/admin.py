from django.utils import timezone
from django.contrib import admin
from .models import SessionSlot, Booking

# Register your models here.
@admin.register(SessionSlot)
class SessionSlotAdmin(admin.ModelAdmin):
    list_display = ("id", "local_start_time", "duration_minutes")

    @admin.display(description="Start time", ordering="start_time")
    def local_start_time(self, obj):
        return timezone.localtime(obj.start_time).strftime("%d %b %Y, %H:%M")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("booking_name", "local_session_time", "session_duration", )

    @admin.display(description="Booking")
    def booking_name(self, obj):
        return obj.name

    @admin.display(description="Session time", ordering="slot__start_time")
    def local_session_time(self, obj):
        return timezone.localtime(
            obj.slot.start_time
        ).strftime("%d %b %Y, %H:%M")

    @admin.display(description="Duration", ordering="slot__duration_minutes")
    def session_duration(self, obj):
        return f"{obj.slot.duration_minutes} minutes"

