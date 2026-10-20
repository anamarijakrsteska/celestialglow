import os
import json
import logging
logger = logging.getLogger(__name__)
from datetime import datetime, timedelta
from rest_framework.exceptions import APIException
from rest_framework import generics, serializers
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST
from django.db import IntegrityError, transaction
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .google_calendar import get_google_flow, get_busy_intervals, save_credentials
from .models import SessionSlot, Booking
from .serializers import (SessionSlotSerializer, BookingSerializer,)
from google import genai


# Returns only future sessions that haven't been booked
class AvailableSlotsView(generics.ListAPIView):
    serializer_class = SessionSlotSerializer

    def get_queryset(self):
        now = timezone.now()

        slots = list(
            SessionSlot.objects.filter(
                start_time__gt=now,
                booking__isnull=True,
            ).order_by("start_time")
        )

        if not slots:
            return slots

        # Check the full time range covering all candidate sessions.
        range_start = min(slot.start_time for slot in slots)
        range_end = max(
            slot.start_time + timedelta(minutes=slot.duration_minutes)
            for slot in slots
        )

        try:
            busy_intervals = get_busy_intervals(
                self.request,
                range_start,
                range_end,
            )
        except Exception:
            # Fail safely instead of advertising potentially conflicting slots.
            raise APIException(
                "Google Calendar could not be checked. Please try again later."
            )


        # If the host hasn't connected Google Calendar, retain normal availability.
        if busy_intervals is None:
            return slots

        available_slots = []

        for slot in slots:
            slot_start = slot.start_time
            slot_end = slot_start + timedelta(
                minutes=slot.duration_minutes
            )

            overlaps = any(
                slot_start < datetime.fromisoformat(
                    busy["end"].replace("Z", "+00:00")
                )
                and slot_end > datetime.fromisoformat(
                    busy["start"].replace("Z", "+00:00")
                )
                for busy in busy_intervals
            )

            if not overlaps:
                available_slots.append(slot)

        return available_slots


# Accepts a reservation request and validates it before saving
class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()
        except IntegrityError:
            raise serializers.ValidationError({
                "slot": "This session has already been booked."
            })


@require_GET
def google_calendar_connect(request):
    flow = get_google_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent select_account",
    )

    request.session["google_calendar_oauth_state"] = state
    request.session["google_calendar_code_verifier"] = flow.code_verifier
    request.session.save()

    return redirect(authorization_url)


@require_GET
def google_calendar_callback(request):
    if request.GET.get("error"):
        return JsonResponse(
            {"error": "Google Calendar authorization was not completed."},
            status=400,
        )

    expected_state = request.session.get("google_calendar_oauth_state")
    returned_state = request.GET.get("state")
    code_verifier = request.session.get("google_calendar_code_verifier")

    if not expected_state or returned_state != expected_state:
        return JsonResponse(
            {"error": "Invalid OAuth state. Please try connecting again."},
            status=400,
        )

    if not code_verifier:
        return JsonResponse(
            {"error": "Missing OAuth code verifier. Please reconnect."},
            status=400,
        )

    flow = get_google_flow(state=expected_state)
    flow.code_verifier = code_verifier

    flow.fetch_token(
        authorization_response=request.build_absolute_uri()
    )

    save_credentials(flow.credentials)

    request.session.pop("google_calendar_oauth_state", None)
    request.session.pop("google_calendar_code_verifier", None)

    return JsonResponse({
        "message": "Google Calendar connected successfully."
    })


@csrf_exempt
@require_POST
def booking_confirmation(request):
    if not os.environ.get("GEMINI_API_KEY"):
        logger.error("Gemini API key is not configured.")
        return JsonResponse(
            {"error": "AI confirmation is temporarily unavailable."},
            status=503,
        )

    try:
        data = json.loads(request.body)
        booking_id = data.get("booking_id")

        if not booking_id:
            return JsonResponse(
                {"error": "booking_id is required."},
                status=400,
            )

        booking = Booking.objects.select_related("slot").get(
            id=booking_id
        )

        session_time = timezone.localtime(
            booking.slot.start_time
        ).strftime("%A, %B %d at %I:%M %p")

        client = genai.Client(
            api_key=os.environ["GEMINI_API_KEY"]
        )

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=(
                "Write a short, friendly confirmation message for a "
                "stargazing booking at Celestial Glow. Address the guest "
                f"as {booking.name}. Their session is {session_time}. "
                "Keep it to two sentences, warm and elegant. "
                "Do not invent any extra booking details."
            ),
        )

        message = (response.text or "").strip()

        if not message:
            logger.warning(
                "Gemini returned an empty message for booking %s.",
                booking_id,
            )
            return JsonResponse(
                {"error": "AI confirmation is temporarily unavailable."},
                status=502,
            )

        return JsonResponse({
            "confirmation_message": message,
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON request."},
            status=400,
        )

    except Booking.DoesNotExist:
        return JsonResponse(
            {"error": "Booking not found."},
            status=404,
        )

    except Exception:
        logger.exception(
            "Gemini confirmation generation failed."
        )
        return JsonResponse(
            {"error": "Could not generate the confirmation message."},
            status=502,
        )
