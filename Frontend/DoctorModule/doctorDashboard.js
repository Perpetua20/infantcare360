document.addEventListener('DOMContentLoaded', async () => {
  const BASE_URL = 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Extract doctor info
  const doctorId = user.doctor_id;
  const doctorName = user.full_name;
  const doctorRole = user.role;
  
  console.log("User in localStorage:", user);
console.log("Doctor ID:", doctorId);
console.log("Doctor Name:", doctorName);

  // ====================== TOKEN MONITOR ======================

  if (!token || !doctorId) {
    alert('Access denied. Please log in first.');
    window.location.href = '../LoginPages/staffLogin.html';
    return;
  }

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


  //  Show doctor info in the welcome header
  document.getElementById('welcomeText').innerText = `Hello, ${doctorName}`;

  //  Fetch doctor dashboard stats
  try {
    const res = await fetch(`${BASE_URL}/api/doctors/dashboard/${doctorId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.code === 'TOKEN_EXPIRED') {
        alert('Session expired. Please log in again.');
        localStorage.clear();
        window.location.href = '../LoginPages/staffLogin.html';
        return;
      }
      alert(data.message || 'Failed to load dashboard data.');
      return;
    }

   
    const stats = data.data || {};

    // Populate dashboard cards with data
    document.getElementById('totalInfants').textContent = stats.totalInfants || 0;
    document.getElementById('upcomingVaccinations').textContent = stats.upcomingVaccinations || 0;
    document.getElementById('completedVaccinations').textContent = stats.completedVaccinations || 0;
    document.getElementById('pendingConsultations').textContent = stats.pendingConsultations || 0;
    document.getElementById('overdueVaccinations').textContent = stats.overdueVaccinations || 0;
    document.getElementById('newInfantsAssigned').textContent = stats.newInfantsAssigned || 0;

  } catch (error) {
    console.error('Dashboard error:', error);
    alert('Server error. Please try again later.');
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