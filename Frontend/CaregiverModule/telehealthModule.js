// ==================== SIDEBAR DROPDOWN MENU ====================
const vaccineMenu = document.querySelector(".vaccine");
const submenuContainer = vaccineMenu.querySelector(".submenu");
const arrow = vaccineMenu.querySelector("#arrow");
const submenuLinks = submenuContainer.querySelectorAll("li");
const menuHeader = vaccineMenu.querySelector(".menu-header");
const home = document.querySelector(".home");
const history = document.querySelector(".history");
const schedule = document.querySelector(".schedule");
const educate = document.querySelector(".educate");
const consult = document.querySelector(".consult");

// --- Keep submenu open on active page ---
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  submenuLinks.forEach(link => {
    const linkPage = link.querySelector("a").getAttribute("href").split("/").pop();

    if (currentPage === linkPage) {
      // Highlight active submenu item
      link.classList.add("active2");

      // Keep submenu open
      vaccineMenu.classList.add("active");
      submenuContainer.classList.add("active");

      // Rotate arrow
      arrow.style.transform = "rotate(180deg)";
    }
  });
});


// --- Toggle dropdown when clicking Vaccination Tracking ---
menuHeader.addEventListener("click", () => {
  vaccineMenu.classList.toggle("active");
  submenuContainer.classList.toggle("active");

  // Optional: toggle visibility of other main menu items for animation
  home.classList.toggle("active");
  history.classList.toggle("active");
  schedule.classList.toggle("active");
  educate.classList.toggle("active");
  consult.classList.toggle("active");

  // Rotate arrow smoothly
  arrow.style.transition = "transform 0.3s ease";
  if (vaccineMenu.classList.contains("active")) {
    arrow.style.transform = "rotate(180deg)";
  } else {
    arrow.style.transform = "rotate(0deg)";
  }
});

//SWITCHING TABS
// ====================== TAB SWITCHING ======================
const upcoming = document.querySelector('.upcomingMeeting');
const overdue = document.querySelector('.overdueMeeting');
const past = document.querySelector('.pastMeeting');
const pending = document.querySelector('.pendingMeeting');
const canceled = document.querySelector('.canceledMeeting');
const reschedule = document.querySelector('.rescheduleMeeting');
const appointment = document.querySelector('.appointment');

const upcomingCon = document.querySelector('.upcomingCon');
const overdueCon = document.querySelector('.overdueCon');
const pastCon = document.querySelector('.pastCon');
const pendingCon = document.querySelector('.pendingCon');
const canceledCon = document.querySelector('.canceledCon');
const rescheduleCon = document.querySelector('.rescheduleCon');
const appointmentCon = document.querySelector('.bookAppointment');


upcomingCon.style.display = 'none';
overdueCon.style.display = 'none';
pastCon.style.display = 'none';
canceledCon.style.display = 'none';
pendingCon.style.display = 'block';
rescheduleCon.style.display = 'none';
appointmentCon.style.display = 'none';

function setActiveLink(activeLink) {
  [upcoming,overdue, past, pending, canceled,reschedule,appointment].forEach(link => {
    link.classList.remove('activeLink');
    link.style.backgroundColor = "white";
    link.style.color = "rgb(98, 98, 98)";
  });
  activeLink.classList.add('activeLink');
  activeLink.style.backgroundColor = "rgb(0, 0, 139)";
  activeLink.style.color = "rgb(225, 225, 225)";
}

