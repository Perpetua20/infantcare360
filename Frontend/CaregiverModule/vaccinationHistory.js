// ==================== NAVIGATION SLIDER ====================
const menuBtn = document.querySelector('.logo-part i');
const navigation = document.querySelector('.features');
const logOutBtn = document.querySelector('.dashboardLogOut');
const dashboard = document.querySelector('.dashboard');

function toggleNavigation() {
  if (menuBtn.classList.contains('fa-bars')) {
    // Open navigation
    menuBtn.classList.remove('fa-bars');
    menuBtn.classList.add('fa-xmark');
    navigation.style.left = "0";
    logOutBtn.style.left = "50%";
  } else {
    // Close navigation
    menuBtn.classList.add('fa-bars');
    menuBtn.classList.remove('fa-xmark');
    navigation.style.left = "-100%";
    logOutBtn.style.left = "-50%";
  }
}

menuBtn.addEventListener("click", toggleNavigation);


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

document.addEventListener("DOMContentLoaded", () => {
  // ------------------- DOM ELEMENTS -------------------
  const infantNameEl = document.querySelector(".header .text p");
  const progressBarEl = document.querySelector(".card1 .progressBar");
  const progressTextEl = document.querySelector(".card1 .text p:last-child");
  const lastDoseEl = document.querySelector(".card2 .text");
  const nextDoseEl = document.getElementById("nextDoseInfo"); // ensure this exists in HTML
  const vaccineHistoryContainer = document.querySelector(".vaccineHistory");

  // ------------------- BACKEND -------------------
  const endpoint = "http://localhost:5000/api/caregiver/vaccination/history";
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first.");
    window.location.href = "../LoginPages/caregiverLogin.html";
    return;
  }

  // ------------------- HELPER FUNCTIONS -------------------
  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  function scheduleLabelFromWeeks(weeks) {
    return `Week ${weeks} vaccines`;
  }

  function calculateVaccineDate(dobString, weeks) {
    let dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
      const clean = dobString.split("T")[0];
      const parts = clean.split("-");
      if (parts.length === 3) dob = new Date(parts[0], parts[1] - 1, parts[2]);
      else return "Invalid Date";
    }

    const nextDate = new Date(dob);
    nextDate.setDate(nextDate.getDate() + weeks * 7);
    return nextDate;
  }

  function daysUntil(dateObj) {
    const today = new Date();
    const diffTime = dateObj.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // ------------------- FETCH DATA -------------------
  fetch(endpoint, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error(data.message);

      const { infant, lastDose, progressPercent, nextDose, administeredHistory } = data;

      // ------------------- INFANT NAME -------------------
      infantNameEl.textContent = `View all vaccines administered for ${infant.full_name}.`;

      // ------------------- PROGRESS BAR -------------------
     
     // ------------------- PROGRESS BAR -------------------
            progressTextEl.textContent = `${progressPercent}% of vaccines completed or recorded`;

            // Dynamically set width
            progressBarEl.style.setProperty("--progress-width", `${progressPercent}%`);

            // Dynamically set color based on completion %
            let progressColor = "rgb(2, 157, 2)";

            progressBarEl.style.setProperty("--progress-color", progressColor);
      
      // ------------------- LAST DOSE -------------------
      if (lastDose) {
 
        lastDoseEl.innerHTML = `
          <h4>Last Received Doses</h4>
          <p>Schedule: ${lastDose.schedule}</p>
          <p>Given on: ${formatDate(lastDose.date_administered)}</p>
          <p>Given By: ${lastDose.doctor_name || "N/A"}</p>
        `;
      } else {
        lastDoseEl.innerHTML = `<h4>Last Received Doses</h4><p>No doses administered or recorded yet.</p>`;
      }

// ------------------- NEXT DOSE -------------------
if (nextDose && nextDose.recommended_date) {
  const nextDoseDiv = nextDoseEl;

  
  const [year, month, day] = nextDose.recommended_date.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);

 
  const formattedDate = dueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

 
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueMid = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffTime = dueMid - todayMid;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (nextDoseDiv) {
    nextDoseDiv.innerHTML = `
      <h4>Next Doses</h4>
      <p>Schedule: Week ${nextDose.recommended_age_weeks} vaccines</p>
      <p>Scheduled Date: ${formattedDate}</p>
     <p>Due in: ${
        daysRemaining > 0
          ? daysRemaining + ' days'
          : daysRemaining === 0
          ? 'Due today!'
          : 'Overdue!'
      }</p>
    `;
  }
} else {
  if (nextDoseEl) {
    nextDoseEl.innerHTML = `<h4>Next Doses</h4><p>All vaccines administered!</p>`;
  }
}

// ------------------- ADMINISTERED HISTORY -------------------
vaccineHistoryContainer.innerHTML = ""; 

if (!administeredHistory || administeredHistory.length === 0) {
  // No vaccine history yet
  vaccineHistoryContainer.innerHTML = `
    <div class="no-history">
      <p>No vaccines have been administered or recorded yet.</p>
    </div>
  `;
} else {
  // There is history to display
  administeredHistory.forEach(schedule => {
    const card = document.createElement("div");
    card.classList.add("card");

    const scheduleLabel = scheduleLabelFromWeeks(schedule.recommended_age_weeks);

    card.innerHTML = `
      <h4>${scheduleLabel}</h4>
      ${schedule.vaccines
        .map((v, i) => `<p class="${i === schedule.vaccines.length - 1 ? "lastText" : ""}">${v}</p>`)
        .join("")}
      <p class="date">Administered on: ${formatDate(schedule.date_administered)}</p>
      <p class="date">Administered by: ${schedule.doctor_name || "N/A"}</p>
    `;

    vaccineHistoryContainer.appendChild(card);
  });
}

})
.catch(err => {
  console.error("Error fetching vaccination history:", err);
  vaccineHistoryContainer.innerHTML = `<p>Error loading vaccination history.</p>`;
})
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
