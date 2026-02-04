document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:5000';
  const form = document.getElementById('caregiverForm');
  const doctorSelect = document.getElementById('doctor_id');

  //  Get caregiver ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const caregiverId = urlParams.get('id');
  if (!caregiverId) {
    Swal.fire({
      icon: 'error',
      title: 'Missing ID',
      text: 'No caregiver ID provided in the URL!',
    });
    return;
  }

  try {
    //  Fetch caregiver + infant data
    const res = await fetch(`${BASE_URL}/api/admin/caregiver/${caregiverId}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('Error fetching caregiver:', data.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message || 'Failed to fetch caregiver data.',
      });
      return;
    }

    const { caregiver, infant } = data;

    // Prefill caregiver fields
    document.getElementById('caregiver_full_name').value = caregiver.full_name;
    document.getElementById('email').value = caregiver.email;
    document.getElementById('phone').value = caregiver.phone_number;
    document.getElementById('relationship_to_infant').value = caregiver.relationship_to_infant;

    // Prefill infant fields
    document.getElementById('infant_full_name').value = infant.full_name;
    document.getElementById('date_of_birth').value = infant.date_of_birth.split('T')[0];
    document.getElementById('gender').value = infant.gender;
    document.getElementById('weight').value = infant.weight;
    document.getElementById('facility').value = infant.facility;
    document.getElementById('facility_contact').value = infant.facility_contact;

   // Fetch all doctors and preselect caregiver’s doctor
const docRes = await fetch(`${BASE_URL}/api/admin/doctors`);
const docData = await docRes.json();

if (docData.success && Array.isArray(docData.doctors)) {
  doctorSelect.innerHTML = '';

  const assignedDoctorId = infant.doctor_id; // ✅ get doctor ID from infant

  // Add placeholder if no doctor assigned
  if (!assignedDoctorId) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select a doctor';
    placeholder.selected = true;
    placeholder.disabled = true;
    doctorSelect.appendChild(placeholder);
  }

  docData.doctors.forEach((doc) => {
    const option = document.createElement('option');
    option.value = String(doc.doctor_id);
    option.textContent = doc.full_name;

    if (assignedDoctorId && String(assignedDoctorId) === String(doc.doctor_id)) {
      option.selected = true;
    }

    doctorSelect.appendChild(option);
  });
}

  } catch (error) {
    console.error('Error fetching caregiver data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Server Error',
      text: 'Unable to load caregiver data. Please try again later.',
    });
  }

  //  Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      caregiver_full_name: document.getElementById('caregiver_full_name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      relationship_to_infant: document.getElementById('relationship_to_infant').value,
      infant_full_name: document.getElementById('infant_full_name').value.trim(),
      date_of_birth: document.getElementById('date_of_birth').value,
      gender: document.getElementById('gender').value,
      weight: document.getElementById('weight').value,
      facility: document.getElementById('facility').value.trim(),
      facility_contact: document.getElementById('facility_contact').value.trim(),
      doctor_id: document.getElementById('doctor_id').value
    };

    // Simple front-end validation
    if (
      !payload.caregiver_full_name ||
      !payload.email ||
      !payload.phone ||
      !payload.relationship_to_infant ||
      !payload.infant_full_name ||
      !payload.date_of_birth ||
      !payload.gender ||
      !payload.weight ||
      !payload.facility ||
      !payload.facility_contact ||
      !payload.doctor_id
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'All caregiver, infant fields, and doctor assignment are required.',
      });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/admin/caregiver/${caregiverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: data.message || 'Caregiver updated successfully!',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = 'manageCaregiver.html';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data.message || 'Failed to update caregiver.'
        });
      }

    } catch (error) {
      console.error('Error updating caregiver:', error);
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Please try again later.'
      });
    }
  });

  //  Cancel button
  document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = 'manageCaregiver.html';
  });
});
