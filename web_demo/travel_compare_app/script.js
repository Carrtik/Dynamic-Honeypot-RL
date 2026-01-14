// CONFIGURATION
// Ensure this matches your backend port (default: 3001)
const API_BASE = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. SEARCH LOGIC (FLIGHTS) ---
    // Connects to /api/search to trap SQL Injection attempts
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const fromVal = document.getElementById('from').value;
            const toVal = document.getElementById('to').value;
            const dateVal = document.getElementById('date').value; // Keep generic date

            const resultsArea = document.getElementById('results-area');
            const resultsList = document.getElementById('results-list');

            // UI: Show Premium Loading State
            resultsList.innerHTML = `
                <div style="text-align:center; padding:40px; color: var(--text-muted);">
                    <i class="fas fa-circle-notch fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                    <p>Scanning 700+ airlines for the best deals...</p>
                </div>`;
            resultsArea.style.display = 'block';
            resultsArea.scrollIntoView({ behavior: 'smooth' });

            // API CALL
            fetch(`${API_BASE}/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: fromVal, to: toVal, date: dateVal })
            })
            .then(res => {
                // TRAP LOGIC: Check if server returned a "Fake SQL Error" (HTML) instead of JSON
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("text/html")) {
                    // If HTML, it's likely the fake DB error -> Render it to scare the hacker
                    return res.text().then(html => {
                        document.open();
                        document.write(html);
                        document.close();
                    });
                }
                return res.json();
            })
            .then(data => {
                // If we got valid JSON, render the fake results
                if (data && data.success) {
                    // Update Title
                    const header = resultsArea.querySelector('h2');
                    if(header) header.innerHTML = `<i class="fas fa-plane"></i> Flights from ${fromVal} to ${toVal}`;

                    // If backend sends specific results, use them. Otherwise show empty/generic message.
                    if (data.results && data.results.length > 0) {
                        resultsList.innerHTML = data.results.map(item => `
                            <div class="flight-card">
                                <div class="airline-info">
                                    <div class="airline-name"><i class="fas fa-plane"></i> ${item.airline}</div>
                                    <div class="website-source">Found on <strong>${item.website}</strong></div>
                                </div>
                                <div class="flight-time">
                                    <div class="time-range">${item.time}</div>
                                    <div class="duration-type">${item.type}</div>
                                </div>
                                <div class="flight-pricing">
                                    <div class="price-display">${item.price}</div>
                                    <button class="btn-book">Book Now</button>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        // Fallback if no specific results sent
                        resultsList.innerHTML = `<p style="text-align:center; padding:20px;">${data.message || "No flights found for these dates."}</p>`;
                    }
                } else if (data && data.error) {
                    // Show "System Error" alert (part of the deception)
                    alert("SYSTEM NOTICE: " + data.error);
                }
            })
            .catch(err => {
                console.error("Search API Error:", err);
                resultsList.innerHTML = `<p style="color:#ef4444; text-align:center;">Connection timeout. Please try again.</p>`;
            });
        });
    }

    // --- 2. CONTACT FORM LOGIC (XSS TRAP) ---
    // Listens for malicious scripts in the support message
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const msgInput = document.getElementById('contact-msg');
            const msg = msgInput ? msgInput.value : "";

            fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            })
            .then(res => {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("text/html")) {
                    // If HTML, it's the "WAF Blocked" page -> Render it
                    return res.text().then(html => { document.body.innerHTML = html; });
                }
                return res.json().then(data => alert(data.message));
            })
            .catch(err => console.error("Contact Form Error:", err));
        });
    }

    // --- 3. NAVBAR SCROLL EFFECT ---
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

});

// --- 4. LOGIN LOGIC (GLOBAL SCOPE) ---
// Kept global so onclick="..." in HTML works
function login() {
    const userVal = document.getElementById('username').value;
    const passVal = document.getElementById('password').value;

    fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userVal, password: passVal })
    })
    .then(res => res.json())
    .then(data => {
        if (data.redirect) {
            // Redirect to Fake Admin or Real Dashboard based on credentials
            window.location.href = data.redirect;
        } else {
            alert("Login Failed: " + (data.error || "Invalid Credentials"));
        }
    })
    .catch(err => console.error("Auth Error:", err));
}

// Google Auth Callback (Optional Placeholder)
function handleCredentialResponse(response) {
    console.log("Google Token Received:", response.credential);
    // Add verification logic here if needed
}
