let currentPage = 1;
let currentSearch = '';

async function fetchCaregivers(page = 1, search = '') {
  try {
    const res = await fetch(`http://localhost:5000/api/admin/caregivers?page=${page}&search=${search}`);
    const data = await res.json();

    const tableBody = document.getElementById('caregiverTableBody');
    tableBody.innerHTML = '';

    if (!res.ok || !data.success) {
      tableBody.innerHTML = `<tr><td colspan="8">${data.message || 'Failed to fetch caregivers.'}</td></tr>`;
      return;
    }

    if (data.caregivers.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8">No caregivers found.</td></tr>';
    } else {
      data.caregivers.forEach((caregiver, index) => {
        const rowNumber = (page - 1) * 10 + index + 1;

        const row = `
          <tr>
            <td>${rowNumber}</td>
            <td>${caregiver.full_name}</td>
            <td>${caregiver.email}</td>
            <td>${caregiver.phone_number}</td>
            <td>${caregiver.infants || '-'}</td>
            <td>${caregiver.relationship_to_infant}</td>
            <td>${caregiver.status}</td>
            <td class="actions">
              <button class="edit" data-id="${caregiver.caregiver_id}">Edit</button>
              <button class="del" data-id="${caregiver.caregiver_id}">Delete</button>
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

    pageInfo.textContent = `Page ${data.pagination.currentPage} of ${data.pagination.totalPages} | Total Caregivers: ${data.pagination.totalCaregivers}`;

  } catch (error) {
    console.error('Error fetching caregivers:', error);
    alert('Server error. Please try again later.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  fetchCaregivers(currentPage);

  // Pagination buttons
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchCaregivers(currentPage, currentSearch);
    }
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    currentPage++;
    fetchCaregivers(currentPage, currentSearch);
  });

  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  const searchButton = document.querySelector('.searchCon button');

  const performSearch = () => {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    fetchCaregivers(currentPage, currentSearch);
  };

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // Edit button 
  document.getElementById('caregiverTableBody').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('edit')) {
      const id = e.target.getAttribute('data-id');
      window.location.href = `/Frontend/AdminModule/editCaregivers.html?id=${id}`;
    }
  });

  // Delete button using event delegation 
  document.getElementById('caregiverTableBody').addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('del')) {
      const id = e.target.getAttribute('data-id');
      const token = localStorage.getItem('token'); 

      if (!token) {
        Swal.fire('Access Denied', 'You must be logged in to delete a caregiver.', 'error');
        return;
      }

      Swal.fire({
        title: 'Are you sure?',
        text: "This will delete the caregiver and their infant!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!',
        cancelButtonText: 'Cancel'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`http://localhost:5000/api/admin/caregiver/${id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            const data = await res.json();

            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Caregiver deleted successfully.'
              });
              fetchCaregivers(currentPage, currentSearch); 
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: data.message || 'Failed to delete caregiver.'
              });
            }
          } catch (err) {
            console.error('Error deleting caregiver:', err);
            Swal.fire({
              icon: 'error',
              title: 'Server Error',
              text: 'Please try again later.'
            });
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