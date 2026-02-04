// =================== Get topicId from URL ===================
const params = new URLSearchParams(window.location.search);
const topicId = parseInt(params.get("topic"), 10) || 1;

// =================== Topic mapping ===================
const topicData = {
  1: { 
    title: "Begin Your Baby’s Breastfeeding Journey",
    intro: "Breastfeeding is a beautiful bond between mother and baby—a moment of closeness, love, and care that goes far beyond nourishment. It’s okay to learn as you go, ask questions, and grow more confident with each feeding.",
    cta: "Ready to begin your breastfeeding journey? Click below to start learning.",
    explore: "Explore Breastfeeding Topics"
  },
  2: { 
    title: "Start Your Baby’s Nutrition Journey",
    intro: "Feeding your baby is a journey full of love, care, and discovery. Every bite shapes their growth, health, and development. It’s natural to have questions along the way, and every parent finds their rhythm with time and patience.",
    cta: "Curious to learn how to nourish your little one? Click below to begin.",
    explore: "Explore Infant Nutrition Topics"
  },
  3: { 
    title: "Your Baby’s Hygiene & Care Guide",
    intro: "Caring for your baby’s hygiene is a daily act of love, comfort, and protection. From bathing to safe sleep, every small routine helps keep your little one clean, healthy, and happy. It’s normal to learn as you go, and every parent grows more confident with time and gentle practice.",
    cta: "Ready to discover the essentials of baby care? Click below to begin.",
    explore: "Explore Hygiene & Care Topics"
  },
  4: { 
    title: "Protecting Your Baby's Health",
    intro: "Keeping your baby healthy starts with simple daily care and smart prevention. From vaccinations to good hygiene and early symptom awareness, each step helps protect your little one and supports their growth and well-being.",
    cta: "Start protecting your baby today.",
    explore: "Explore Disease Prevention Topics"
  }
};

// =================== Set dynamic page content ===================
document.getElementById("page-title").textContent = topicData[topicId].title;
document.getElementById("intro-title").textContent = topicData[topicId].title;
document.getElementById("intro-text").textContent = topicData[topicId].intro;
document.getElementById("cta-text").textContent = topicData[topicId].cta;
document.getElementById("explore-heading").textContent = topicData[topicId].explore;

// =================== Fetch subtopics dynamically ===================
const container = document.getElementById("subtopics-container");
let subtopicsList = [];

fetch(`http://localhost:5000/api/caregiver/topics/${topicId}/subtopics`)
  .then(res => res.json())
  .then(data => {
    subtopicsList = data.subtopics;

    if (!subtopicsList || subtopicsList.length === 0) return;

    // Generate subtopic cards
    subtopicsList.forEach(subtopic => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${subtopic.image}" alt="${subtopic.title}" width="250">
        <h3>${subtopic.title}</h3>
        <p>${subtopic.summary}</p>
        <span>Quick read – ${subtopic.estimated_time}</span>
        <button onclick="location.href='lessons.html?topic=${topicId}&id=${subtopic.id}'">Start Lesson</button>
      `;
      container.appendChild(card);
    });

    // =================== Setup "Start Learning" button ===================
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const firstLessonId = subtopicsList[0].id;
        window.location.href = `lessons.html?topic=${topicId}&id=${firstLessonId}`;
      });
    }
  })
  .catch(err => console.error("Error fetching subtopics:", err));

  // ==================== SIDEBAR DROPDOWN MENU ====================
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
