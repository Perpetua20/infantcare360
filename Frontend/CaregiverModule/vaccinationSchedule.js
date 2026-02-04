
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

   
    menuItems.forEach(i => {
      if (i !== item) i.classList.remove("open");
    });


    item.classList.toggle("open");
  });
});


//====================NAVIGATION SLIDER=========================
const menuBtn = document.querySelector('.logo-part i');
const navigation = document.querySelector('.features');
const logOutBtn = document.querySelector(' .dashboardLogOut');

function toggleNavigation(){
    if(menuBtn.classList.contains('fa-bars')){
        menuBtn.classList.remove('fa-bars');
        menuBtn.classList.add('fa-xmark');
        navigation.style.left = "0";
        logOutBtn.style.left = "50%";      
    } else {
        menuBtn.classList.add('fa-bars');
        menuBtn.classList.remove('fa-xmark');
        navigation.style.left = "-100%";
        logOutBtn.style.left = "-50%";  
    }
}

menuBtn.addEventListener("click", toggleNavigation);

// ==================== VACCINATION SCHEDULE =========================
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first.");
    window.location.href = "../LoginPages/caregiverLogin.html";
    return;
  }

  const scheduleContainer = document.getElementById("vaccineSchedule");

  // Convert age in weeks → readable label
  function formatAgeLabel(weeks) {
    weeks = Number(weeks);
    if (weeks === 0) return "At Birth";
    if (weeks < 39) return `${weeks} Weeks`;
    const months = Math.round(weeks / 4.33);
    return `${months} Months`;
  }

  // Compute next vaccination date 
  function calculateVaccineDate(dobString, weeks) {
    let dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
      const clean = dobString.split("T")[0];
      const parts = clean.split("-");
      if (parts.length === 3) dob = new Date(parts[0], parts[1] - 1, parts[2]);
      else return "Invalid Date";
    }

    const nextDate = new Date(dob);
    if (weeks < 39) {
      nextDate.setDate(nextDate.getDate() + weeks * 7); // week-based
    } else {
      const months = Math.round(weeks / 4.33);
      nextDate.setMonth(nextDate.getMonth() + months);   // month-based
    }

    return nextDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  try {
    const response = await fetch("http://localhost:5000/api/caregiver/vaccination/schedule", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });

    const data = await response.json();

    if (!data.success || !data.vaccines || data.vaccines.length === 0) {
      scheduleContainer.innerHTML = `<p>No vaccination schedule available for this infant.</p>`;
      return;
    }

const infantNameElement = document.getElementById("infantName");
if (data.infant.full_name && infantNameElement) {
  infantNameElement.textContent = data.infant.full_name;
}
    const infantDob = data.infant.date_of_birth;

// -------------------- SHOW NEXT DOSE SUMMARY --------------------
const vaccines = data.vaccines;

if (vaccines.length > 0) {
  const nextVaccine = vaccines[0]; // The nearest upcoming vaccine
  const nextDoseDiv = document.getElementById("nextDoseInfo");

  
  const [year, month, day] = nextVaccine.recommended_date.split("-").map(Number);
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

  let dueText = "";
  if (daysRemaining > 0) {
    dueText = `${daysRemaining} days`;
  } else if (daysRemaining === 0) {
    dueText = "Due today!";
  }

  if (nextDoseDiv) {
    nextDoseDiv.innerHTML = `
      <h4>Next Doses</h4>
      <p><span>Schedule: </span>Week ${nextVaccine.recommended_age_weeks} vaccines</p>
      <p><span>Scheduled Date: </span>${formattedDate}</p>
      <p><span>Due in: </span>${dueText}</p>
    `;
  }
} else {
  const nextDoseDiv = document.getElementById("nextDoseInfo");
  if (nextDoseDiv) {
    nextDoseDiv.innerHTML = `
      <h4>Next Doses</h4>
      <p>No upcoming vaccinations at the moment.</p>
    `;
  }
}
// -------------------- SHOW LAST DOSE SUMMARY --------------------
const lastDoseDiv = document.getElementById("lastDoseInfo");

if (lastDoseDiv) {
  const lastVaccine = data.lastDose; 

  if (lastVaccine) {
    const administeredDate = new Date(lastVaccine.date_administered);
    const formattedDate = administeredDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    lastDoseDiv.innerHTML = `
      <div class="text">
        <h4>Last Received Dose</h4>
        <p><span>Schedule:</span> Week ${lastVaccine.recommended_age_weeks} vaccines</p>
        <p><span>Given On: </span>${formattedDate}</p>
        <p><span>Given By: </span>${lastVaccine.doctor_name || 'Unknown'}</p>
      </div>
    `;
  } else {
    lastDoseDiv.innerHTML = `
      <div class="text">
        <h4>Last Received Dose</h4>
        <p>No vaccines have been administered or recorded yet.</p>
      </div>
    `;
  }
}

const overDueDiv = document.getElementById("overDueInfo");

if (overDueDiv) {
  overDueDiv.innerHTML = "";

  if (data.overDue && data.overDue.length > 0) {
    const overdueCards = data.overDue.map(group => {
      const [year, month, day] = group.recommended_date.split("-").map(Number);
      const scheduledDate = new Date(year, month - 1, day);

      const todayMid = new Date();
      todayMid.setHours(0, 0, 0, 0);

      const diffTime = todayMid - scheduledDate;
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


      return `
        <div class="text">
          <h4>Overdue Doses</h4>
          <p><strong>Schedule:</strong> Week ${group.recommended_age_weeks} vaccines</p>
          <p><strong>Scheduled Date:</strong> (${daysOverdue} days ago)</p>
          <p class="alert">Contact your doctor immediately</p>
        </div>
      `;
    }).join("");

    overDueDiv.innerHTML = overdueCards;
  } else {
    overDueDiv.innerHTML = `
      <div class="text">
        <h4>Overdue Doses</h4>
        <p>No overdue vaccines at the moment.</p>
      </div>
    `;
  }
}

const groupedVaccines = {};
data.vaccines.forEach(vaccine => {
      const age = vaccine.recommended_age_weeks;
      if (!groupedVaccines[age]) groupedVaccines[age] = [];
      groupedVaccines[age].push(vaccine);
});

    const sortedAges = Object.keys(groupedVaccines).sort((a, b) => a - b);
    scheduleContainer.innerHTML = "";

    const todayStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });


    sortedAges.forEach(age => {
      const vaccines = groupedVaccines[age];
      const ageLabel = formatAgeLabel(age);
      const vaccineList = vaccines.map(v => v.vaccine_name).join("<br>");
      const description = vaccines[0].description ? `<p>${vaccines[0].description}</p>` : "";
      const recommendedDate = calculateVaccineDate(infantDob, age);

      const card = document.createElement("div");
      card.classList.add("card");

      if (recommendedDate === todayStr) {
        card.style.border = "2px solid #28a745";
        card.style.backgroundColor = "#e6ffed";
      }

      card.innerHTML = `
        <h4>${ageLabel}</h4>
        <p><strong>Vaccines:</strong> <br> ${vaccineList}</p>
        ${description}
        <p class="date"><strong>Recommended Date:</strong> ${recommendedDate}</p>
      `;

      scheduleContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching vaccination schedule:", error);
    alert("Failed to load vaccination schedule. Please try again later.");
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