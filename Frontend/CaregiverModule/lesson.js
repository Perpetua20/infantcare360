// ================== DOM ELEMENTS ==================
const lessonTitle = document.getElementById('lesson-title');
const lessonSubtitle = document.getElementById('lesson-subtitle');
const lessonImageDiv = document.querySelector('.image');
const lessonText = document.getElementById('lesson-text');
const videoContainer = document.getElementById('lesson-videos');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const topicsBtn = document.getElementById('topics-btn'); 

// ================== GET URL PARAMS ==================
const urlParams = new URLSearchParams(window.location.search);
const topicId = parseInt(urlParams.get('topic'), 10) || 1; 
let subtopicId = parseInt(urlParams.get('id'), 10) || null;

let subtopics = [];    // All subtopics for this topic
let currentIndex = 0;  // Current lesson index

// ================== FETCH SUBTOPICS ==================
fetch(`http://localhost:5000/api/caregiver/topics/${topicId}/subtopics`)
  .then(res => res.json())
  .then(data => {
    subtopics = data.subtopics;

    if (!subtopics || subtopics.length === 0) return;

    // Determine current lesson index from subtopicId
    if (subtopicId) {
      currentIndex = subtopics.findIndex(sub => sub.id === subtopicId);
      if (currentIndex === -1) currentIndex = 0;
    } else {
      currentIndex = 0;
    }

    // Update subtopicId
    subtopicId = subtopics[currentIndex].id;

    // Load initial lesson
    loadLesson(subtopicId);
    setupNavigation();
  })
  .catch(err => console.error('Error fetching subtopics:', err));

// ================== LOAD LESSON ==================
function loadLesson(id) {
  fadeOutElements([lessonTitle, lessonSubtitle, lessonText, videoContainer], 200)
    .then(() => {
      fetch(`http://localhost:5000/api/caregiver/lesson/${id}`)
        .then(res => res.json())
        .then(data => {
          const lesson = data.lesson;

          // Background image
          lessonImageDiv.style.backgroundImage = `
            linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
            url(${lesson.image || '/images/default_lesson.jpg'})
          `;
          lessonImageDiv.style.backgroundSize = 'cover';
          lessonImageDiv.style.backgroundPosition = 'center';
          lessonImageDiv.style.backgroundRepeat = 'no-repeat';
          lessonImageDiv.style.height = '380px';
          lessonImageDiv.style.width = '95%';
          lessonImageDiv.style.borderRadius = '8px';

          // Title & Subtitle
          lessonTitle.textContent = lesson.subtopic_name || 'Lesson';
          lessonSubtitle.textContent = lesson.subtitle || '';

          // Lesson content
          lessonText.innerHTML = lesson.content || '';

          // Videos
          videoContainer.innerHTML = "";
          if (lesson.videos && Array.isArray(lesson.videos)) {
            lesson.videos.forEach(url => {
              const videoEl = document.createElement('video');
              videoEl.src = url;
              videoEl.controls = true;
              videoEl.width = 600;
              videoEl.style.marginBottom = '10px';
              videoContainer.appendChild(videoEl);
            });
          }

          fadeInElements([lessonTitle, lessonSubtitle, lessonText, videoContainer], 500);
          updateNavigationButtons();
        })
        .catch(err => console.error('Error loading lesson:', err));
    });
}

// ================== FADE HELPERS ==================
function fadeOutElements(elements, duration = 200) {
  return new Promise(resolve => {
    elements.forEach(el => {
      el.style.transition = `opacity ${duration}ms`;
      el.style.opacity = 0;
    });
    setTimeout(resolve, duration);
  });
}

function fadeInElements(elements, duration = 500) {
  elements.forEach(el => {
    el.style.transition = `opacity ${duration}ms`;
    el.style.opacity = 1;
  });
}

// ================== NAVIGATION ==================
function setupNavigation() {
  // Back to Topics
  if (topicsBtn) {
    topicsBtn.style.display = "inline-block";
    topicsBtn.onclick = () => {
      window.location.href = `education.html?topic=${topicId}`; // Back to main topic
    };
  }

  // Previous Lesson
  if (backBtn) {
    backBtn.onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        subtopicId = subtopics[currentIndex].id;
        loadLesson(subtopicId);
      }
    };
  }

  // Next Lesson
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentIndex < subtopics.length - 1) {
        currentIndex++;
        subtopicId = subtopics[currentIndex].id;
        loadLesson(subtopicId);
      }
    };
  }
}

// ================== UPDATE NAV BUTTONS ==================
function updateNavigationButtons() {
  backBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
  nextBtn.style.display = currentIndex >= subtopics.length - 1 ? "none" : "inline-block";
  if (topicsBtn) topicsBtn.style.display = "inline-block";
}

// ================== OPTIONAL: START LEARNING SCROLL ==================
const startBtn = document.getElementById("start-btn");
const exploreSection = document.getElementById("explore-section");
if (startBtn && exploreSection) {
  startBtn.addEventListener("click", () => {
    exploreSection.scrollIntoView({ behavior: "smooth" });
  });
}

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