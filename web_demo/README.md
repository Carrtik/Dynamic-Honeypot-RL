# 🍯 TravelCompare Honeypot Project

A secure-looking Travel Agency website that is actually a trap for hackers.
It detects and logs SQL Injection, XSS, and LFI attacks.

## 🛠️ How to Run

1.  **Unzip the folder.**
2.  **Open Terminal** in the root directory.
3.  **Start the Backend:**
    ```bash
    cd travel_compare_backend
    npm install
    node index.js
    ```
4.  **Start the Frontend:**
    * Open `travel_compare_app/index.html` in your browser.

## ⚙️ Configuration (Required)

Before running, please update the following:

1.  **Google Login:** Open `travel_compare_app/index.html` and replace `YOUR_CLIENT_ID` with your own Google API Key.
2.  **Admin Password:** Open `travel_compare_backend/index.js` and set your preferred "Real Admin" password.

## 🕵️‍♂️ Features

* **SQL Injection Trap:** Triggered via Login Page or Search Bar.
* **XSS Trap:** Triggered via "Contact Support" form.
* **LFI Trap:** Triggered via "Download Brochure" link.