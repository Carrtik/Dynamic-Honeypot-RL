# Dynamically Adaptable Honeypot (RL-Based)

### 🚧 Project Status: Active Development (Research Paper Under Review - ICACCS '26)

## 📌 Overview
This project is an advanced cybersecurity defense mechanism designed to deceive attackers and extend dwell time using **Reinforcement Learning (RL)**. Unlike static honeypots, this system dynamically adapts its responses based on the attacker's behavior, classifying threats in real-time and routing them to high-interaction containers.

## 🛠️ Tech Stack
- **Core Engine:** Python (Flask)
- **Containerization:** Docker
- **ML/RL:** XGBoost (Classification), Q-Learning (Response Strategy)
- **Frontend Dashboard:** React.js (Threat Visualization)

## 🚀 Key Features
- **Dynamic Adaptation:** Changes system output/errors to confuse attackers.
- **Real-Time Classification:** Detects SQLi, XSS, and Brute Force using XGBoost.
- **Smart Routing:** Redirects sophisticated actors to "Tarpit" environments to waste their time.

## ⚠️ Note
*The full source code is currently being refactored for public release following the completion of the ICACCS '26 review process. Core modules will be uploaded progressively.*
