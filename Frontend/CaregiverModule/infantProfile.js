document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please log in first.");
    window.location.href = "../LoginPages/caregiverLogin.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/caregiver/infant-profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Infant Profile Response:", data);

    if (data.success && data.infant) {
      const infant = data.infant;

      document.getElementById("full_name").value = infant.full_name || "";
      document.getElementById("date_of_birth").value = infant.date_of_birth ? infant.date_of_birth.split('T')[0] : "";
      document.getElementById("gender").value = infant.gender || "";
      document.getElementById("weight").value = infant.weight || "";
      document.getElementById("facility").value = infant.facility || "";
      document.getElementById("facility_contact").value = infant.facility_contact || "";
    } else {
      alert(data.message || "No infant details found.");
    }

  } catch (error) {
    console.error("Error fetching infant profile:", error);
    console.log("Response status:", response.status);
const data = await response.json().catch(() => null);
console.log("Response body:", data);
    alert("Failed to fetch infant details. Please try again later.");
  }
});
