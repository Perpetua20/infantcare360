
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

//================LOGOUT=============================
const logoutBtns = document.querySelectorAll(".logoutBtn");

function logout() {
  Swal.fire({
    text: "Are you sure you want to leave the page?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
      customClass: {
    popup: 'swal-custom-zindex'
  }
  }).then((result) => {
    if (result.isConfirmed) { // ✅ only redirect if user clicks "Yes"
      localStorage.removeItem("token");
      window.location.href = "../LandingPage/index.html";
    }
  });
}

logoutBtns.forEach(btn => {
  btn.addEventListener("click", logout);
});



document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../Login/caregiverLogin.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/caregiver/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
     console.log(data);

    if (response.ok && data.success) {
      // ✅ Update caregiver & infant info
      const caregiverNameElement = document.querySelector("#caregiverName");
      const infantNameElements = document.querySelectorAll("#infantName");
      const ageInfoElement = document.querySelector(".profile .info p:nth-of-type(2)");

      caregiverNameElement.textContent = `Hello ${data.caregiverName},`;

      infantNameElements.forEach(el => {
        el.textContent = data.infantName;
      });

      // ✅ Display infant age using backend-calculated value
      if (data.infantAge) {
        const { value, unit } = data.infantAge;
        ageInfoElement.textContent = `Age: ${value} ${unit}${value !== 1 ? "s" : ""}`;
      }

      // ✅ Update vaccination progress card
      const vaccineCard = document.querySelector(".vaccineTracking");
      if (vaccineCard) {
        const progressP = vaccineCard.querySelector("p:nth-of-type(1)");
        const nextVaccineP = vaccineCard.querySelector("p:nth-of-type(2)");

        progressP.textContent = `${data.vaccinationProgress}% of doses completed or recorded`;

            if (data.nextVaccineWeek) {
             nextVaccineP.innerHTML = `Upcoming - Week ${data.nextVaccineWeek} vaccine${data.nextVaccineWeek !== 1 ? "s" : ""}<br>Due on ${data.nextVaccineDate}`;

            } else {
              nextVaccineP.textContent = "All vaccines completed";
            }


        const barDiv = vaccineCard.querySelector(".bar");
        if (barDiv) barDiv.style.setProperty('--progress-width', `${data.vaccinationProgress}%`);

      }

    } else {
      console.error("Error fetching dashboard:", data.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
});

//==================== HERO IMAGE SLIDER =====================
const image = document.querySelector('.images');
const images = [
    '../Images/infantVaccination.png',
    '../Images/infantTelehealth.png',
    '../Images/infantEducationResources.png',
    '../Images/educationResources.png'
];
let currentIndex = 0;

function changeImage() {
    currentIndex = (currentIndex + 1) % images.length;
    image.style.backgroundImage = `url('${images[currentIndex]}')`;
}

image.style.backgroundImage = `url('${images[currentIndex]}')`;
setInterval(changeImage, 5000);

//==================== NAVIGATION SLIDER =====================
const menuBtn = document.querySelector('.logo-part i');
const navigation = document.querySelector('.features');
const logOutBtn = document.querySelector('.dashboardLogOut');

function toggleNavigation() {
    if (menuBtn.classList.contains('fa-bars')) {
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
