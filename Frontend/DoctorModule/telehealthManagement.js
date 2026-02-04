// ====================== TAB SWITCHING ======================
const upcoming = document.querySelector('.upcomingMeeting');
const overdue = document.querySelector('.overdueMeeting');
const past = document.querySelector('.pastMeeting');
const pending = document.querySelector('.pendingMeeting');
const canceled = document.querySelector('.canceledMeeting');

const upcomingCon = document.querySelector('.upcomingCon');
const overdueCon = document.querySelector('.overdueCon');
const pastCon = document.querySelector('.pastCon');
const pendingCon = document.querySelector('.pendingCon');
const canceledCon = document.querySelector('.canceledCon');

upcomingCon.style.display = 'none';
overdueCon.style.display = 'none';
pastCon.style.display = 'none';
canceledCon.style.display = 'none';
pendingCon.style.display = 'block';

function setActiveLink(activeLink) {
  [upcoming,overdue, past, pending, canceled].forEach(link => {
    link.classList.remove('activeLink');
    link.style.backgroundColor = "white";
    link.style.color = "rgb(98, 98, 98)";
  });
  activeLink.classList.add('activeLink');
  activeLink.style.backgroundColor = "rgb(0, 0, 139)";
  activeLink.style.color = "rgb(225, 225, 225)";
}

function handleClick(event) {
  const clicked = event.target;
  if (clicked.classList.contains('upcomingMeeting')) {
    setActiveLink(upcoming);
    upcomingCon.style.display='block';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
     overdueCon.style.display='none';
  } 
  else if (clicked.classList.contains('pastMeeting')) {
    setActiveLink(past);
    upcomingCon.style.display='none';
    pastCon.style.display='block';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
     overdueCon.style.display='none';
  } 
  else if (clicked.classList.contains('pendingMeeting')) {
    setActiveLink(pending);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='block';
    canceledCon.style.display='none';
     overdueCon.style.display='none';
  } 
  else if (clicked.classList.contains('canceledMeeting')) {
    setActiveLink(canceled);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='block';
     overdueCon.style.display='none';
  }
   else if (clicked.classList.contains('overdueMeeting')) {
    setActiveLink(overdue);
    upcomingCon.style.display='none';
    pastCon.style.display='none';
    pendingCon.style.display='none';
    canceledCon.style.display='none';
    overdueCon.style.display='block';
  }
}
[upcoming,overdue, past, pending, canceled].forEach(link => link.addEventListener('click', handleClick));

// ====================== TOKEN & USER ======================
let doctorId, token, user;

document.addEventListener("DOMContentLoaded", async () => {
  token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  try { 
    user = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null; 
  } catch (err) { 
    console.error("Failed to parse user:", rawUser, err); 
    localStorage.removeItem("user"); 
    window.location.href = "../LoginPages/staffLogin.html"; 
    return; 
  }

  doctorId = user?.doctor_id;
  if (!token || !doctorId) { 
    Swal.fire({
      title:"Access Denied", 
      text:"Please login again.", 
      icon:"error", 
      confirmButtonText:"OK"
    }).then(()=>{
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href="../LoginPages/staffLogin.html";
    }); 
    return; 
  }

  // Token expiration
  function getTokenExpiration(token) { 
    try { 
      const payload = JSON.parse(atob(token.split(".")[1])); 
      return payload.exp ? payload.exp*1000 : null; 
    } catch { return null; } 
  }
  function redirectToLogin() { 
    Swal.fire({
      title:"Session Expired", 
      text:"Please login again.", 
      icon:"warning", 
      confirmButtonText:"Login"
    }).then(()=>{
      localStorage.removeItem("token"); 
      localStorage.removeItem("user"); 
      window.location.href="../LoginPages/staffLogin.html"; 
    }); 
  }
  function startTokenMonitor() { 
    const expTime = getTokenExpiration(token); 
    if(!expTime) return redirectToLogin(); 
    const interval = setInterval(()=>{
      if(Date.now()>=expTime){ 
        clearInterval(interval); 
        redirectToLogin(); 
      } 
    },5000); 
  }
  startTokenMonitor();

  // Show initial loading state
  [pendingContainer, upcomingContainer,overdueContainer, pastContainer, canceledContainer].forEach(c => {
    if(c) c.innerHTML = "<p>Loading consultations...</p>";
  });

  // Fetch consultations immediately on page load
  await fetchDoctorConsultations();

  // Start polling
  setInterval(fetchDoctorConsultations, 10000);
});

