# Celestial Glow

<img width="535" height="235" alt="CelestialGlow_logo" src="https://github.com/user-attachments/assets/f461d2cb-42aa-4581-8999-6ecc64185fb9" />

## Celestial Glow
**A LITTLE CLOSER TO INFINITY**

**Celestial Glow** is a stargazing session booking application built with React and Django. 
Visitors can explore available sessions, book a unique time slot, and receive a personalized AI-generated booking confirmation. 
Google Calendar integration helps identify and handle scheduling conflicts.

## Features
- **Session availability:** View upcoming stargazing sessions and their durations.
- **Online booking:** Visitors can book sessions using their name and email address (no user accounts required).
- **Double-booking prevention:** Prevent multiple bookings for the same time slot.
- **Google Calendar integration:** Check calendar availability and filter conflicting sessions.
- **AI booking confirmations:** Generate personalized confirmation messages using Google Gemini.
- **Admin dashboard:** Manage sessions and bookings through Django Admin.
- **Single-timezone configuration:** All session times use the Europe/Skopje timezone.
 
## Tech Stack
- **Frontend:** React, JavaScript, Vite, HTML, CSS
- **Backend:** Python, Django, Django REST Framework
- **Database:** SQLite
- **Calendar integration:** Google Calendar API and OAuth 2.0
- **AI integration:** Google Gemini API

## Project Structure
```bash
celestialglow/
├── celestialglow/          
├── celestialglowapp/       
├── frontend/              
├── manage.py
├── requirements.txt
├── .gitignore
└── README.md
```

## How To Run Locally
**Prerequisites:** Python, Node.js, and npm.
Open a terminal in the project root directory (the folder containing manage.py).

**Step I:** Create a virtual environment (recommended) 
```bash
python -m venv venv
```
**Step II:** Activate the virtual environment
```bash
.\venv\Scripts\Activate.ps1
```
**Step III:** Install the required dependencies
```bash
pip install -r requirements.txt
```

### *Generate Django Secret Key
Run the following command in your terminal:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the generated key into your `.env` file:
```env
DJANGO_SECRET_KEY=your_generated_key_here
```
### *Configure integrations for AI-generated confirmations

**1.** Obtain a Gemini API key from Google AI Studio.

**2.** Open Windows PowerShell in the project root directory and set the environment variable:
```bash
$env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
 ```
Google Calendar requires a Google Cloud project, the Calendar API, OAuth credentials, and a configured callback URL.

Copy them into your `.env` file:
```env
DJANGO_SECRET_KEY=your_generated_key_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/google-calendar/callback/

GEMINI_API_KEY=your_gemini_api_key
```

**Keep API keys, OAuth credentials, and generated token files private!**


**Step IV:** Prepare the database
```bash
python manage.py migrate
```
**Step V:** Create an administrator account
```bash
python manage.py createsuperuser
```
**Step VI:** Start the development server
```bash
python manage.py runserver
 ```
**Step VII:** Access the backend
- Django Admin: http://127.0.0.1:8000/admin/ — Manage sessions and bookings.
- Bookings: http://127.0.0.1:8000/api/bookings/ — Handles booking requests.
- Slots: http://127.0.0.1:8000/api/slots/ — Retrieves available stargazing sessions.

Log in to Django Admin using the superuser credentials created in Step V.

### Start the React frontend
Open a second terminal:
 ```bash
cd frontend     # Navigate to the frontend directory
npm install     # Install the frontend dependencies
npm run dev     # Start the development server
 ```
Open the URL provided by Vite, usually http://localhost:5173/

## AI Tools Used
- **Google Gemini API:** Powers the personalized booking confirmation messages.
- **ChatGPT and Claude:** Assisted with technical troubleshooting, debugging, and improving the integration between the frontend and backend.

## To Improve
- Add automated tests for booking validation and API endpoints.
- Implement email notifications for booking confirmations and session reminders.
- Expand booking management with cancellation and rescheduling.

