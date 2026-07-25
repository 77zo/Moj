const attendanceTable = document.getElementById("attendanceTable");
const message = document.getElementById("message");
const locationStatus = document.getElementById("locationStatus");
const distanceInfo = document.getElementById("distanceInfo");

let verifiedInside = false;

const buildingLat = 21.3891;
const buildingLng = 39.8579;
const allowedRadius = 100;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function verifyLocation() {
  if (!navigator.geolocation) {
    message.textContent = "Geolocation is not supported by this browser.";
    message.className = "message error";
    return;
  }

  message.textContent = "Verifying location...";
  message.className = "message";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const distance = getDistance(userLat, userLng, buildingLat, buildingLng);

      distanceInfo.value = `${distance.toFixed(2)} meters`;

      if (distance <= allowedRadius) {
        verifiedInside = true;
        locationStatus.value = "Inside Building";
        message.textContent = "Location verified successfully.";
        message.className = "message success";
      } else {
        verifiedInside = false;
        locationStatus.value = "Outside Building";
        message.textContent = "Access denied: employee is outside the building.";
        message.className = "message error";
      }
    },
    () => {
      verifiedInside = false;
      message.textContent = "Unable to access location. Please allow GPS permission.";
      message.className = "message error";
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function markAttendance() {
  const name = document.getElementById("employeeName").value.trim();
  const id = document.getElementById("employeeId").value.trim();

  if (!name || !id) {
    message.textContent = "Please enter employee name and ID.";
    message.className = "message error";
    return;
  }

  if (!verifiedInside) {
    message.textContent = "Attendance cannot be marked unless the employee is inside the building.";
    message.className = "message error";
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
  message.className = "message success";

  document.getElementById("employeeName").value = "";
  document.getElementById("employeeId").value = "";
  locationStatus.value = "";
  distanceInfo.value = "";
  verifiedInside = false;
}
