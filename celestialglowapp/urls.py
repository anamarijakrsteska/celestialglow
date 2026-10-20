from django.urls import path

from .views import (
    AvailableSlotsView,
    BookingCreateView,
    google_calendar_connect,
    google_calendar_callback, booking_confirmation,
)

urlpatterns = [
    path("slots/", AvailableSlotsView.as_view(), name="available-slots"),
    path("bookings/", BookingCreateView.as_view(), name="create-booking"),
    path("google-calendar/connect/", google_calendar_connect, name="google-calendar-connect",),
    path("google-calendar/callback/", google_calendar_callback, name="google-calendar-callback",),
    path("ai/booking-confirmation/", booking_confirmation, name="booking-confirmation",),
]
