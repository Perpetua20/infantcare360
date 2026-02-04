// ====================== ELEMENTS ======================
const searchBtn = document.getElementById("searchInfantBtn");
const showFormBtn = document.getElementById("showVaccineFormBtn");
const recordForm = document.getElementById("recordVaccineForm");
const closeModal = document.getElementById("closeModal");
const scheduleSelect = document.getElementById("vaccineSchedule");
const vaccineSelect = document.getElementById("vaccineSelect");
const dateInput = document.getElementById("dateAdministered");

let currentInfantId = null;
let currentScheduleId = null;
let overdueQueue = [];
let currentOverdueIndex = 0;
let overdueVaccinesData = {};
let allSchedulesData = {};
let currentPopup = false;

const API_BASE = "http://localhost:5000/api/doctors";

// ====================== TOKEN MONITOR ======================
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

// ====================== DATE UTIL ======================
function setMaxDate() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  dateInput.max = today;
  if (dateInput.type !== "date") dateInput.type = "date";
  return today;
}

// Prevent future dates
dateInput.addEventListener("input", () => {
  const chosen = new Date(dateInput.value);
  const today = new Date();
  chosen.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (chosen > today) {
    Swal.fire("Error", "Date cannot be in the future.", "error");
    dateInput.value = setMaxDate();
  }
});

// ====================== DISPLAY UPCOMING VACCINES ======================
function displayUpcomingVaccines(upcomingVaccines) {
  const container = document.querySelector("#upcomingVaccinesTable .vaccines");
  container.innerHTML = "";

  if (!upcomingVaccines || upcomingVaccines.length === 0) {
    container.innerHTML = "<p>No upcoming vaccines.</p>";
    return;
  }

  const schedule = upcomingVaccines[0].recommended_age_weeks;
  const readable =
    schedule === 39
      ? "9 Months"
      : schedule === 52
      ? "12 Months"
      : schedule === 0
      ? "At Birth"
      : `${schedule} Weeks`;

  const dueDate = new Date(upcomingVaccines[0].due_date).toLocaleDateString();
  const vaccineNames = upcomingVaccines.map((v) => v.vaccine_name).join(", ");

  container.innerHTML = `
    <p><strong><span>Schedule :</span></strong> ${readable}</p>
    <p><strong><span>Vaccines :</span></strong> ${vaccineNames}</p>
    <p><strong><span>Recommended Date :</span></strong> ${dueDate}</p>
  `;
}

// ====================== DISPLAY OVERDUE VACCINES ======================
function displayOverdueVaccines(overdueVaccines) {
  const container = document.querySelector("#overdueVaccinesTable .vaccines");
  container.innerHTML = "";

  if (!overdueVaccines || Object.keys(overdueVaccines).length === 0) {
    container.innerHTML = "<p>No overdue vaccines.</p>";
    return;
  }

  overdueVaccinesData = overdueVaccines;
  overdueQueue = Object.keys(overdueVaccines).sort((a, b) =>
    a.localeCompare(b)
  );
  currentOverdueIndex = 0;

  function renderOverdueCard(index) {
    container.innerHTML = "";

    const schedule = overdueQueue[index];
    const vaccines = overdueVaccines[schedule];
    const dueDate = new Date(vaccines[0].due_date).toLocaleDateString();
    const vaccineNames = vaccines.map((v) => v.vaccine_name).join(", ");

    const card = document.createElement("div");
    card.className = "vaccine-card overdue";
    card.innerHTML = `
      <p><strong><span>Schedule :</span></strong> ${schedule}</p>
      <p><strong><span>Vaccines :</span></strong> ${vaccineNames}</p>
      <p><strong><span>Was Due :</span></strong> ${dueDate}</p>
    `;
    container.appendChild(card);

    if (overdueQueue.length > 1) {
      const navDiv = document.createElement("div");
      navDiv.className = "overdue-nav";
      navDiv.style.textAlign = "center";
      navDiv.style.marginTop = "10px";

      overdueQueue.forEach((s, i) => {
        const radio = document.createElement("span");
        radio.className = "overdue-dot";
        radio.style.display = "inline-block";
        radio.style.width = "12px";
        radio.style.height = "12px";
        radio.style.borderRadius = "50%";
        radio.style.margin = "0 5px";
        radio.style.cursor = "pointer";
        radio.style.backgroundColor = i === index ? "#3085d6" : "#ccc";
        radio.title = s;

        radio.addEventListener("click", () => {
          currentOverdueIndex = i;
          renderOverdueCard(i);
        });

        navDiv.appendChild(radio);
      });

      container.appendChild(navDiv);
    }
  }

  renderOverdueCard(currentOverdueIndex);
}

// ====================== DISPLAY PAST VACCINES ======================
let pastPage = 1;
const pageSize = 3;
let pastVaccinePages = [];

