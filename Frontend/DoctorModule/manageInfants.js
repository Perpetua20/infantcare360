document.addEventListener("DOMContentLoaded", async () => {
  const infantTableBody = document.getElementById("infantTableBody");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  let currentPage = 1;
  let totalPages = 1;
  let currentSearch = "";

  const backendUrl = "http://localhost:5000/api/doctors/infants";

// ====================== TOKEN MONITOR ======================
const token = localStorage.getItem("token");
function getTokenExpiration(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch (err) {
    return null;
  }
}

function redirectToLogin() {
  Swal.fire({
    title: "Session Expired",
    text: "Your session has expired. Please log in again.",
    icon: "warning",
    confirmButtonText: "Login",
  }).then(() => {
    localStorage.removeItem("token");
    window.location.href = "../LoginPages/staffLogin.html";
  });
}

function startTokenMonitor() {
  const token = localStorage.getItem("token");
  if (!token) return redirectToLogin();
  const expTime = getTokenExpiration(token);
  if (!expTime) return redirectToLogin();

  const interval = setInterval(() => {
    if (Date.now() >= expTime) {
      clearInterval(interval);
      redirectToLogin();
    }
  }, 5000);
}
startTokenMonitor();

  // Fetch infants
  async function fetchInfants(page = 1, search = "") {
    try {
      const res = await fetch(`${backendUrl}?page=${page}&search=${search}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.status === 401) {
        alert("Session expired or unauthorized. Please login again.");
        window.location.href = "./login.html";
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      if (!data.infants || !data.infants.length) {
        infantTableBody.innerHTML = `<tr><td colspan="6">No infants found</td></tr>`;
        pageInfo.textContent = "Page 0 of 0";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }

      currentPage = data.currentPage;
      totalPages = data.totalPages;

      populateTable(data.infants);
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;

    } catch (err) {
      console.error("Error fetching infants:", err);
      infantTableBody.innerHTML = `<tr><td colspan="6">Failed to load infants. ${err.message}</td></tr>`;
    }
  }

  // Populate table with sequential IDs
  function populateTable(infants) {
    infantTableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * 5; 

    infants.forEach((infant, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${startIndex + index + 1}</td>
        <td>${infant.name}</td>
        <td>${formatDate(infant.dob)}</td>
        <td>${infant.caregiverName}</td>
        <td>${infant.gender}</td>
        <td>
          <button class="viewBtn edit" data-id="${infant.id}">View Vaccination</button>
         </td>
      `;

      infantTableBody.appendChild(tr);
    });

    addActionListeners();
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  }

  function addActionListeners() {
    // View Vaccination button
    document.querySelectorAll(".viewBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const infantId = btn.dataset.id;
        window.location.href = `./vaccinationManagement.html?infantId=${infantId}`;
      });
    });
  }

  // Search functionality
  searchBtn.addEventListener("click", () => {
    currentSearch = searchInput.value.trim();
    fetchInfants(1, currentSearch);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      currentSearch = searchInput.value.trim();
      fetchInfants(1, currentSearch);
    }
  });

  // Pagination
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) fetchInfants(currentPage - 1, currentSearch);
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) fetchInfants(currentPage + 1, currentSearch);
  });

  // Initialize
  fetchInfants();
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