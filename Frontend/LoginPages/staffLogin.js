document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const spinner = document.getElementById("spinnerOverlay");
  const generalError = document.getElementById("errorMessage");
  const passwordError = document.getElementById("passwordError");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear messages
    generalError.textContent = "";
    generalError.style.display = "none";
    passwordError.textContent = "";
    passwordError.style.display = "none";

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Basic validation
    if (!role || !email || !password) {
      if (!role || !email) {
        generalError.textContent = "Administrator not found";
        generalError.style.display = "block";
      }
      if (!password) {
        passwordError.textContent = "Please enter your password";
        passwordError.style.display = "block";
      }
      return;
    }

    try {
      spinner?.classList.add("active");

      const res = await fetch("http://localhost:5000/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });

      const data = await res.json();

      // Handle errors
      if (!res.ok) {
        if (data.message?.toLowerCase().includes("password")) {
          passwordError.textContent = data.message;
          passwordError.style.display = "block";
        } else {
          generalError.textContent = data.message || "Administrator not found";
          generalError.style.display = "block";
        }
        return;
      }

      //  Store structured user info (like caregiver version)
      const userData = data.user || {};

      localStorage.setItem("token", data.token);

      // Structure stored user object based on role
      if (userData.role === "Doctor") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            doctor_id: userData.doctor_id || userData.id,
            full_name: userData.full_name,
            email: userData.email,
            role: "Doctor",
          })
        );
        window.location.href = "../DoctorModule/doctorDashboard.html";
      } else if (userData.role === "Administrator") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            admin_id: userData.admin_id || userData.id,
            full_name: userData.full_name,
            email: userData.email,
            role: "Administrator",
          })
        );
        window.location.href = "../AdminModule/adminDashboard.html";
      } else {
        generalError.textContent = "Unknown staff role. Contact admin.";
        generalError.style.display = "block";
      }
    } catch (err) {
      console.error("Login error:", err);
      generalError.textContent = "Server error. Please try again later.";
      generalError.style.display = "block";
    } finally {
      spinner?.classList.remove("active");
    }
  });
});

