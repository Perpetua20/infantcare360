//=================NAVLINKS========================
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.custom-link');
  const navHeight = document.querySelector('.menu').offsetHeight;

  // Smooth scroll with offset
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); 

      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        const sectionTop = targetSection.offsetTop;
        window.scrollTo({
          top: sectionTop - navHeight - 20, 
          behavior: 'smooth'
        });
      }

      // Highlight clicked link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Scroll-based highlight
  function activateLink() {
    let currentSectionId = '';

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSectionId = section.id;
      }
    });

    if (!currentSectionId) currentSectionId = 'home';

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', activateLink);
  activateLink(); 
});
//==================MENU SCROLL============================

  window.addEventListener('scroll', function() {
    const menu = document.querySelector('.menu');
    if (window.scrollY > 50) { 
      menu.classList.add('scrolled');
    } else {
      menu.classList.remove('scrolled');
    }
  });



//================TYPING ANIMATION========================

const textElement = document.getElementById('typing-text');

const phrases = [
    "All in One Place",
    "Vaccine Tracking",
    "Educational Resources",
    "Telehealth Consultation"
];

// Configuration variables
const typingSpeed = 100;
const deletingSpeed = 50;
const pauseBeforeDelete = 2000;

let phraseIndex = 0;
let charIndex = 0;

function typeText() {
    const currentPhrase = phrases[phraseIndex];

    // **State 1: Typing**
    if (charIndex <= currentPhrase.length) {
        textElement.textContent = currentPhrase.substring(0, charIndex);
        charIndex++;
        setTimeout(typeText, typingSpeed);
    } 
    // **State 2: Pausing before Deleting**
    else if (charIndex > currentPhrase.length) {
        setTimeout(deleteText, pauseBeforeDelete);
    }
}

function deleteText() {
    const currentPhrase = phrases[phraseIndex];
    
    // **State 3: Deleting**
    if (charIndex >= 0) {
        textElement.textContent = currentPhrase.substring(0, charIndex);
        charIndex--;
        setTimeout(deleteText, deletingSpeed);
    } 
    // **State 4: Moving to the next phrase**
    else {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        charIndex = 0;
        setTimeout(typeText, typingSpeed);
    }
}

//====================HERO IMAGE SLIDER=========================

// Select the image element

const image = document.querySelector('.heroImage img');

// 1. Create an array of image paths
const images = [
    '../Images/baby.jpg',
    '../Images/mother&baby.jpg',
    '../Images/doctor&child2.png'
];

let currentIndex = 0;

function changeImage() {
    // 2. Increment the index and loop back to the start if it reaches the end
    currentIndex = (currentIndex + 1) % images.length;
    
    // 3. Set the image source using the current index
    image.src = images[currentIndex];
}

// 4. Set the initial image
image.src = images[currentIndex];



// Start the animation when the page loads
document.addEventListener("DOMContentLoaded", () => {
    setInterval(changeImage, 5000); 
    typeText();
});

//================SMALLER SCREENS NAVIGATION BAR=======================
const bar = document.querySelector('.logo i');

function displayLinks(){
    const nav = document.querySelector('nav');
    const loginSignUp = document.querySelector('.login-signup');

    if(bar.classList.contains('fa-bars')){
         bar.classList.remove('fa-bars');
         bar.classList.add('fa-xmark');
         nav.style.display = "flex";
         loginSignUp.style.display = "flex";
    }else{
        bar.classList.add('fa-bars');
        bar.classList.remove('fa-xmark');
        hideLinks();
    }

}

bar.addEventListener("click", displayLinks);

function hideLinks(){
    const nav = document.querySelector('nav');
    const loginSignUp = document.querySelector('.login-signup');
    nav.style.display = "none";
    loginSignUp.style.display = "none";
}

//================CHOOSE ROLE POP UP=======================

// Select triggers
const openTriggers = document.querySelectorAll('.open-role-modal');
const closeTriggers = document.querySelectorAll('.close-role-modal');

// Select modal and overlay
const roleModal = document.querySelector('.role-modal');
const overlay = document.querySelector('.modal-overlay');

// Open modal
function openRoleModal(e) {
  if (e) e.preventDefault(); 
  roleModal.classList.add('show');
  overlay.classList.add('show');
  document.body.classList.add('no-scroll'); 
}

// Close modal
function closeRoleModal() {
  roleModal.classList.remove('show');
  overlay.classList.remove('show');
  document.body.classList.remove('no-scroll'); 
}

// Attach open listeners
openTriggers.forEach(trigger => {
  trigger.addEventListener('click', openRoleModal);
});

// Attach close listeners with role-based redirect
closeTriggers.forEach(trigger => {
  trigger.addEventListener('click', function () {
    closeRoleModal();

    // Get button text and normalize it
    const role = trigger.textContent.trim().toLowerCase();

    // Redirect based on role
    if (role.includes('caregiver')) {
      window.location.href = '../LoginPages/caregiverLogin.html';
    } else if (role.includes('staff')) {
      window.location.href = '../LoginPages/staffLogin.html';
    }
  });
});

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeRoleModal();
  }
});