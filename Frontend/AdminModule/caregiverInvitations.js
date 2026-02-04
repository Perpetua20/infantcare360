document.addEventListener('DOMContentLoaded', function() {
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            window.location.href = 'caregiverInvitations.html';
        });
    }
});

let currentPage = 1;
let currentSearch = "";

// ---------------- HELPER FUNCTION FOR FETCH ---------------- //
async function apiFetch(url, options = {}) {
    let token = localStorage.getItem("token");
    if (!token) {
        Swal.fire("Access Denied", "You must be logged in.", "error");
        window.location.replace('../LoginPages/staffLogin.html');
        return null;
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    let response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) {
        // Token expired, try refreshing
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            localStorage.clear();
            window.location.replace('../LoginPages/staffLogin.html');
            return null;
        }

        // Call refresh token endpoint
        const refreshRes = await fetch('http://localhost:5000/api/refresh-token', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshToken })
        });

        const refreshData = await refreshRes.json();
        if (!refreshRes.ok) {
            localStorage.clear();
            window.location.replace('../LoginPages/staffLogin.html');
            return null;
        }

        // Save new token and retry original request
        localStorage.setItem("token", refreshData.token);
        options.headers.Authorization = `Bearer ${refreshData.token}`;
        response = await fetch(url, options);
    }

    return response;
}

// ---------------- FETCH INVITATIONS ---------------- //
async function fetchInvitations(page = 1, search = "") {
    try {
        const res = await apiFetch(`http://localhost:5000/api/admin/caregiver-invitations?page=${page}&search=${search}`);
        if (!res) return;

        const data = await res.json();
        const tableBody = document.getElementById("invitationTableBody");
        tableBody.innerHTML = "";

        if (!res.ok || !data.success) {
            tableBody.innerHTML = `<tr><td colspan="9">${data.message || "Failed to fetch invitations."}</td></tr>`; 
            Swal.fire("Error", data.message || "Failed to fetch invitations.", "error");
            return;
        }

        if (data.invitations.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='9'>No invitations found.</td></tr>"; 
            return;
        }

        let idCounter = 1;

        data.invitations.forEach((invite) => {
            const row = `
                <tr>
                    <td>${idCounter++}</td>
                    <td>${invite.caregiver_name || 'N/A'}</td>
                    <td>${invite.caregiver_email || 'N/A'}</td>
                    <td>${invite.infant_name || 'N/A'}</td>
                    <td>${invite.invitation_code || 'N/A'}</td>
                    <td>${new Date(invite.date_sent).toLocaleDateString()}</td>
                    <td>${new Date(invite.expiry_date).toLocaleDateString()}</td>
                    <td>${invite.status || 'N/A'}</td>
                    <td class="actions">
                        <button class="resendBtn" data-email="${invite.caregiver_email}">Resend</button>
                        <button class="cancelBtn" data-inviteid="${invite.id}" data-email="${invite.caregiver_email}">Cancel</button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        document.getElementById("prevBtn").disabled = page <= 1;
        document.getElementById("nextBtn").disabled = page >= data.pagination.totalPages;
        document.getElementById("pageInfo").textContent = 
            `Page ${data.pagination.currentPage} of ${data.pagination.totalPages} | Total Invitations: ${data.pagination.totalInvitations}`;

    } catch (error) {
        console.error("Error fetching invitations:", error);
        Swal.fire("Server Error", "Could not fetch invitations. Please try again later.", "error");
    }
}

// ---------------- DOM CONTENT LOADED ---------------- //
document.addEventListener("DOMContentLoaded", () => {
    fetchInvitations(currentPage);

    // Pagination buttons
    document.getElementById("prevBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchInvitations(currentPage, currentSearch);
        }
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        currentPage++;
        fetchInvitations(currentPage, currentSearch);
    });

    // Search
    const searchInput = document.getElementById("searchInput");
    document.getElementById("searchBtn").addEventListener("click", () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        fetchInvitations(currentPage, currentSearch);
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            fetchInvitations(currentPage, currentSearch);
        }
    });

    // ---------------- TABLE ACTIONS ---------------- //
    const tableBody = document.getElementById("invitationTableBody");
    tableBody.addEventListener("click", async (e) => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Access Denied", "You must be logged in to perform this action.", "error");
            return;
        }

        // ---------------- RESEND INVITATION ---------------- //
        if (e.target.classList.contains("resendBtn")) {
            const caregiver_email = e.target.dataset.email;
            if (!caregiver_email) {
                Swal.fire("Error", "Caregiver email not found.", "error");
                return;
            }

            try {
                const res = await apiFetch("http://localhost:5000/api/admin/caregiver-invite/resend", {
                    method: "POST",
                    body: JSON.stringify({ caregiver_email })
                });
                if (!res) return;

                const data = await res.json();
                if (res.ok && data.success) {
                    Swal.fire("✅ Invitation Resent", `Invitation resent to ${caregiver_email}`, "success");
                    fetchInvitations(currentPage, currentSearch);
                } else {
                    Swal.fire("⚠️ Unable to Resend", data.message || "Cannot resend invitation.", "warning");
                }

            } catch (err) {
                console.error("Error resending invitation:", err);
                Swal.fire("Server Error", "Please try again later.", "error");
            }
        }

        // ---------------- CANCEL INVITATION ---------------- //
        if (e.target.classList.contains("cancelBtn")) {
            const inviteId = e.target.dataset.inviteid;
            const caregiver_email = e.target.dataset.email;

            if (!inviteId) {
                Swal.fire("Error", "Invitation ID missing.", "error");
                return;
            }

            Swal.fire({
                title: "Cancel Invitation?",
                text: `This will cancel the invitation for ${caregiver_email}.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, cancel it",
                cancelButtonText: "No",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const res = await apiFetch(`http://localhost:5000/api/admin/caregiver-invite/cancel/${inviteId}`, {
                            method: "PUT"
                        });
                        if (!res) return;

                        const data = await res.json();
                        if (res.ok && data.success) {
                            Swal.fire("✅ Cancelled", `Invitation for ${caregiver_email} cancelled successfully.`, "success");
                            fetchInvitations(currentPage, currentSearch);
                        } else {
                            Swal.fire("Error", data.message || "Failed to cancel invitation.", "error");
                        }

                    } catch (err) {
                        console.error("Error cancelling invitation:", err);
                        Swal.fire("Server Error", "Please try again later.", "error");
                    }
                }
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtns = document.querySelectorAll(".logoutBtn");

  function logout() {
    Swal.fire({
      text: "Are you sure you want to leave the page?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      customClass: { popup: "swal-custom-zindex" },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.href = "../LandingPage/index.html";
      }
    });
  }

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", logout);
  });
});
