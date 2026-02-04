document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:5000'; // Backend URL
  const form = document.getElementById('editDoctorForm');

  // Get token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire('Access Denied', 'You must be logged in to edit a doctor.', 'error').then(() => {
      window.location.href = '../LoginPages/staffLogin.html';
    });
    return;
  }

  //  Get doctor ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const doctorId = urlParams.get('id');
  if (!doctorId) {
    alert('No Doctor ID provided!');
    return;
  }

  //  Fetch doctor data
  try {
    const res = await fetch(`${BASE_URL}/api/admin/doctor/${doctorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('Backend error fetching doctor:', data.message);
      Swal.fire('Error', data.message || 'Failed to fetch doctor data.', 'error');
      return;
    }

    const { doctor } = data;
    document.getElementById('fullName').value = doctor.full_name;
    document.getElementById('email').value = doctor.email;
    document.getElementById('phone').value = doctor.phone_number;
    document.getElementById('license').value = doctor.license;
    document.getElementById('fee').value = doctor.consultation_fee || '';
    document.getElementById('status').value = doctor.account_status;

  } catch (error) {
    console.error('Error fetching doctor data:', error);
    Swal.fire('Server Error', 'Failed to fetch doctor data. Try again later.', 'error');
  }

  //  Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      full_name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone_number: document.getElementById('phone').value.trim(),
      license: document.getElementById('license').value,
      consultation_fee: document.getElementById('fee').value,
      account_status: document.getElementById('status').value
    };

    try {
      const res = await fetch(`${BASE_URL}/api/admin/doctor/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
     

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: data.message || 'Doctor updated successfully!',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = 'manageDoctors.html';
        });
      } else {
        console.error('Backend error updating doctor:', data.message);
        Swal.fire('Failed', data.message || 'Failed to update doctor.', 'error');
      }

    } catch (error) {
      
      console.error('Error updating doctor:', error);
      Swal.fire('Server Error', 'Please try again later.', 'error');
    }
  });

  document.getElementById('cancelButton').addEventListener('click', () => {
    window.location.href = 'manageDoctors.html';
  });
});
