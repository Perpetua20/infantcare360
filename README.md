# InfantCare360 — Infant Health Management System

[![GitHub last commit](https://img.shields.io/github/last-commit/LeilahDev/SOEN370-Development-of-Comprehensive-Infant-Health-Management-System)](https://github.com/LeilahDev/SOEN370-Development-of-Comprehensive-Infant-Health-Management-System)


## 💡 Project Overview
**InfantCare360** is a comprehensive web-based infant health management platform designed to enhance collaboration between caregivers (parents), doctors and administrators.

It centralizes infant health workflows by offering:
1.  **Vaccination Tracking**
2.  **Telehealth Consultations**
3.  **Educational Resources**

The system aims to streamline infant healthcare processes, improve vaccination adherence, enable remote consultations and educate caregivers on essential infant care practices.

---

## ✨ Features
* **Role-Based Access:** Dedicated interfaces for Admin, Doctor, and Caregiver roles.
* **Automated Vaccination Scheduling:** Generates a custom schedule based on the infant’s date of birth.
* **Vaccination Management:** Tracking of history, recording of administered vaccines by Doctors and automated reminders for caregivers.
* **Telehealth Consultation Workflow:** Booking, approval/rescheduling by Doctors and virtual meeting integration.
* **Educational Content:** Verified resources on key infant care topics (e.g., breastfeeding, nutrition, hygiene).
* **Notifications:** Timely reminders for vaccinations and appointments for all relevant users.

---

## 👥 System Users & Roles

### Admin
* **Account Creation:** Created solely by the system developer/initiator. No self-registration.
* **Login:** Logs in via a **shared login page** with doctors, selecting the **Admin** role for access.
* **Responsibilities:** Add and manage Doctor accounts, initiate Caregiver registration (triggering the unique invitation code email) and monitor overall system activity.

### Doctor
* **Account Creation:** Added and managed exclusively by the Admin. No self-registration.
* **Login:** Logs in via the **shared login page** with admins, selecting the **Doctor** role.
* **Responsibilities:** Manage telehealth consultations (approve, cancel, reschedule), record administered vaccinations (auto-updating the caregiver’s history), join virtual consultations and receive appointment reminders.

### Caregiver / Parent
* **Account Creation:** Receives an invitation email from the system (initiated by Admin) containing a unique code and registration link. Registration requires code validation.
* **Login:** Logs in via a **separate, dedicated caregiver login page**.
* **Capabilities:** View upcoming vaccinations and history, book and track telehealth consultations and access verified educational resources.

---

## ⚙️ Core Functional Modules

### Vaccination Tracking
* Generates a dynamic vaccination schedule automatically based on the infant’s date of birth.
* Caregivers can view a clear history and upcoming schedule via their dashboard.
* Automated reminders are sent to caregivers for scheduled appointments.
* Doctors record the administered vaccine, instantly updating the caregiver’s record.

### Telehealth Consultations
* Allows Caregivers to seamlessly book appointments with their assigned Doctors.
* Doctors have full control over managing (approving, rescheduling, or canceling) appointments.
* Integration enables both parties to join the virtual meeting directly from the system interface.
* Users can track all upcoming, past, and pending consultation statuses.

### Educational Resources
* A centralized repository of verified materials focusing on critical infant care topics: breastfeeding, nutrition, hygiene practices, and disease prevention.
* Designed to promote caregiver knowledge and encourage proactive, preventive healthcare.

---

## ⏩ System Processes (Simplified Flow)

1.  **Admin Setup:** Developer creates the initial Admin account.
2.  **Doctor Management:** Admin adds Doctor accounts → Doctors log in via the shared page (selecting “Doctor”).
3.  **Caregiver Invitation & Registration:** Admin enters caregiver details → System sends invitation email with unique code → Caregiver registers using the code → Validation grants access.
4.  **Caregiver Login:** Caregiver logs in via their **separate login page** → accesses the dashboard modules.
5.  **Vaccination Tracking:** System auto-generates schedule → Doctor records administered vaccinations → Caregiver sees updated history & receives reminders.
6.  **Telehealth Consultation Workflow:** Caregiver books → Doctor manages appointment status → Both parties receive reminders → Virtual consultation is held via the system.
7.  **Education Module Usage:** Caregiver accesses and browses educational content at any time.

---

## 🎯 System Goals

* **Improve Coordination:** Enhance communication and workflow efficiency between caregivers, doctors, and administrators.
* **Automation:** Automate and simplify infant vaccination scheduling and adherence tracking.
* **Access:** Facilitate remote infant healthcare provision through integrated telehealth consultations.
* **Education:** Provide caregivers with accessible, reliable educational content to support optimal infant health.

---

## 🛠️ Technologies Used
*(The specific stack used for implementation.)**

* **Frontend:** JavaScript, HTML, CSS 
* **Backend:** Node.js / Express 
* **Database:** MySQL 
* **Email / Notifications:** Nodemailer for invitations and reminders.
* **Telehealth Integration:**  Jitsi  (for virtual meeting functionality)

---

## 🚀 Installation & Setup

Follow these steps to get your local copy of InfantCare360 up and running.

### Prerequisites

* Node.js (LTS version recommended)
* A database server (MySQL)

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/LeilahDev/SOEN370-Development-of-Comprehensive-Infant-Health-Management-System.git](https://github.com/LeilahDev/SOEN370-Development-of-Comprehensive-Infant-Health-Management-System.git)
    cd SOEN370-Development-of-Comprehensive-Infant-Health-Management-System
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    * Create a `.env` file in the root directory.
    * Configure the following essential variables:
        * `PORT=5000` (or preferred port)
        * `DB_URL=your_database_connection_string` (e.g., `mysql://user:pass@host:port/dbname`)
        * `EMAIL_SERVICE_HOST=smtp.example.com`
        * `EMAIL_USER=your_email@example.com`
        * `EMAIL_PASS=your_email_password`

4.  **Initialize Database:**
    * Run migrations to set up the necessary tables/collections:
    ```bash
    # Example command, adjust based on your ORM/DB framework
    npm run db:migrate
    ```

5.  **Create Initial Admin Account:**
    * Since the Admin is not self-registered, run the following command to seed the initial credentials:
    ```bash
    # Example command, adjust based on your seeding script
    npm run seed:admin -- --username [YOUR_ADMIN_USERNAME] --password [YOUR_ADMIN_PASSWORD]
    ```

6.  **Start the Server:**
    ```bash
    npm start
    # or if using a dev server:
    npm run dev
    ```

---

## 💻 Usage

Once the system is running, access the application via your browser (typically `http://localhost:5000`).

1.  **Admin Login:** Use the credentials created in **Step 5** of the setup on the shared login page, selecting the **Admin** role.
2.  **Doctor Management:** Admins can now add doctors and initiate caregiver invitations.
3.  **Caregiver Registration:** Caregivers must complete the process via the unique link received from the system.

---

## 🤝 Contributing
Contributions are welcome! If you have suggestions for improving InfantCare360, please follow the steps below:
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 🚫 Copyright Statement
**All Rights Reserved.** This software is protected by copyright. You may view the code, but you may not  modify or redistribute the software without explicit written permission from the author(s).
