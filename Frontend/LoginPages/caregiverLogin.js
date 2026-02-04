document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const spinner = document.getElementById("spinnerOverlay");
  const errorMsg = document.getElementById("errorMessage");

  //  Step 1: Capture consultation ID (if any)
  const urlParams = new URLSearchParams(window.location.search);
  const consultationId = urlParams.get("consultation");
  if (consultationId) {
    localStorage.setItem("redirectConsultationId", consultationId);
  }

  //  Step 2: Handle login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Clear error message
    errorMsg.textContent = "";
    errorMsg.style.display = "none";

    // Basic validation
    if (!email || !password) {
      errorMsg.textContent = "Please enter both email and password.";
      errorMsg.style.display = "block";
      return;
    }

    try {
      spinner.classList.add("active"); 

      const response = await fetch("http://localhost:5000/api/caregiver/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        //  Save token and caregiver info
        localStorage.setItem("token", data.token);

        const caregiver = data.caregiver || data;
        localStorage.setItem(
          "user",
          JSON.stringify({
            caregiver_id: caregiver.caregiver_id,
            full_name: caregiver.full_name,
            email: caregiver.email,
          })
        );

        //  Step 3: Redirect logic
        const redirectId = localStorage.getItem("redirectConsultationId");
        if (redirectId) {
          // Telehealth redirect
          window.location.href = `/Frontend/CaregiverModule/telehealthModule.html?consultation=${redirectId}`;
        } else {
          // Normal dashboard flow
          window.location.href = "../CaregiverModule/caregiverDashboard.html";
        }

      } else {
        // Login failed → show appropriate message
        if (data.message?.includes("not found")) {
          errorMsg.textContent = "No account found with this email.";
        } else if (data.message?.includes("Incorrect password")) {
          errorMsg.textContent = "Wrong password. Please try again.";
        } else {
          errorMsg.textContent = data.message || "Invalid email or password.";
        }
        errorMsg.style.display = "block";
      }

    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Server error. Please try again later.";
      errorMsg.style.display = "block";
    } finally {
      spinner.classList.remove("active"); 
    }
  });
});