function handleClick(event) {
  const clicked = event.target;
  if (clicked.classList.contains('upcomingMeeting')) {
    setActiveLink(upcoming);
    upcomingCon.style.display='block';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
    overdueCon.style.display='none';
    rescheduleCon.style.display = 'none';
    appointmentCon.style.display = 'none';
  } 
     else if (clicked.classList.contains('rescheduleMeeting')) {
    setActiveLink(reschedule);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
    overdueCon.style.display='none';
    rescheduleCon.style.display = 'block';
    appointmentCon.style.display = 'none';
  }
  else if (clicked.classList.contains('pastMeeting')) {
    setActiveLink(past);
    upcomingCon.style.display='none';
    pastCon.style.display='block';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
     overdueCon.style.display='none';
     rescheduleCon.style.display = 'none';
     appointmentCon.style.display = 'none';
  } 
  else if (clicked.classList.contains('pendingMeeting')) {
    setActiveLink(pending);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='block';
    canceledCon.style.display='none';
     overdueCon.style.display='none';
     rescheduleCon.style.display = 'none';
      appointmentCon.style.display = 'none';
  } 
  else if (clicked.classList.contains('canceledMeeting')) {
    setActiveLink(canceled);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='block';
     overdueCon.style.display='none';
     rescheduleCon.style.display = 'none';
    appointmentCon.style.display = 'none';
  }
   else if (clicked.classList.contains('overdueMeeting')) {
    setActiveLink(overdue);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
    overdueCon.style.display='block';
    rescheduleCon.style.display = 'none';
    appointmentCon.style.display = 'none';
  }
     else if (clicked.classList.contains('appointment')) {
    setActiveLink(appointment);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
    overdueCon.style.display='none';
    rescheduleCon.style.display = 'none';
    appointmentCon.style.display = 'block';
  }
}
[upcoming,overdue, past, pending, canceled,reschedule,appointment].forEach(link => link.addEventListener('click', handleClick));

//====================NAVIGATION SLIDER=========================
const menuBtn = document.querySelector('.logo-part i');
const navigation = document.querySelector('.features');
const logOutBtn = document.querySelector(' .dashboardLogOut');
const dashboard = document.querySelector('.dashboard');

function toggleNavigation(){
    if(menuBtn.classList.contains('fa-bars')){
        menuBtn.classList.remove('fa-bars');
        menuBtn.classList.add('fa-xmark');
        navigation.style.left = "0";
        logOutBtn.style.left = "50%";      
    }else{
        menuBtn.classList.add('fa-bars');
        menuBtn.classList.remove('fa-xmark');
        navigation.style.left = "-100%";
         logOutBtn.style.left = "-50%";  
    }
}

menuBtn.addEventListener("click", toggleNavigation);

// ==================== UNIVERSAL SIDEBAR DROPDOWN ====================
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {
  const header = item.querySelector(".menu-header");

  header.addEventListener("click", () => {

    // Close other open menus
    menuItems.forEach(i => {
      if (i !== item) i.classList.remove("open");
    });

    // Toggle current menu
    item.classList.toggle("open");
  });
});

//===============LOGOUT ===========================
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

// =====================================================================
// 👩‍⚕️ CAREGIVER TELEHEALTH MODULE
// =====================================================================
const API_BASE = "http://localhost:5000/api/consultations";
let caregiverId, token, user;

async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  return response;
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const consultationId = urlParams.get("consultation");

  if (consultationId) {
    console.log("🔗 Consultation ID detected from URL:", consultationId);

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No token found — user must log in first.");
      window.location.href = `/Frontend/Auth/caregiverLogin.html?consultation=${consultationId}`;
      return;
    }

    try {
      //  Fetch consultation details
      const res = await fetch(`http://localhost:5000/api/consultations/join/${consultationId}`, {
         method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log(data)

      if (res.ok && data.meetingUrl) {
        console.log("✅ Auto-joining consultation:", consultationId);
        //  Automatically join the telehealth meeting
        joinMeeting(data.meetingUrl, consultationId);
      } else {
        console.error("❌ Consultation not found or missing meeting URL:", data);
        Swal.fire("Error", "This consultation is not ready yet.", "error");
      }
    } catch (err) {
      console.error("⚠️ Failed to auto-join consultation:", err);
      Swal.fire("Error", "Unable to join meeting. Please try again later.", "error");
    }
  }
});

