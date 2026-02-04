const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const passwordError = document.getElementById("passwordError");
const passwordMatch = document.getElementById("passwordMatch");
const serverError = document.getElementById("serverError");

//  Real-time password matching feedback (unchanged)
confirmPassword.addEventListener("input", () => {
  if (confirmPassword.value === "") {
    passwordError.style.display = "none";
    passwordMatch.style.display = "none";
    return;
  }

  if (confirmPassword.value !== password.value) {
    passwordError.style.display = "block";
    passwordMatch.style.display = "none";
  } else {
    passwordError.style.display = "none";
    passwordMatch.style.display = "block";
  }
});

//  Handle form submission
document.getElementById("caregiverRegisterForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  serverError.style.display = "none";
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const inviteCode = document.getElementById("inviteCode").value.trim();
  const pwd = password.value;
  const confirmPwd = confirmPassword.value;

  if (pwd !== confirmPwd) {
    passwordError.style.display = "block";
    passwordMatch.style.display = "none";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/caregiver/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, inviteCode, password: pwd })
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        text: "You can now log in to your account.",
        confirmButtonText: "Continue",
      }).then(() => {
        window.location.href = "../LoginPages/caregiverLogin.html";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: data.message || "Registration failed. Please check your invite code and try again.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "Something went wrong. Please try again later.",
    });
  }
});