function displayPastVaccines(pastVaccines) {
  const tbody = document.getElementById("pastVaccinesBody");
  tbody.innerHTML = "";

  if (!pastVaccines || Object.keys(pastVaccines).length === 0) {
    tbody.innerHTML = `<tr><td colspan="3">No past vaccines recorded.</td></tr>`;
    return;
  }

  const schedules = Object.keys(pastVaccines);
  pastVaccinePages = [];
  for (let i = 0; i < schedules.length; i += pageSize) {
    pastVaccinePages.push(schedules.slice(i, i + pageSize));
  }

  renderPastPage(pastPage, pastVaccines);
}

function renderPastPage(page, pastVaccines) {
  const tbody = document.getElementById("pastVaccinesBody");
  tbody.innerHTML = "";
  const schedules = pastVaccinePages[page - 1];

  schedules.forEach((schedule) => {
    const vaccines = pastVaccines[schedule];
    const date = vaccines[0]?.date
      ? new Date(vaccines[0].date).toLocaleDateString()
      : "";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${schedule}</td>
      <td>${vaccines.map((v) => `<li>${v.name}</li>`).join("")}</td>
      <td>${date}</td>
    `;
    tbody.appendChild(row);
  });

  const paginationRow = document.createElement("tr");
  paginationRow.innerHTML = `
    <td colspan="3" style="text-align:center;">
      ${page > 1 ? `<button id="prevPage">Prev</button>` : ""}
      Page ${page} of ${pastVaccinePages.length}
      ${page < pastVaccinePages.length ? `<button id="nextPage">Next</button>` : ""}
    </td>
  `;
  tbody.appendChild(paginationRow);

  if (document.getElementById("prevPage"))
    document.getElementById("prevPage").addEventListener("click", () => {
      pastPage--;
      renderPastPage(pastPage, pastVaccines);
    });
  if (document.getElementById("nextPage"))
    document.getElementById("nextPage").addEventListener("click", () => {
      pastPage++;
      renderPastPage(pastPage, pastVaccines);
    });
}

// ====================== SEARCH INFANT ======================
document.getElementById("infantDOBInput").max = setMaxDate();

searchBtn.addEventListener("click", async () => {
  const name = document.getElementById("infantNameInput").value.trim();
  const dob = document.getElementById("infantDOBInput").value;
  const caregiver = document.getElementById("caregiverInput").value.trim();

  if (!name || !dob || !caregiver)
    return Swal.fire("Error", "Please fill in all fields.", "error");

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API_BASE}/searchInfant?name=${encodeURIComponent(name)}&dob=${dob}&caregiver=${encodeURIComponent(caregiver)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg = data?.message || "Infant not found or not assigned to you";
      return Swal.fire("Not Found", msg, "warning");
    }

    const data = await res.json();
    currentInfantId = data.infant.id;
    allSchedulesData = data.allSchedules || {};

    document.getElementById("infantIdentificationForm").style.display = "none";
    document.getElementById("infantSummary").textContent = `${data.infant.name} (Caregiver: ${data.infant.caregiver_name})`;
    document.getElementById("infantSummary").style.display = "block";
    document.getElementById("upcomingVaccinesTable").style.display = "block";
    document.getElementById("pastVaccinesTable").style.display = "block";
    document.getElementById("overdueVaccinesTable").style.display = "block";
    showFormBtn.style.display = "inline-block";

    displayUpcomingVaccines(data.upcomingVaccines);
    displayPastVaccines(data.pastVaccines);
    displayOverdueVaccines(data.overdueVaccines);

    if (data.needsOverduePrompt && Object.keys(data.overdueVaccines).length > 0) {
      Swal.fire({
        title: "Overdue Vaccines Detected",
        text: "This infant has overdue vaccines. Would you like to record them now?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Record Now",
        cancelButtonText: "Later",
      }).then((result) => {
        if (result.isConfirmed) {
          recordForm.style.display = "flex";
          currentPopup = true;

          const schedulesList = Object.keys(data.overdueVaccines);
          scheduleSelect.innerHTML = `
            <option value="">-- Select Schedule --</option>
            ${schedulesList.map((s) => `<option value="${s}">${s}</option>`).join("")}
          `;
          vaccineSelect.innerHTML = "";
          setMaxDate();

          if (schedulesList.length > 0) {
            scheduleSelect.value = schedulesList[0];
            scheduleSelect.dispatchEvent(new Event("change"));
          }
        }
      });
    }
  } catch (err) {
    Swal.fire("Error", err.message || "Infant not found.", "warning");
  }
});

// ====================== SCHEDULE CHANGE ======================
scheduleSelect.addEventListener("change", () => {
  const selectedSchedule = scheduleSelect.value;
  vaccineSelect.innerHTML = "";
  if (!selectedSchedule) return;

  // Choose vaccine data source
  const vaccines =
    overdueVaccinesData[selectedSchedule] ||
    allSchedulesData[selectedSchedule] ||
    [];

  // Populate vaccine dropdown
  vaccines.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.schedule_id;
    opt.textContent = v.vaccine_name;
    opt.selected = true;
    vaccineSelect.appendChild(opt);
  });

  if (vaccines.length > 0) {
    const dueDateObj = new Date(vaccines[0].due_date);
    dueDateObj.setHours(0, 0, 0, 0); 

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let minDate;
    if (overdueVaccinesData[selectedSchedule]) {
      
      minDate = dueDateObj;
    } else {
      
      minDate = dueDateObj > today ? dueDateObj : today;
    }

    const minStr = minDate.toISOString().split("T")[0];
    const maxStr = today.toISOString().split("T")[0];

    // Apply min and max
    dateInput.min = minStr;
    dateInput.max = maxStr;

    // Default value
    dateInput.value = minStr;

    // Overdue info popup
    if (overdueVaccinesData[selectedSchedule]) {
      Swal.fire({
        title: "Overdue Vaccine",
        text: `You can only record from ${dueDateObj.toLocaleDateString()} onward.`,
        icon: "info",
      });
    }
  } else {
    // No vaccines: reset date picker
    dateInput.removeAttribute("min");
    setMaxDate();
  }
});

// ====================== DATE INPUT VALIDATION ======================
dateInput.addEventListener("input", () => {
  const chosen = new Date(dateInput.value);
  const min = dateInput.min ? new Date(dateInput.min) : null;
  const max = dateInput.max ? new Date(dateInput.max) : null;

  chosen.setHours(0, 0, 0, 0);
  if (min && chosen < min) {
    Swal.fire("Error", `Date cannot be before ${min.toLocaleDateString()}.`, "error");
    dateInput.value = min.toISOString().split("T")[0];
  } else if (max && chosen > max) {
    Swal.fire("Error", "Date cannot be in the future.", "error");
    dateInput.value = max.toISOString().split("T")[0];
  }
});

// ====================== SUBMIT VACCINE ======================
document.getElementById("submitVaccine").addEventListener("click", async () => {
  const selectedVaccines = [...vaccineSelect.selectedOptions].map((opt) =>
    parseInt(opt.value)
  );
  const dateAdministered = dateInput.value;

  if (!selectedVaccines.length || !dateAdministered)
    return Swal.fire("Error", "Please fill in all fields.", "error");

  // Parse administered date as local date
  const [year, month, day] = dateAdministered.split("-");
  const chosenDate = new Date(year, month - 1, day);
  chosenDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (chosenDate > today)
    return Swal.fire("Error", "Date cannot be in the future.", "error");

  const selectedSchedule = scheduleSelect.value;
  const selectedVaccinesData =
    overdueVaccinesData[selectedSchedule] ||
    allSchedulesData[selectedSchedule] ||
    [];

  //  SINGLE due date validation — skip for overdue schedules
  if (!overdueVaccinesData[selectedSchedule] && selectedVaccinesData.length > 0 && selectedVaccinesData[0].due_date) {
    const [y, m, d] = selectedVaccinesData[0].due_date.split("-");
    const dueDate = new Date(y, m - 1, d); 
    dueDate.setHours(0, 0, 0, 0);

    if (chosenDate < dueDate) {
      return Swal.fire(
        "Error",
        `This vaccine’s recommended date (${dueDate.toLocaleDateString()}) has not yet reached.`,
        "error"
      );
    }
  }


  const token = localStorage.getItem("token");
  let recordedCount = 0;
  let duplicateCount = 0;
  let errorMessages = [];

  try {
    for (const id of selectedVaccines) {
      const res = await fetch(`${API_BASE}/recordVaccine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          infantId: currentInfantId,
          scheduleId: id,
          dateAdministered,
          status: "completed",
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        errorMessages.push(data?.message || `Failed to record schedule ${id}`);
        continue;
      }

      const msgText = (data?.message || "").toLowerCase();
      if (msgText.includes("already recorded")) {
        duplicateCount++;
        continue;
      }

      recordedCount++;
    }

    errorMessages = [...new Set(errorMessages)];

    if (recordedCount > 0)
      Swal.fire("Success", `${recordedCount} vaccine(s) recorded.`, "success");
    else if (duplicateCount > 0)
      Swal.fire("Info", "Vaccine already recorded.", "info");
    else if (errorMessages.length > 0)
      Swal.fire("Error", errorMessages.join("<br>"), "error");

    if (recordedCount > 0) {
      recordForm.style.display = "none";
      await searchBtn.click();
    }
  } catch (err) {
    Swal.fire("Error", err.message || "Network error.", "error");
  }
});

// ====================== FORM CONTROLS ======================
showFormBtn.addEventListener("click", () => {
  recordForm.style.display = "flex";
  currentPopup = false;

  const schedules = Object.keys(allSchedulesData);
  scheduleSelect.innerHTML = `
    <option value="">-- Select Schedule --</option>
    ${schedules.map((s) => `<option value="${s}">${s}</option>`).join("")}
  `;
  vaccineSelect.innerHTML = "";
  setMaxDate();
});

closeModal.addEventListener("click", () => {
  recordForm.style.display = "none";
  currentPopup = false;
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