// ====================== TOKEN MONITOR ======================
document.addEventListener("DOMContentLoaded", async () => {
  token = localStorage.getItem("token");

 
  const rawUser = localStorage.getItem("user");
  try {
    user = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null;
  } catch (err) {
    console.error("Failed to parse user:", rawUser, err);
    localStorage.removeItem("user");
    window.location.href = "../LoginPages/caregiverLogin.html";
    return;
  }

  caregiverId = user?.caregiver_id;

  if (!token || !caregiverId) {
    Swal.fire({
      title: "Access Denied",
      text: "Please Login Again.",
      icon: "error",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "../LoginPages/caregiverLogin.html";
    });
    return;
  }

  // ====================== TOKEN EXPIRATION HANDLER ======================
  function getTokenExpiration(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch (err) {
      console.error("Invalid token payload:", err);
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
      localStorage.removeItem("user");
      window.location.href = "../LoginPages/caregiverLogin.html";
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
});

// =====================================================================
//  JWT DECODER + CAREGIVER ID EXTRACTION
// =====================================================================
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}

// =====================================================================
//  AUTO-FILL CAREGIVER INFO + INFANT DETAILS
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
  const rawUser = localStorage.getItem("user");
  let user = {};
  try {
    user = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : {};
  } catch (err) {
    console.error("Error parsing user from localStorage:", rawUser, err);
  }

  document.getElementById("caregiverNameInput").value = user.full_name || "";
  document.getElementById("email").value = user.email || "";
});

