document.addEventListener('DOMContentLoaded', async function() {
    const cancelButton = document.getElementById('cancelButton');
    const doctorSelect = document.getElementById('doctor_id');
    const dateInput = document.getElementById("date_of_birth");

    // ================= Prevent Selecting Tomorrow or Future Dates =================
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const localToday = `${y}-${m}-${d}`;

    dateInput.max = localToday;

    // Cancel button functionality
    if (cancelButton) {
        cancelButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            window.history.back();
        });
    }

    // ================= Populate Doctor Dropdown =================
    try {
        const token = localStorage.getItem("token"); 
        const response = await fetch("http://localhost:5000/api/admin/doctors", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success && result.doctors.length) {
            result.doctors.forEach(doctor => {
                const option = document.createElement("option");
                option.value = doctor.doctor_id;
                option.textContent = doctor.full_name;
                doctorSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Failed to load doctors:", err);
    }
});

// ================= Form Submission =================
document.getElementById('caregiverForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = document.getElementById('caregiverForm');
    const overlay = document.getElementById('spinnerOverlay');

    // Recompute today's date using LOCAL time (not UTC)
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const localToday = `${y}-${m}-${d}`;

    const selectedDate = document.getElementById('date_of_birth').value;

    // ================= Validate Date (No Tomorrow or Future) =================
    if (selectedDate > localToday) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Date',
            text: 'Date of birth cannot be in the future.',
        });
        return;
    }

    const data = {
        caregiver_full_name: document.getElementById('caregiver_full_name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        relationship_to_infant: document.getElementById('relationship_to_infant').value,
        infant_full_name: document.getElementById('infant_full_name').value,
        date_of_birth: selectedDate,
        gender: document.getElementById('gender').value,
        weight: document.getElementById('weight').value,                
        facility: document.getElementById('facility').value,            
        facility_contact: document.getElementById('facility_contact').value,
        doctor_id: document.getElementById('doctor_id').value
    };

    overlay.style.display = 'flex';

    try {
        const response = await fetch('http://localhost:5000/api/admin/invite-caregiver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Invitation Sent!',
                text: `✅ Invitation sent successfully to ${data.email}!`,
            });
            form.reset();
        } else {
            if (result.message.includes('already exists')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Email',
                    text: `⚠️ ${result.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: `❌ ${result.message}`,
                });
            }
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: '⚠️ Server error. Please try again later.',
        });
    } finally {
        overlay.style.display = 'none';
    }
});
