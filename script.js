const message = document.getElementById("message");
const attendanceTable = document.getElementById("attendanceTable");
const locationStatus = document.getElementById("locationStatus");

let userLat = null;
let userLng = null;

// Replace these with the real building coordinates later
const buildingLat = 21.3891;
const buildingLng = 39.8579;
const allowedRadius = 100; // meters

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getLocation() {
  if (!navigator.geolocation) {
    message.textContent = "Geolocation is not supported by your browser.";
    message.className = "error";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;

      const distance = getDistance(userLat, userLng, buildingLat, buildingLng);

      if (distance <= allowedRadius) {
        locationStatus.value = "Inside Building";
        message.textContent = "Location verified: employee is inside the building.";
        message.className = "success";
      } else {
        locationStatus.value = "Outside Building";
        message.textContent = "Access denied: employee is outside the allowed building area.";
        message.className = "error";
      }
    },
    () => {
      message.textContent = "Unable to get location. Please allow location access.";
      message.className = "error";
    }
  );
}

function markAttendance() {
  const name = document.getElementById("employeeName").value.trim();
  const id = document.getElementById("employeeId").value.trim();

  if (!name || !id) {
    message.textContent = "Please enter employee name and ID.";
    message.className = "error";
    return;
  }

  if (locationStatus.value !== "Inside Building") {
    message.textContent = "Attendance can only be marked when the employee is inside the building.";
    message.className = "error";
    return;
  }

  const time = new Date().toLocaleString();
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${name}</td>
    <td>${id}</td>
    <td>${time}</td>
    <td>Present</td>
  `;
  attendanceTable.appendChild(row);

  message.textContent = "Attendance marked successfully.";
  message.className = "success";

  document.getElementById("employeeName").value = "";
  document.getElementById("employeeId").value = "";
  locationStatus.value = "";
}
