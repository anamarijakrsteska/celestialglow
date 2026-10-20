<img width="500" height="215" alt="CelestialGlow_logo" src="https://github.com/user-attachments/assets/f461d2cb-42aa-4581-8999-6ecc64185fb9" />

# Celestial Glow
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
**1.** Run the following command in your terminal:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
**2.** Copy the generated key into your `.env` file:
```env
DJANGO_SECRET_KEY=your_generated_key_here
```
### *Configure integrations for AI-generated confirmations

**1.** Obtain a Gemini API key from Google AI Studio.

**2.** Open Windows PowerShell in the project root directory and set the environment variable:
```bash
$env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
 ```
**3.** Google Calendar requires a Google Cloud project, the Calendar API, OAuth credentials, and a configured callback URL.
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

## Images of the website

<img width="333" height="155" alt="website_1" src="https://github.com/user-attachments/assets/83e42cfb-7016-444f-8a6d-3870b9cf67a6" />
<img width="333" height="155" alt="website_2" src="https://github.com/user-attachments/assets/56b043fa-d1a6-477c-a229-c3e2a1cbaa8e" />
<img width="333" height="155" alt="website_3" src="https://github.com/user-attachments/assets/c8ad2198-9556-429a-ab82-0ebab8637428" />
<img width="333" height="155" alt="website_4" src="https://github.com/user-attachments/assets/f03b00ee-8f78-4f12-84e0-10a04829aac4" />
<img width="333" height="155" alt="website_AITest_5" src="https://github.com/user-attachments/assets/26a87568-6a6c-44be-8429-579c27303341" />
<img width="333" height="155" alt="website_AITest_6" src="https://github.com/user-attachments/assets/40af6ee5-ae22-4b35-adcd-1a049c49ef8d" />
<img width="333" height="155" alt="website_AITest_7" src="https://github.com/user-attachments/assets/49858d45-4fda-448c-98a5-9fc16e20e87e" />
<img width="333" height="155" alt="website_8" src="https://github.com/user-attachments/assets/f12fc439-1f19-4d92-85ec-d8671a502036" />