async function fetchInfantDetails(caregiverId) {
  try {
    const res = await fetch(`${API_BASE}/infants/${caregiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data && data.infant_name)
      document.getElementById("infantNameInput").value = data.infant_name;
  } catch (err) {
    console.error("Error fetching infant details:", err);
  }
}

async function loadInfantName() {
  try {
    const res = await fetch(`${API_BASE}/infants/${caregiverId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const infants = await res.json();

    const infantNameEl = document.getElementById('infantNameInput');

    if (!infants || infants.length === 0) {
      if (infantNameEl.tagName === "INPUT") {
        infantNameEl.value = 'No infant registered';
      } else {
        infantNameEl.textContent = 'No infant registered';
      }
      return;
    }

    // Use the first infant in the array
    const name = infants[0].full_name || infants[0].infant_name || 'Unknown';

    if (infantNameEl.tagName === "INPUT") {
      infantNameEl.value = name;
    } else {
      infantNameEl.textContent = name;
    }

  } catch (err) {
    console.error('Failed to load infant name:', err);
  }
}


// =====================================================================
//  LOAD DOCTORS LIST
// =====================================================================
async function loadDoctors() {
  try {
    const res = await fetch(`${API_BASE}/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const doctors = await res.json();
    const doctorSelect = document.getElementById("doctor");
    doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;
    doctors.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.doctor_id;
      option.textContent = `${doc.full_name}`;
      doctorSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading doctors:", err);
  }
}

// =====================================================================
//  PENDING CONSULTATIONS
// =====================================================================

async function fetchPendingConsultations() {
  try {
    const res = await fetch(`${API_BASE}/caregiver/${caregiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const pending = data.pending || [];
    displayPendingConsultations(pending);
  } catch (err) {
    console.error("❌ Error fetching pending consultations:", err);
    Swal.fire("Error", "Could not load pending consultations.", "error");
  }
}

function displayPendingConsultations(consultations) {
  const container = document.querySelector(".pending");
  container.innerHTML = "";

  if (!consultations?.length) {
    container.innerHTML = '<p class="no-data">No pending consultations found.</p>';
    return;
  }

  consultations.forEach((c) => {
    const date = new Date(c.scheduled_date).toLocaleString();
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <p><strong>Doctor:</strong> ${c.doctor_name}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Status:</strong> ${c.status}</p>
      <button class="reschedule-btn">Reschedule</button>
      <button class="cancel-btn">Cancel</button>
    `;

    card.querySelector(".reschedule-btn").onclick = () => handleReschedule(c);
    card.querySelector(".cancel-btn").onclick = () => cancelConsultation(c.id);

    container.appendChild(card);
  });
}

// =====================================================================
//  UPCOMING CONSULTATIONS
// =====================================================================
async function fetchUpcomingConsultations() {
  if (!caregiverId) return;
  try {
    const res = await fetch(`${API_BASE}/caregiver/${caregiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch");
    displayUpcomingConsultations(data.upcoming);
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

function displayUpcomingConsultations(consultations) {
  const container = document.querySelector(".upcoming");
  container.innerHTML = "";

  if (!consultations?.length) {
    container.innerHTML = '<p class="no-data">No upcoming consultations scheduled.</p>';
    return;
  }

  consultations.forEach((c) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <p>Doctor: ${c.doctor_name}</p>
      <p>Date: ${new Date(c.scheduled_date).toLocaleString()}</p>
      <p>Status: ${c.status}</p>
      <button class="join-btn">Join Meeting</button>
      <button class="reschedule-btn">Reschedule</button>
    `;

    card.querySelector(".join-btn").onclick = () => joinMeeting(c);
    card.querySelector(".reschedule-btn").onclick = () => handleReschedule(c);

    container.appendChild(card);
  });
}

// =====================================================================
//  RESCHEDULE REQUESTS
// =====================================================================
async function fetchRescheduleRequests() {
  try {
    const res = await fetch(`${API_BASE}/caregiver/${caregiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch");
    const all = Array.isArray(data)
      ? data
      : [
          ...(data.upcoming || []),
          ...(data.pending || []),
          ...(data.overdue || []),
          ...(data.canceled || []),
          ...(data.past || []),
        ];
    const list = all.filter(
      (c) => c.status === "pending_reschedule"
    );
    displayRescheduleRequests(list);
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

function displayRescheduleRequests(consultations) {
  const div = document.querySelector(".reschedule");
  div.innerHTML = "";
  if (!consultations?.length)
    return (div.innerHTML =
      '<p class="no-data">No reschedule requests found.</p>');
  consultations.forEach((c) => {
    const statusLabel =
      c.status === "pending_reschedule"
        ? "Awaiting Doctor Response"
        : c.status === "rescheduled"
        ? "Rescheduled"
        : c.status;
    const oldDate = new Date(
      c.old_date || c.previous_date || c.scheduled_date
    ).toLocaleString();
    const newDate = new Date(c.new_date || c.scheduled_date).toLocaleString();
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <p>Doctor: ${c.doctor_name}</p>
      <p>Old Date: ${oldDate}</p>
      <p>Requested New Date: ${newDate}</p>
      <p>Status: ${statusLabel}</p>
      <button class="cancel-btn" ${
        c.status !== "pending_reschedule" ? "disabled" : ""
      }>Cancel Request</button>`;
    card
      .querySelector(".cancel-btn")
      .addEventListener("click", () => cancelRescheduleRequest(c.id));
    div.appendChild(card);
  });
}

//  Cancel Reschedule Request
async function cancelRescheduleRequest(id) {
  try {
    const res = await fetch(`${API_BASE}/caregiver/manage/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caregiver_id: caregiverId,
        action: "cancel",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to cancel request");
    Swal.fire("Canceled", "Reschedule request withdrawn.", "success");
    fetchRescheduleRequests();
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

// =====================================================================
//  OVERDUE (MISSED) CONSULTATIONS
// =====================================================================
async function fetchOverdueConsultations() {
  try {
    const res = await fetch(`${API_BASE}/caregiver/${caregiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const list = Array.isArray(data)
      ? data.filter((c) => c.status === "overdue")
      : (data.overdue || []).filter((c) => c.status === "overdue");
    displayOverdueConsultations(list);
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

function displayOverdueConsultations(consultations) {
  const div = document.querySelector(".overdue");
  div.innerHTML = "";
  if (!consultations?.length)
    return (div.innerHTML =
      '<p class="no-data">No missed consultations found.</p>');
  consultations.forEach((c) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <p>Doctor: ${c.doctor_name}</p>
      <p>Date: ${new Date(c.scheduled_date).toLocaleString()}</p>
      <p>Status: Missed</p>
      <button class="reschedule-btn">Request Reschedule</button>`;
    card
      .querySelector(".reschedule-btn")
      .addEventListener("click", () => handleReschedule(c.id));
    div.appendChild(card);
  });
}
//  Unified Reschedule Function (upcoming + overdue)
async function handleReschedule(input) {
  const isObject = typeof input === "object" && input !== null;
  const consultationId = isObject ? input.id : input;
  const oldDate = isObject ? input.scheduled_date : null;

  const { value: newDate } = await Swal.fire({
    title: "Select New Date",
    input: "datetime-local",
    inputLabel: "Pick a new consultation date & time",
    inputValue: oldDate ? new Date(oldDate).toISOString().slice(0, 16) : "",
    showCancelButton: true,
    confirmButtonText: "Submit",
    preConfirm: (value) => {
      if (!value) Swal.showValidationMessage("Please select a new date/time");
      const selected = new Date(value);
      if (selected <= new Date()) {
        Swal.showValidationMessage("Please choose a future date/time");
        return;
      }
      return value;
    },
  });

  if (!newDate) return;

  Swal.fire({
    title: "Sending request...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const payload = {
      caregiver_id: caregiverId,
      full_name: user?.full_name,
      action: "reschedule",
      new_date: newDate,
    };

    const res = await fetch(`${API_BASE}/caregiver/manage/${consultationId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to request reschedule");

    Swal.fire("Success", "Reschedule request sent successfully.", "success");

    // Refresh relevant sections
    if (isObject) fetchUpcomingConsultations();
    else fetchOverdueConsultations();
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}


// =====================================================================
//  CANCELED CONSULTATIONS + REBOOK
// =====================================================================
// Store rebooked consultation IDs globally
async function fetchCanceledConsultations() {
  try {
    const res = await fetch(`${API_BASE}/caregiver/${caregiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const list = Array.isArray(data.canceled) ? data.canceled : [];

    displayCanceledConsultations(list);
    return list;
  } catch (err) {
    Swal.fire("Error", err.message, "error");
    return [];
  }
}

function displayCanceledConsultations(consultations) {
  const div = document.querySelector(".canceled");
  div.innerHTML = "";

  if (!consultations?.length) {
    div.innerHTML = '<p class="no-data">No canceled consultations found.</p>';
    return;
  }

  consultations.forEach((c) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const alreadyRebooked = c.rebooked || false;

    card.innerHTML = `
      <p>Doctor: ${c.doctor_name}</p>
      <p>Canceled On: ${new Date(c.canceled_at || c.updated_at || c.scheduled_date).toLocaleString()}</p>
      <p>Reason: ${c.reason || "Not specified"}</p>
      <p>Status: Canceled</p>
      <button class="rebook-btn" ${alreadyRebooked ? "disabled" : ""}>
        ${alreadyRebooked ? "Already Rebooked" : "Rebook"}
      </button>
    `;

    const rebookBtn = card.querySelector(".rebook-btn");

    rebookBtn.addEventListener("click", () => {
      if (alreadyRebooked) return;

      // Immediately disable the button to prevent double clicks
      rebookBtn.disabled = true;
      rebookBtn.textContent = "Rebooking...";

      // Open / prefill booking form
      bookForm.dataset.rebookingId = c.id;
      rebookConsultation(c); // your existing function to open tab/prefill
    });

    div.appendChild(card);
  });
}


// =====================================================================
//  JOIN, CANCEL, RESCHEDULE, REBOOK LOGIC
// =====================================================================

let isJoining = false;
let activeApi = null;

async function joinMeeting(c, forcedId = null) {
  //  1. LOCK CHECK: Prevent concurrent execution (Fix A)
  if (isJoining) {
    console.warn("⚠️ joinMeeting call blocked: Already in progress for another call.");
    return;
  }
  isJoining = true; // Set the lock

  let consultationId;
  let meetingUrl = null;

  if (typeof c === "object" && c !== null) {
    consultationId = c.id;
  } else {
    consultationId = forcedId;
    meetingUrl = c;
  }

  console.log("🧠 joinMeeting called with:", c);
  console.log("🆔 Consultation ID:", consultationId);

  try {
    Swal.fire({
      title: "Checking meeting status...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await authFetch(`${API_BASE}/join/${consultationId}`, { method: "POST" });
    const joinData = await res.json();
    const consultation = joinData.consultation || joinData; 

    console.log("🔍 Join Data fetched (Status & Caregiver Joined):", joinData);

    if (!res.ok) {
        Swal.close();
        return Swal.fire("Error", joinData.message || "Failed to join meeting.", "error");
    }

    if (!consultation.doctor_joined) {
      Swal.close();
      return Swal.fire(
        "Cannot Join Yet",
        "Please wait — the doctor has not joined the meeting yet.",
        "warning"
      );
    }

    meetingUrl =
      meetingUrl ||
      joinData.meetingUrl ||
      joinData.meeting_url ||
      consultation.meetingUrl ||
      consultation.meeting_url;

    if (!meetingUrl) {
      Swal.close();
      return Swal.fire("No meeting link found", "Please try again later.", "warning");
    }

    Swal.close();

    //  5. Open modal and prepare Jitsi interface (Remaining code unchanged)
    const modal = document.getElementById("jitsi-modal");
    const container = document.getElementById("jitsi-container");
    const leaveBtn = document.getElementById("leave-meeting-btn");

    modal.style.display = "block";
    container.innerHTML = ""; // clear previous session

    //  Dispose existing instance (if rejoining)
    if (activeApi) {
      console.log("Disposing existing Jitsi instance before rejoin...");
      activeApi.dispose();
      activeApi = null;
    }

    const domain = "meet.jit.si";
    const roomName = meetingUrl.split("/").pop();

    const options = {
      roomName,
      parentNode: container,
      width: "100%",
      height: "100%",
      userInfo: { displayName: user?.name || "Caregiver" },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableSelfView: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        FILM_STRIP_ONLY: false,
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "closedcaptions", "desktop", "embedmeeting",
          "fullscreen", "fodeviceselection", "profile", "chat", "recording",
          "livestreaming", "etherpad", "sharedvideo", "settings", "raisehand",
          "videoquality", "filmstrip", "invite", "feedback", "stats",
          "shortcuts", "tileview", "videobackgroundblur", "download",
          "help", "mute-everyone", "security", "participants-pane"
        ].filter(btn => btn !== "hangup"),
      },
    };

    console.log("🎥 Creating Jitsi API for caregiver with room:", roomName);
    const api = new JitsiMeetExternalAPI(domain, options);
    activeApi = api;

    // --- Handle Meeting Exit ---
    api.addEventListener("readyToClose", () => {
      console.log(`Caregiver meeting ended for consultation ${consultationId}`);
      handleMeetingExit(api, consultationId);
    });

    leaveBtn.onclick = () => {
      console.log(`Caregiver manually left meeting for consultation ${consultationId}`);
      handleMeetingExit(api, consultationId);
    };

  } catch (err) {
    Swal.close();
    Swal.fire("Error", err.message || "Failed to join meeting.", "error");
    console.error("❌ joinMeeting error:", err);
  } finally {
    //  6. UNLOCK: Always release the lock when finished
    isJoining = false; 
  }
}

async function handleMeetingExit(api, consultationId) {
  try {
    if (api) {
      api.dispose();
    }
    document.getElementById("jitsi-modal").style.display = "none";
    activeApi = null;

    // Notify backend
    await authFetch(`${API_BASE}/leave/${consultationId}`, { method: "POST" });

    Swal.fire("You have left the meeting.", "", "info");
  } catch (err) {
    console.error("Error leaving meeting:", err);
  }
}

function cancelConsultation(id) {
  Swal.fire({
    title: "Cancel Consultation?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, cancel",
  }).then(async (r) => {
    if (!r.isConfirmed) return;
    const res = await fetch(`${API_BASE}/caregiver/manage/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caregiver_id: caregiverId, action: "cancel" }),
    });
    const data = await res.json();
    if (!res.ok) return Swal.fire("Error", data.message, "error");
    Swal.fire("Canceled", "Consultation canceled.", "success");
    fetchUpcomingConsultations();
  });
}

function rebookConsultation(consultation) {
  // Store the original consultation ID for later
  bookForm.dataset.rebookingId = consultation.id;

  // Show the appointment tab
  appointmentCon.style.display = "block";
  [upcomingCon, overdueCon, pastCon, pendingCon, canceledCon, rescheduleCon].forEach(
    c => (c.style.display = "none")
  );

  // Update active tab styling
  setActiveLink(appointment);

  // Prefill booking form
  document.getElementById("doctor").value = consultation.doctor_id;
  document.getElementById("reason").value = consultation.reason || "";

  // Reset date/time input
  document.getElementById("datetime").value = "";
  document.getElementById("datetime").focus();
}


// =====================================================================
//  PAST CONSULTATIONS
// =====================================================================
async function fetchPastConsultations() {
  try {
    const res = await fetch(`${API_BASE}/caregiver/${caregiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(data);
    
    displayPastConsultations(data.past || []);
  } catch (err) {
    Swal.fire("Error", "Could not load past consultations.", "error");
  }
}

function displayPastConsultations(consultations) {
  const div = document.querySelector(".past");
  div.innerHTML = "";
  if (!consultations?.length)
    return (div.innerHTML =
      '<p class="no-data">No past consultations found.</p>');
  consultations.forEach((c) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <p>Doctor: ${c.doctor_name}</p>
      <p>Date: ${new Date(c.scheduled_date).toLocaleString()}</p>
      <p>Status: Completed</p>`;
    div.appendChild(card);
  });
}

// ======= Book Appointment Form =======
const bookForm = document.querySelector('.bookAppointment form');

bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const doctor = document.getElementById('doctor').value;
    const datetime = document.getElementById('datetime').value;
    const reason = document.getElementById('reason').value;

    if (!doctor || !datetime || !reason) {
        Swal.fire('Error', 'Please fill in all required fields', 'error');
        return;
    }

    const selectedDate = new Date(datetime);
    const now = new Date();
    if (selectedDate < now) {
        Swal.fire('Error', 'You cannot select a past date/time', 'error');
        return;
    }

    Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while your consultation is being booked.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        // Book consultation
        const res = await fetch(`${API_BASE}/book`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caregiver_id: caregiverId,
                doctor_id: doctor,
                scheduled_date: datetime,
                reason: reason,
                rebookingId: bookForm.dataset.rebookingId || null
            })
        });

        const data = await res.json();
        Swal.close();

        if (!res.ok) throw new Error(data.message || 'Failed to book consultation');

        Swal.fire('Success', 'Your consultation request has been submitted', 'success');

        // Reset form
        bookForm.reset();

        // If it was a rebook, the backend already marked it
        if (bookForm.dataset.rebookingId) {
            // Refresh canceled consultations to reflect rebooked status
            await fetchCanceledConsultations();
            bookForm.dataset.rebookingId = "";
        }

        // Refresh upcoming consultations
        fetchUpcomingConsultations();

    } catch (err) {
        Swal.close();
        Swal.fire('Error', err.message, 'error');
    }
});


// ===================== CONTINUOUS POLLING =====================
let isPolling = false;

function startCaregiverPolling(interval = 10000) { // default 10 seconds
  setInterval(async () => {
    if (isPolling) return; // prevent overlapping requests
    isPolling = true;
    try {
      if (!caregiverId || !token) return;
      await Promise.all([
        fetchPendingConsultations(),
        fetchUpcomingConsultations(),
        fetchRescheduleRequests(),
        fetchOverdueConsultations(),
        fetchCanceledConsultations(),
        fetchPastConsultations(),
      ]);
      console.log("✅ Caregiver consultations refreshed");
    } catch (err) {
      console.error("❌ Error polling caregiver consultations:", err);
    } finally {
      isPolling = false;
    }
  }, interval);
}

// ===================== START POLLING AFTER INITIAL LOAD =====================
document.addEventListener("DOMContentLoaded", async () => {
  await fetchInfantDetails(caregiverId);
  await loadInfantName();  
  await loadDoctors();
  await Promise.all([
    fetchPendingConsultations(),
    fetchUpcomingConsultations(),
    fetchRescheduleRequests(),
    fetchOverdueConsultations(),
    fetchCanceledConsultations(),
    fetchPastConsultations(),
  ]);


  startCaregiverPolling(10000); 
});
