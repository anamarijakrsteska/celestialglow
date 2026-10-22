
        import { useEffect, useState } from "react";
        import "./App.css";

        const API_URL = "https://celestialglow.onrender.com/api";

        function formatDate(dateString, options) {
            const date = new Date(dateString);

            if (Number.isNaN(date.getTime())) {
                return "Date unavailable";
            }

            return new Intl.DateTimeFormat("en-GB", {
                ...options,
                timeZone: "Europe/Skopje",
            }).format(date);
        }

        function getErrorMessage(data) {
            if (typeof data === "string") {
                return data;
            }

            if (data && typeof data === "object") {
                return Object.entries(data)
                .map(([field, messages]) => {
                    const message = Array.isArray(messages)
                    ? messages.join(" ")
                    : String(messages);

                    return `${field}: ${message}`;
                })
              .join(" ");
            }

            return "Something went wrong. Please try again.";
        }

        function App() {
            const [menuOpen, setMenuOpen] = useState(false);
            useEffect(() => {
                const interval = setInterval(() => {
                    const now = Date.now();
                    setSessions((currentSessions) =>
                    currentSessions.filter(
                        (session) =>
                        new Date(session.start_time).getTime() > now
                    ));
                }, 30_000);

                return () => clearInterval(interval);
            }, []);


            const [sessions, setSessions] = useState([]);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState("");

            const [selectedSession, setSelectedSession] = useState(null);
            const [name, setName] = useState("");
            const [email, setEmail] = useState("");
            const [message, setMessage] = useState("");
            const [bookingError, setBookingError] = useState("");
            const [bookingLoading, setBookingLoading] = useState(false);

            async function fetchSessions() {
                setError("");

                try {
                    const response = await fetch(`${API_URL}/slots/`);

                    if (!response.ok) {
                        throw new Error("Could not load available sessions.");
                    }

                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        throw new Error("The server returned an unexpected response.");
                    }

                    setSessions(
                        data.filter(
                            (session) =>
                            new Date(session.start_time).getTime() > Date.now()
                        )
                    );
                } catch (err) {
                    setError(
                        err.message || "Unable to connect to the server. Please try again."
                    );
                } finally {
                    setLoading(false);
                }
            }

            useEffect(() => {
                fetchSessions();
            }, []);


            async function handleBooking(event) {
                event.preventDefault();

                if (!selectedSession || bookingLoading) {
                    return;
                }

                setBookingLoading(true);
                setBookingError("");
                setMessage("");

                try {
                    const response = await fetch(`${API_URL}/bookings/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            slot: selectedSession.id,
                            name: name.trim(),
                            email: email.trim(),
                        }),
                    });

                    const data = await response.json().catch(() => ({}));

                    if (!response.ok) {
                        throw new Error(
                            getErrorMessage(data) || "This session could not be booked."
                        );
                    }

                    // The booking is saved. Now request the AI confirmation.
                    let confirmationMessage =
                        "Your session has been booked successfully! Your reservation has been saved.";

                    try {
                        const aiResponse = await fetch(
                            `${API_URL}/ai/booking-confirmation/`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    booking_id: data.id,
                                }),
                            }
                        );

                        const aiData = await aiResponse.json();

                        if (aiResponse.ok && aiData.confirmation_message) {
                            confirmationMessage = aiData.confirmation_message;
                        }
                    } catch (aiError) {
                        console.error("AI confirmation unavailable:", aiError);
                    }

                    setMessage(confirmationMessage);

                    setSessions((currentSessions) =>
                        currentSessions.filter(
                            (session) => session.id !== selectedSession.id
                        )
                    );

                    setName("");
                    setEmail("");
                } catch (err) {
                    setBookingError(
                        err.message ||
                            "Booking failed. Please check your connection and try again."
                    );

                    // Refresh availability in case another visitor booked this slot.
                    await fetchSessions();
                } finally {
                    setBookingLoading(false);
                }
            }


                        function openBooking(session) {
                            setSelectedSession(session);
                            setName("");
                            setEmail("");
                            setMessage("");
                            setBookingError("");
                        }

                        function closeBooking() {
                            if (bookingLoading) {
                                return;
                            }

                            setSelectedSession(null);
                            setMessage("");
                            setBookingError("");
                        }


            const [calendarMonth, setCalendarMonth] = useState(() => {
                const today = new Date();
                return new Date(today.getFullYear(), today.getMonth(), 1);
            });

            const [selectedDate, setSelectedDate] = useState(() => {
                const today = new Date();
                return new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );
            });

            const dateKey = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");

                return `${year}-${month}-${day}`;
            };

            const sessionsForDate = (date) => {
                const key = dateKey(date);

                return sessions.filter((session) => {
                    const sessionDate = new Date(session.start_time);
                    return dateKey(sessionDate) === key;
                });
            };


            // Make Monday the first day of the week.
            const startOffset = (calendarMonth.getDay() + 6) % 7;


            const calendarDays = Array.from({ length: 42 }, (_, index) => {
                const date = new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth(),
                    index - startOffset + 1
                );

                return {
                    date,
                    key: dateKey(date),
                    inCurrentMonth: date.getMonth() === calendarMonth.getMonth(),
                    sessions: sessionsForDate(date),
                };
            });

            const selectedSessions = sessionsForDate(selectedDate);

            const changeMonth = (offset) => {
                setCalendarMonth((current) =>
                    new Date(
                        current.getFullYear(),
                        current.getMonth() + offset,
                        1
                    )
                );
            };

            const goToToday = () => {
                const today = new Date();

                setCalendarMonth(
                    new Date(today.getFullYear(), today.getMonth(), 1)
                );

                setSelectedDate(
                    new Date(today.getFullYear(), today.getMonth(), today.getDate())
                );
            };


            return (
                <div className="app">
                      <main>
                          <section className="hero" id="home">
                              <header className="navbar">
                                  <a href="#home">
                                      <img className="brand-logo" src="/images/logo_bold.png" alt="CelestialGlow" />
                                  </a>

                                   <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                                       ☰
                                   </button>

                                  <nav className={`nav-items ${menuOpen ? "open" : ""}`}>
                                      <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
                                      <a href="#calendar" onClick={() => setMenuOpen(false)}>Calendar</a>
                                      <a href="#experiences" onClick={() => setMenuOpen(false)}>Experiences</a>
                                      <a href="#about" onClick={() => setMenuOpen(false)}>Our Universe</a>
                                  </nav>
                              </header>

                              <div className="hero-content">
                                  <p className="title">
                                     SOMEWHERE BETWEEN EARTH AND INFINITY
                                  </p>

                                  <h1>
                                    Your Window to the <em>Universe.</em>
                                  </h1>

                                  <p className="hero-description">
                                    Discover the night sky. Experience the extraordinary.<br/>
                                  </p>

                                  <div className="hero-actions">
                                      <a className="primary-button" href="#experiences">
                                        Explore Sessions ➜
                                      </a>
                                  </div>
                              </div>

                              <div className="hero-bottom">
                                <span>
                                    A LITTLE CLOSER TO INFINITY
                                </span>
                                <span>
                                      MADE FOR THE CURIOUS
                                </span>
                              </div>
                          </section>



                          <section className="calendar-section section" id="calendar">
                              <div className="section-heading">
                                  <div>
                                      <p className="eyebrow">YOUR SCHEDULE, IN ONE PLACE</p>
                                      <h2>
                                        Celestial <em>Calendar. ✦</em>
                                      </h2>
                                      <a className="section-description">
                                        Keep track of upcoming stargazing sessions and their availability.
                                      </a>
                                  </div>
                              </div>

                              <div className="calendar-panel">
                                  <div className="calendar-panel-heading">


                                      <a>
                                           <img
                                                src="/images/logo_calendar.png"
                                                alt="Celestial Glow logo"
                                                className="calendar-logo"
                                                style = {{ height: "75px", width: "auto" }}
                                           />

                                      </a>

                                      <div style= {{marginLeft: "-10%", }}>
                                          <span className="calendar-eyebrow">
                                              CELESTIAL GLOW
                                          </span>
                                          <h6>Session Calendar</h6>
                                          <p>Find your next journey through the night sky.</p>
                                      </div>



                                      <button
                                          className="calendar-refresh"
                                          onClick={() => {
                                             setLoading(true);
                                             fetchSessions();
                                          }}
                                          aria-label="Refresh sessions"
                                          title="Refresh sessions">
                                        ↻
                                      </button>
                                  </div>

                                  {loading && (
                                      <p className="section-description">Loading sessions...</p>
                                  )}

                                  {!loading && error && (
                                      <p className="form-message" role="alert">{error}</p>
                                  )}

                                  {!loading && !error && (
                                     <>
                                        <div className="calendar-toolbar">
                                            <div className="calendar-month-navigation">
                                                <button
                                                    className="calendar-nav-button"
                                                    onClick={() => changeMonth(-1)}
                                                    aria-label="Previous month"
                                                >
                                                    ‹
                                                </button>

                                                <h4>
                                                    {calendarMonth.toLocaleDateString("en-US", {
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </h4>

                                                <button
                                                    className="calendar-nav-button"
                                                    onClick={() => changeMonth(1)}
                                                    aria-label="Next month"
                                                >
                                                    ›
                                                </button>
                                            </div>

                                            <button
                                                className="calendar-today-button"
                                                onClick={goToToday}
                                            >
                                                Today
                                            </button>
                                        </div>

                                        <div className="calendar-grid">
                                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                                                (day) => (
                                                    <div className="calendar-weekday" key={day}>
                                                        {day}
                                                    </div>
                                                )
                                            )}

                                            {calendarDays.map(({ date, key, inCurrentMonth, sessions: daySessions }) => {
                                                const isToday = key === dateKey(new Date());
                                                const isSelected = key === dateKey(selectedDate);

                                                return (
                                                    <button
                                                        key={key}
                                                        className={[
                                                            "calendar-day",
                                                            !inCurrentMonth ? "outside-month" : "",
                                                            isToday ? "today" : "",
                                                            isSelected ? "selected" : "",
                                                            daySessions.length ? "has-sessions" : "",
                                                        ].filter(Boolean).join(" ")}
                                                        onClick={() => setSelectedDate(date)}
                                                        aria-label={`${date.toLocaleDateString("en-US", {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}, ${daySessions.length} available sessions`}
                                                        aria-pressed={isSelected}
                                                    >
                                                        <span className="calendar-day-number">
                                                            {date.getDate()}
                                                        </span>

                                                        {daySessions.length > 0 && (
                                                            <span
                                                                className="calendar-day-dot"
                                                                aria-label={`${daySessions.length} sessions`}
                                                            />
                                                        )}

                                                        {daySessions.length > 0 && (
                                                            <span className="calendar-day-count">
                                                                {daySessions.length}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="calendar-legend">
                                            <span className="legend-dot" />
                                            <span>Available sessions</span>
                                            <span className="legend-today"/>
                                            <span>Today</span>
                                        </div>

                                        <div className="calendar-selected-date">
                                            <div className="calendar-selected-heading">
                                                <p className="calendar-eyebrow">
                                                        YOUR SELECTED DATE<br/>
                                                </p>

                                                <div>

                                                    <h4>
                                                        {selectedDate.toLocaleDateString("en-US", {
                                                            weekday: "long",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </h4>
                                                </div>

                                                <span className="calendar-session-total">
                                                    {selectedSessions.length}{" "}
                                                    {selectedSessions.length === 1 ? "session" : "sessions"}
                                                </span>
                                            </div>

                                            {selectedSessions.length === 0 ? (
                                                <p className="section-description" style={{ textAlign: "center", width: "100%", paddingLeft: "8.8%" }}>
                                                    No available sessions on this date.
                                                </p>
                                            ) : (
                                                <div className="calendar-session-list">
                                                    {selectedSessions.map((session) => (
                                                        <article
                                                            className="calendar-session"
                                                            key={session.id}
                                                        >
                                                            <div className="calendar-session-time">
                                                                {new Date(session.start_time).toLocaleTimeString(
                                                                    "en-US",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        timeZone: "Europe/Skopje",
                                                                    }
                                                                )}
                                                            </div>

                                                            <div className="calendar-session-details">
                                                                <h4>Guided Journey Through the Night Sky</h4>
                                                                <p>
                                                                    {session.duration_minutes} minutes
                                                                </p>
                                                            </div>

                                                            <span className="calendar-availability">
                                                                Available
                                                            </span>

                                                        </article>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                     </>
                                  )}
                              </div>
                          </section>


                          {/*--------- EXPERIENCES SECTION --------- */}

                          <section className="experiences section" id="experiences">
                              <div className="section-heading">
                                  <div>
                                      <p className="eyebrow">YOUR NEXT ADVENTURE</p>
                                      <h2>Choose your <em>universe. ✦</em></h2>

                                      <p className="section-description">
                                        Every session is an invitation to see the night sky differently.
                                      </p>
                                  </div>

                              </div>

                              {loading && (
                                  <p className="section-description">
                                      Discovering available sessions...
                                  </p>
                              )}

                              {!loading && error && (
                                  <div>
                                      <p className="form-message">{error}</p>
                                      <button className="session-button" onClick={() => { setLoading(true); fetchSessions(); }} >
                                          Try again ↻
                                      </button>
                                  </div>
                              )}

                              {!loading && !error && sessions.length === 0 && (
                                  <p className="section-description">
                                    No sessions are available right now. Please check back soon.
                                  </p>
                              )}

                             {!error && sessions.length > 0 && (
                                 <div className="session-grid">
                                     {sessions.map((session) => (
                                         <article className="session-card" key={session.id}>
                                             <div className="session-top">
                                                 <span className="session-category">
                                                    STARGAZING EXPERIENCE
                                                 </span>

                                                 <span className="session-star">✦</span>
                                             </div>

                                             <div className="session-date">
                                                 <span>
                                                     {formatDate(session.start_time, { day: "2-digit", month: "short", }).toUpperCase()}
                                                 </span>

                                                 <span>
                                                     {formatDate(session.start_time, { weekday: "long", })}
                                                 </span>
                                             </div>

                                             <h3 style={{fontFamily: "'Cormorant SC', serif" }}>Through the Night Sky</h3>

                                             <p style={{ fontSize: "15px", fontFamily: "'Cormorant SC', serif",  color: "#d7b55c" }}>
                                                 Celestial Encounter
                                             </p>

                                             <div className="session-meta">
                                                 <span>
                                                     ◷{" "}
                                                     {formatDate(session.start_time, { hour: "2-digit", minute: "2-digit", hour12: true, })}
                                                 </span>

                                                 <span>
                                                     ◌{session.duration_minutes} minutes
                                                 </span>
                                             </div>

                                             <button className="session-button" onClick={() => openBooking(session)}>
                                                 Reserve your place ↗
                                             </button>
                                         </article>
                                     ))}
                                 </div>
                                )}
                          </section>






                          {/*   ----------- FOOTER -----------   */}

                          <section className="about-section" id="about" >
                                <span className="about-star">✧</span>

                                <p className="eyebrow">A MOMENT BEYOND TIME</p>

                                <h2>
                                    There is more to the sky <br/> than meets the <em>eye.</em>
                                </h2>

                                <p>
                                    <span style={{ color: "#D7B66C", textDecoration: "underline"}} >
                                        CelestialGlow
                                    </span>{" "}
                                        brings people closer to the cosmos through
                                        thoughtfully designed stargazing experiences.<br/>

                                        <span style={{fontSize: "13px", color: "#D7B66C"}}>Come curious. Leave inspired.</span>
                                </p>

                                <a href="#experiences" className="text-button">
                                    Find your next experience ↗
                                </a>
                          </section>
                      </main>



                      {/*   ----------- FOOTER NAVIGATION -----------   */}

                      <footer className="footer">
                          <a href="#home">
                              <img className="brand-logo-footer" src="/images/logo.png" alt="Celestial Glow"/>
                          </a>

                          <span>© 2026 Celestial Glow</span>

                          <ul className="contact">
                              <li><a><b>Email:</b> celestialglow@gmail.com</a></li>
                              <li><a><b>Phone:</b> +888 88 888 888</a></li>
                          </ul>

                      </footer>





                    {selectedSession && (
                        <div className="modal-backdrop" onClick={closeBooking} >
                            <section
                                className="booking-modal"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="booking-title"
                                onClick={(event) => event.stopPropagation()}
                            >

                                <button
                                  className="modal-close"
                                  onClick={closeBooking}
                                  aria-label="Close booking form"
                                  disabled={bookingLoading}
                                  style = {{ backgroundColor: "#1A5185", border: "1px solid #1A5185", borderRadius: "7px", marginLeft: "95%", }}
                                >
                                  ×
                                </button>

                                <a>
                                    <img
                                          src="/images/logo_calendar.png"
                                          alt="Celestial Glow logo"
                                          className="calendar-logo"
                                          style = {{ height: "88px", width: "211px",  }}
                                    />
                                </a>

                                <br/>

                                <p className="eyebrow">YOUR COSMIC EXPERIENCE</p>

                                <h2 id="booking-title" style = {{ padding: "5px",}}>
                                  Reserve your <span style = {{ color: "#d7b55c",  opacity: ".8",}}>place.</span>
                                </h2>

                                <p className="modal-session">
                                  A Journey Through the Night Sky
                                </p>

                                <p className="modal-date">
                                    {formatDate(selectedSession.start_time, {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                    {" · "}
                                    {formatDate(selectedSession.start_time, {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </p>
                                <br/>

                                {!message && (
                                    <form onSubmit={handleBooking}>
                                        <p><label htmlFor="guest-name">Name </label>

                                        <input
                                          id="guest-name"
                                          type="text"
                                          value={name}
                                          onChange={(event) => setName(event.target.value)}
                                          placeholder="Your full name"
                                          maxLength={100}
                                          autoComplete="name"
                                          required
                                          style = {{ backgroundColor: "#ABD5ED", border: " 1px solid #B7BFF0", borderRadius: "5px", }}
                                        /></p>

                                        <br/>

                                        <p><label htmlFor="guest-email">Email </label>

                                        <input
                                          id="guest-email"
                                          type="email"
                                          value={email}
                                          onChange={(event) => setEmail(event.target.value)}
                                          placeholder="you@example.com"
                                          autoComplete="email"
                                          required
                                          style = {{ backgroundColor: "#ABD5ED", border: " 1px solid #B7BFF0", borderRadius: "5px", }}
                                        /></p>

                                        {bookingError && (
                                          <p className="form-message" role="alert">
                                            {bookingError}
                                          </p>
                                        )}
                                        <br/>
                                        <p><button
                                          className="primary-button form-button"
                                          type="submit"
                                          disabled={bookingLoading}
                                        >
                                        {bookingLoading ? "Reserving...✦" : "Confirm reservation"}
                                         </button></p>
                                         <br/>
                                    </form>
                                )}

                                {message && (
                                    <div>
                                        <p className="form-message" role="status">
                                          {message}
                                        </p>

                                        <button
                                          className="primary-button form-button"
                                          onClick={closeBooking}>
                                             Close
                                        </button>
                                    </div>
                                )}

                                <p className="privacy-note" style = {{ fontSize:"10px", color: "#CDECF9", }}>
                                   Your details will be used to process your session reservation.
                                </p>

                                <br/>

                                <span style = {{ color: "#D7B55C", fontSize: "13px", opacity: ".7", letterSpacing : "5px", }}>✦ · ˚ · ✧ · ˚ · ✦<br/></span>

                            </section>
                        </div>
                    )}
                </div>
            );
        }

        export default App;
