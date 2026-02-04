document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.replace('../LoginPages/staffLogin.html');

  function getTokenExpiration(token) {
    if (!token) return null;
    try { return JSON.parse(atob(token.split(".")[1])).exp * 1000; } 
    catch { return null; }
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
    const expTime = getTokenExpiration(token);
    if (!expTime) return redirectToLogin();
    const interval = setInterval(() => {
      if (Date.now() >= expTime) { clearInterval(interval); redirectToLogin(); }
    }, 5000);
  }
  startTokenMonitor();

  // ✅ Fetch welcome info + dashboard counts in one request
  try {
    const res = await fetch('http://localhost:5000/api/admin/dashboard', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error("Failed to fetch dashboard data");

    const data = await res.json();

    // Update welcome message
    const welcomeDiv = document.getElementById('welcome');
    if (welcomeDiv && data.user) {
      welcomeDiv.innerText = `Welcome ${data.user.role}, ${data.user.email}`;
    }

    // Update dashboard card counts
    const cardElements = document.querySelectorAll('.cards .card .count');
    if (cardElements.length >= 6) {
      cardElements[0].innerText = data.totalDoctors ?? '0';
      cardElements[1].innerText = data.totalCaregivers ?? '0';
      cardElements[2].innerText = data.totalInfants ?? '0';
      cardElements[3].innerText = data.pendingConsultations ?? '0';
      cardElements[4].innerText = data.newRegistrations ?? '0';
      cardElements[5].innerText = data.completedVaccinations ?? '0';
    }

  } catch (err) {
    console.error('Dashboard error:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('../LoginPages/staffLogin.html');
  }
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