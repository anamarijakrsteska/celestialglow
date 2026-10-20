import json
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/calendar.freebusy"
]


def get_google_flow(state=None):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise ImproperlyConfigured(
            "Google Calendar OAuth credentials are not configured."
        )

    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        state=state,
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    return flow


def save_credentials(credentials):
    token_path = settings.BASE_DIR / "google_calendar_token.json"
    token_path.write_text(
        credentials.to_json(),
        encoding="utf-8",
    )


def get_credentials(request=None):
    token_path = settings.BASE_DIR / "google_calendar_token.json"

    if not token_path.exists():
        return None

    token_data = json.loads(
        token_path.read_text(encoding="utf-8")
    )

    credentials = Credentials.from_authorized_user_info(
        token_data,
        SCOPES,
    )

    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
        save_credentials(credentials)

    return credentials


def get_busy_intervals(request, start_time, end_time):
    credentials = get_credentials(request)

    if not credentials:
        return None

    service = build(
        "calendar",
        "v3",
        credentials=credentials,
        cache_discovery=False,
    )

    result = service.freebusy().query(
        body={
            "timeMin": start_time.isoformat(),
            "timeMax": end_time.isoformat(),
            "items": [{"id": "primary"}],
        }
    ).execute()

    return result["calendars"]["primary"].get("busy", [])

