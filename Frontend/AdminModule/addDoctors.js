document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addDoctorForm");
  const spinnerOverlay = document.getElementById("spinnerOverlay");
  const cancelButton = document.getElementById("cancelButton");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show spinner overlay
    spinnerOverlay.style.display = "flex";

    const doctorData = {
      full_name: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone_number: document.getElementById("phone").value.trim(),
      license: document.getElementById("license").value.trim(),
      consultation_fee: document.getElementById("fee").value.trim(),
      password: document.getElementById("password").value.trim(),
      account_status: document.getElementById("status").value.trim(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorData),
      });

      const result = await response.json();

      // Hide spinner
      spinnerOverlay.style.display = "none";

      if (response.ok) {
        // ✅ Success popup
        Swal.fire({
          title: "New Record Added!",
          text: result.message || "Doctor added successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6"
        });

        form.reset();
      } else {
        // ❌ Error popup
        Swal.fire({
          title: "Error!",
          text: result.message || "Failed to add doctor.",
          icon: "error",
          confirmButtonText: "Try Again",
          confirmButtonColor: "#d33"
        });
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      spinnerOverlay.style.display = "none";

      Swal.fire({
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  });

  cancelButton.addEventListener("click", () => {
    window.history.back();
  });
});