// ====================== API ======================
const API_BASE = 'http://localhost:5000/api/consultations';
const graceTimers = {};
const joinedOnce = new Set(); 

async function authFetch(url, opts={}) {
  opts.headers = Object.assign({'Authorization':`Bearer ${token}`, 'Content-Type':'application/json'}, opts.headers||{});
  const res = await fetch(url, opts);
  const contentType = res.headers.get('content-type')||'';

  if(!res.ok){ 
    if(contentType.includes('application/json')) { 
      const err = await res.json(); 
      throw new Error(err.message || JSON.stringify(err)); 
    } else { 
      const text = await res.text(); 
      throw new Error(`Server error: ${res.status} ${res.statusText} - ${text.substring(0,200)}`); 
    } 
  }
  return contentType.includes('application/json') ? res.json() : res.text();
}

// ====================== CONTAINERS ======================
const pendingContainer = document.querySelector('.pending');
const upcomingContainer = document.querySelector('.upcoming');
const overdueContainer = document.querySelector('.overdue');
const pastContainer = document.querySelector('.past');
const canceledContainer = document.querySelector('.canceled');

function empty(el){ if(el) el.innerHTML=''; }
function formatDate(dt){ try{ return new Date(dt).toLocaleString(); } catch{ return dt; } }
function escapeHtml(str){ if(!str) return ''; return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;"); }

// ====================== DISPLAY FUNCTIONS ======================
function updateOrCreateCard(container, consultation, type='upcoming') {

  let card = container.querySelector(`#consultation-${consultation.id}`);
  const innerHTML = getCardHTML(consultation, type);

  if(card){ 
    if(card.dataset.status !== consultation.status || card.innerHTML !== innerHTML){
      card.innerHTML = innerHTML;
      card.dataset.status = consultation.status;
      attachCardEvents(card, consultation, type);
    }
  } else { 
    card = document.createElement('div');
    card.className='card';
    card.id = `consultation-${consultation.id}`;
    card.dataset.status = consultation.status;
    card.innerHTML = innerHTML;
    attachCardEvents(card, consultation, type);
    container.appendChild(card);
  }
}

function getCardHTML(c, type='upcoming'){

  if(type==='pending') return `
      <p>Caregiver: ${c.caregiver_name||'Unknown'}</p>
      ${c.infant_name?`<p>Infant: ${c.infant_name}</p>`:''}
      <p>Date: ${formatDate(c.scheduled_date)}</p>
       <p>Status: ${c.status}</p>
      ${c.reason?`<p>Reason: ${escapeHtml(c.reason)}</p>`:''}
      <div class="buttons">
        <button class="approve-btn">Approve</button>
        <button class="reschedule-btn">Reschedule Meeting</button>
      </div>
    `;

  if(type==='upcoming') return `
      <p>Caregiver: ${c.caregiver_name||'Unknown'}</p>
      ${c.infant_name?`<p>Infant: ${c.infant_name}</p>`:''}
      <p>Date: ${formatDate(c.scheduled_date)}</p>
      <p>Status: ${c.status}</p>
      <div class="buttons">
        <button class="join-btn">${graceTimers[c.id]?'Rejoin Meeting':'Start Meeting'}</button>
        <button class="reschedule-btn">Reschedule</button>
      </div>
    `;

      if(type==='overdue') return `
      <p>Caregiver: ${c.caregiver_name||'Unknown'}</p>
      ${c.infant_name?`<p>Infant: ${c.infant_name}</p>`:''}
      <p>Date: ${formatDate(c.scheduled_date)}</p>
      <p>Status: ${c.status}</p>
      <div class="buttons">
        <button class="reschedule-btn">Reschedule</button>
      </div>
    `;

  if(type==='past') return `
      <p>Caregiver: ${c.caregiver_name||'Unknown'}</p>
      ${c.infant_name?`<p>Infant: ${c.infant_name}</p>`:''}
      <p>Date: ${formatDate(c.scheduled_date)}</p>
      ${c.reason?`<p>Reason: ${escapeHtml(c.reason)}</p>`:''}
      <p>Status: ${c.status}</p>
    `;

  if(type==='canceled') return `
      <p>Caregiver: ${c.caregiver_name||'Unknown'}</p>
      ${c.infant_name?`<p>Infant: ${c.infant_name}</p>`:''}
      <p>Date: ${formatDate(c.display_date)}</p>
      ${c.reason?`<p>Reason: ${escapeHtml(c.reason)}</p>`:''}
      <p>Status: ${c.status}</p>
    `;
}

function attachCardEvents(card, consultation, type='upcoming'){
  if(type==='pending'){
    card.querySelector('.approve-btn').onclick = () => handleApprove(consultation.id);
   
    card.querySelector('.reschedule-btn').onclick = () => handleDoctorReschedule(consultation.id, consultation);
  }

  if(type === 'overdue'){
    card.querySelector('.reschedule-btn').onclick = () => handleDoctorReschedule(consultation.id, consultation);
  }

  if(type==='upcoming'){
    const joinBtn = card.querySelector('.join-btn');
    const scheduled = new Date(consultation.scheduled_date);
    const GRACE_MINUTES = 1;

    joinBtn.onclick = async () => {
      const now = new Date();
      if(now < scheduled - GRACE_MINUTES * 60000){
        Swal.fire({
          title: 'Too Early',
          text: `You cannot start the meeting before the scheduled time. Please wait until ${scheduled.toLocaleString()}.`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Start or rejoin meeting
      joinBtn.disabled = true; 
      await handleJoin(consultation); 
      joinBtn.disabled = false;
    };

    card.querySelector('.reschedule-btn').onclick = () => handleDoctorReschedule(consultation.id, consultation);
  }
}


// ====================== RENDERING ======================
function displayPendingConsultations(list = []) {
  empty(pendingContainer);
  if (!list.length) {
    pendingContainer.innerHTML = '<p>No pending requests.</p>';
    return;
  }
  list.forEach(c => updateOrCreateCard(pendingContainer, c, 'pending'));
}

function displayUpcomingConsultations(list = []) {
  empty(upcomingContainer);
  if (!list.length) {
    upcomingContainer.innerHTML = '<p>No upcoming consultations.</p>';
    return;
  }
  list.forEach(c => {updateOrCreateCard(upcomingContainer, c, 'upcoming');
                     updateJoinButton(c.id);
        });
 
}

function displayOverdueConsultations(list = []) {
  empty(overdueContainer);
  if (!list.length) {
    overdueContainer.innerHTML = '<p>No overdue consultations.</p>';
    return;
  }
  list.forEach(c => updateOrCreateCard(overdueContainer, c, 'overdue'));
}

function displayPastConsultations(list = []) {
  empty(pastContainer);
  if (!list.length) {
    pastContainer.innerHTML = '<p>No past consultations.</p>';
    return;
  }
  list.forEach(c => updateOrCreateCard(pastContainer, c, 'past'));
}

function displayCanceledConsultations(list = []) {
  empty(canceledContainer);
  if (!list.length) {
    canceledContainer.innerHTML = '<p>No canceled consultations.</p>';
    return;
  }
  list.forEach(c => updateOrCreateCard(canceledContainer, c, 'canceled'));
}

// ====================== ACTION HANDLERS ======================
async function handleApprove(consultationId){

  const confirmed = await Swal.fire({
       title:'Approve consultation?',
       text:'Approving will generate a meeting link and notify caregiver.', 
       icon:'question', 
       showCancelButton:true, 
       confirmButtonText:'Approve'}
      );

      if(!confirmed.isConfirmed) return;

        Swal.fire({
        title: 'Approving...',
        text: 'Please wait while the consultation is approved.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

  try{ 
    const res = await authFetch(`${API_BASE}/doctor/manage/${consultationId}`, 
                {
                  method:'POST', 
                  body:JSON.stringify({action:'approve'})
                }); 
     Swal.close(); 
    Swal.fire('Approved', res.message||'Consultation approved','success'); 

    await fetchDoctorConsultations(); 
  } catch(err){ 
     Swal.close(); 
    console.error(err); 
    Swal.fire('Error', err.message,'error'); 
  }
}

function handleDoctorReschedule(consultationId, consultation) {
  const now = new Date();

  // Format now for the datetime-local input
  const pad = num => num.toString().padStart(2, '0');
  const minDateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  Swal.fire({
    title: 'Reschedule Meeting',
    html: `
      <p>Current: ${formatDate(consultation.scheduled_date)}</p>
      <input type="datetime-local" id="newDateTime" class="swal2-input" min="${minDateStr}">
    `,
    confirmButtonText: 'Propose',
    preConfirm: () => {
      const newDate = document.getElementById('newDateTime').value;
      if(!newDate) Swal.showValidationMessage('Please select a new date and time');

      const selectedDate = new Date(newDate);
      if(selectedDate < now) {
        Swal.showValidationMessage('You cannot reschedule to a past date/time');
      }

      return newDate;
    }
  }).then(async result => {
    if(!result.isConfirmed) return;

    Swal.fire({
      title: 'Rescheduling...',
      text: 'Please wait while the new date is being sent.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await authFetch(`${API_BASE}/doctor/manage/${consultationId}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'reschedule', new_date: result.value })
      });

      Swal.fire('Proposed', res.message || 'Proposal sent', 'success');
      await fetchDoctorConsultations();
    } catch(err) {
      console.error(err);
      Swal.fire('Error', err.message, 'error');
    }
  });
}

// --- Global variables ---
let heartbeatInterval;
let activeApi = null; 

async function handleJoin(consultation) {
  Swal.fire({
    title: 'Joining Meeting...',
    text: 'Please wait while we set things up.',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Get meeting URL from backend
    const res = await authFetch(`${API_BASE}/join/${consultation.id}`, { method: 'POST' });

    const meetingUrl = res.meetingUrl || res.meeting_url || consultation.meeting_url;
    if (!meetingUrl) {
      Swal.fire('No meeting link', 'Meeting URL not generated yet.', 'warning');
      return;
    }
    Swal.close();

    const modal = document.getElementById('jitsi-modal');
    const container = document.getElementById('jitsi-container');
    const leaveBtn = document.getElementById('leave-meeting-btn');
    modal.style.display = 'block';
    container.innerHTML = ''; 

    //  CLEANUP: Dispose any existing Jitsi instance before creating a new one
    if (activeApi) {
      console.log('Disposing existing Jitsi instance before joining new one...');
      activeApi.dispose();
      activeApi = null;
    }

    //  Stop any active heartbeat before rejoining
    stopHeartbeat();

    const domain = 'meet.jit.si';
    const roomName = meetingUrl.split('/').pop();
    const options = {
      roomName,
      parentNode: container,
      width: '100%',
      height: '100%',
      userInfo: { displayName: user?.name || 'Doctor' },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableSelfView: false, 
        disableDeepLinking: true,
        enableWelcomePage: false,
        prejoinPageEnabled: false
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        FILM_STRIP_ONLY: false, 
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting',
          'fullscreen', 'fodeviceselection', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats',
          'shortcuts', 'tileview', 'videobackgroundblur', 'download',
          'help', 'mute-everyone', 'security','participants-pane'
        ]
      }
    };

    console.log('Creating Jitsi API with room:', roomName);
    const api = new JitsiMeetExternalAPI(domain, options);
    activeApi = api; 

    //  Start heartbeat now that we’ve joined
    startHeartbeat(consultation.id);
    updateJoinButton(consultation.id, true);
    joinedOnce.add(consultation.id);

    // --- Events ---
    api.addEventListener('readyToClose', () => {
      console.log(`Meeting ended for consultation ${consultation.id}`);
      handleMeetingExit(api, consultation.id);
    });

    leaveBtn.onclick = () => {
      console.log(`Manual leave triggered for consultation ${consultation.id}`);
      handleMeetingExit(api, consultation.id);
    };

  } catch (err) {
    Swal.fire('Error', err.message, 'error');
    console.error(err);
  }
}

//  Centralized cleanup
function handleMeetingExit(api, consultationId) {
  if (api) api.dispose();
  activeApi = null;
  stopHeartbeat();
  handleDoctorLeft(consultationId);
  const modal = document.getElementById('jitsi-modal');
  const container = document.getElementById('jitsi-container');
  modal.style.display = 'none';
  container.innerHTML = '';
}

function startHeartbeat(consultationId) {
  sendHeartbeat(consultationId);
  heartbeatInterval = setInterval(() => sendHeartbeat(consultationId), 30000);
}

function stopHeartbeat() {
  clearInterval(heartbeatInterval);
  const hbEl = document.getElementById('heartbeat-status');
  if(hbEl) hbEl.textContent = 'Heartbeat stopped';
}

async function sendHeartbeat(consultationId) {
  try {
    await authFetch(`${API_BASE}/${consultationId}/heartbeat`, { method: 'POST' });
    console.log(`Heartbeat sent at ${new Date().toLocaleTimeString()} for ${consultationId}`);
    const hbEl = document.getElementById('heartbeat-status');
    if(hbEl) hbEl.textContent = `Heartbeat active: ${new Date().toLocaleTimeString()}`;
  } catch(err) {
    console.error(`Heartbeat failed for ${consultationId}:`, err);
  }
}


function handleDoctorLeft(consultationId) {
  const modal = document.getElementById('jitsi-modal');
  const container = document.getElementById('jitsi-container');
  if (modal) modal.style.display = 'none';
  if (container) container.innerHTML = '';

  //  Always show Rejoin Meeting after doctor leaves
  updateJoinButton(consultationId, 'left');

  //  Clear any previous grace timer
  if (graceTimers[consultationId]) clearTimeout(graceTimers[consultationId]);

  //  Start 2-minute grace timer before marking as left in DB
  graceTimers[consultationId] = setTimeout(async () => {
    try {
      await authFetch(`${API_BASE}/${consultationId}/leave`, { method: 'POST' });
      delete graceTimers[consultationId];

    } catch (err) {
      console.error("Error marking consultation as left:", err);
    }
  }, 2 * 60 * 1000);
}


      function updateJoinButton(consultationId, state = false) {
      const card = document.querySelector(`#consultation-${consultationId}`);
      if (!card) return;
      const btn = card.querySelector('.join-btn');
      if (!btn) return;

      if (state === true || state === 'inMeeting') {
      // Doctor is currently in the meeting (This state is currently not persistent)
      joinedOnce.add(consultationId);
      btn.textContent = 'In Meeting';
      btn.disabled = true;

      } else if (graceTimers[consultationId] || joinedOnce.has(consultationId)) { 
      // Doctor is in the 2-minute grace period OR has joined before in this session
      btn.textContent = 'Rejoin Meeting';
      btn.disabled = false;

      } else {
      // Doctor never joined before, and no grace period active
      btn.textContent = 'Start Meeting';
      btn.disabled = false;
      }
      }


// ====================== FETCH DOCTOR CONSULTATIONS ======================
async function fetchDoctorConsultations(){
  if(!doctorId || !token) return;
  try{
    const data = await authFetch(`${API_BASE}/doctor/${doctorId}`);
    displayPendingConsultations(data.upcoming.filter(c=>c.status==='pending'||c.status==='pending_reschedule'));
    displayUpcomingConsultations(data.upcoming.filter(c=>c.status==='approved'||c.status==='rescheduled'));
    displayOverdueConsultations(data.overdue || [])
    displayPastConsultations(data.past || []);
    displayCanceledConsultations(data.canceled || []);
  }catch(err){ 
    console.error(err); 
    Swal.fire('Error','Failed to load consultations: '+err.message,'error'); 
  }
}

window._doctorModule={fetchDoctorConsultations, handleApprove, handleDoctorReschedule, handleJoin};


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