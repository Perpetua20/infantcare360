let currentPage = 1;
let currentSearch = '';

// Fetch doctors with pagination and search
async function fetchDoctors(page = 1, search = '') {
  try {
    const token = localStorage.getItem('token'); // JWT token for protected routes
    if (!token) {
      alert('You must be logged in to view doctors.');
      return;
    }

    const res = await fetch(`http://localhost:5000/api/admin/all?page=${page}&search=${search}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    const tableBody = document.getElementById('doctorTableBody');
    tableBody.innerHTML = '';

    if (!res.ok || !data.success) {
      tableBody.innerHTML = `<tr><td colspan="9">${data.message || 'Failed to fetch doctors.'}</td></tr>`;
      return;
    }

    if (data.doctors.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9">No doctors found.</td></tr>';
    } else {
      data.doctors.forEach((doc, index) => {
        const rowNumber = (page - 1) * 10 + index + 1;

        const row = `
          <tr>
            <td>${rowNumber}</td>
            <td>${doc.full_name}</td>
            <td>${doc.email}</td>
            <td>${doc.phone_number}</td>
            <td>${doc.license}</td>
            <td>${doc.consultation_fee ? 'Ksh ' + doc.consultation_fee : '-'}</td>
            <td>${doc.account_status}</td>
            <td>${new Date(doc.date_added).toLocaleDateString()}</td>
            <td class="actions">
              <button class="edit" data-id="${doc.doctor_id}">Edit</button>
              <button class="del" data-id="${doc.doctor_id}">Delete</button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }

    // Pagination buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= data.pagination.totalPages;

    pageInfo.textContent = `Page ${data.pagination.currentPage} of ${data.pagination.totalPages} | Total Doctors: ${data.pagination.totalDoctors}`;

  } catch (error) {
    console.error('Error fetching doctors:', error);
    alert('Server error. Please try again later.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  fetchDoctors(currentPage);

  // Pagination buttons
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchDoctors(currentPage, currentSearch);
    }
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    currentPage++;
    fetchDoctors(currentPage, currentSearch);
  });

  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  const searchButton = document.querySelector('.searchCon button');

  const performSearch = () => {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    fetchDoctors(currentPage, currentSearch);
  };

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // Table body event delegation for edit and delete buttons
  const tableBody = document.getElementById('doctorTableBody');

  tableBody.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;

    // Edit button
    if (e.target.classList.contains('edit')) {
      window.location.href = `/Frontend/AdminModule/editDoctors.html?id=${id}`;
      return;
    }

    // Delete button
    if (e.target.classList.contains('del')) {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Access Denied', 'You must be logged in to delete a doctor.', 'error');
        return;
      }

      Swal.fire({
        title: 'Are you sure?',
        text: "This will delete the doctor!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!',
        cancelButtonText: 'Cancel'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`http://localhost:5000/api/admin/doctor/${id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(errorText);
            }

            const data = await res.json();

            if (data.success) {
              Swal.fire('Deleted!', 'Doctor deleted successfully.', 'success');
              fetchDoctors(currentPage, currentSearch); // Refresh table
            } else {
              Swal.fire('Failed!', data.message || 'Failed to delete doctor.', 'error');
            }
          } catch (err) {
            console.error('Error deleting doctor:', err);
            Swal.fire('Server Error', 'Please try again later.', 'error');
          }
        }
      });
    }
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const logoutBtns = document.querySelectorAll(".logoutBtn");

  function logout() {
    Swal.fire({
      text: "Are you sure you want to leave the page?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      customClass: { popup: "swal-custom-zindex" },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.href = "../LandingPage/index.html";
      }
    });
  }

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", logout);
  });
});
