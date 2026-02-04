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

//SCROLL EFFECT IN BREASTFEEDING FILE
const header = document.getElementById('myHeader');
const scrollThreshold = 50; 

function handleScroll() {
    if (window.scrollY > scrollThreshold) {
        // Add the new class
        header.classList.add('header-scrolled');
    } else {
        // Remove the class
        header.classList.remove('header-scrolled');
    }
}

window.addEventListener('scroll', handleScroll);

//BACK TO TOP BUTTON BREASTFEEDING 

const backToTopBtn = document.getElementById('backToTopBtn');

const scrollVisibilityThreshold = 300; 

function toggleBackToTopButton() {
    if (window.scrollY > scrollVisibilityThreshold) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' 
    });
}

window.addEventListener('scroll', toggleBackToTopButton);

backToTopBtn.addEventListener('click', function(e) {
    e.preventDefault(); 
    scrollToTop();
});

document.addEventListener('DOMContentLoaded', toggleBackToTopButton);