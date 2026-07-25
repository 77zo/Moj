const attendanceTable = document.getElementById("attendanceTable");
const message = document.getElementById("message");
const locationStatus = document.getElementById("locationStatus");
const distanceInfo = document.getElementById("distanceInfo");
const langToggle = document.getElementById("langToggle");
const cookiePopup = document.getElementById("cookiePopup");
const cookieAccept = document.getElementById("cookieAccept");

let verifiedInside = false;
let lang = "en";

const buildingLat = 21.3891;
const buildingLng = 39.8579;
const allowedRadius = 100;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function verifyLocation() {
  if (!navigator.geolocation) {
    message.textContent = lang === "en" ? "Geolocation is not supported by this browser." : "الموقع الجغرافي غير مدعوم في هذا المتصفح.";
    message.className = "message error";
    return;
  }

  message.textContent = lang === "en" ? "Verifying location..." : "جاري التحقق من الموقع...";
  message.className = "message";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const distance = getDistance(userLat, userLng, buildingLat, buildingLng);
      distanceInfo.value = `${distance.toFixed(2)} meters`;

      if (distance <= allowedRadius) {
        verifiedInside = true;
        locationStatus.value = lang === "en" ? "Inside Building" : "داخل المبنى";
        message.textContent = lang === "en" ? "Location verified successfully." : "تم التحقق من الموقع بنجاح.";
        message.className = "message success";
      } else {
        verifiedInside = false;
        locationStatus.value = lang === "en" ? "Outside Building" : "خارج المبنى";
        message.textContent = lang === "en" ? "Access denied: employee is outside the building." : "تم الرفض: الموظف خارج المبنى.";
        message.className = "message error";
      }
    },
    () => {
      verifiedInside = false;
      message.textContent = lang === "en" ? "Unable to access location. Please allow GPS permission." : "تعذر الوصول إلى الموقع. يرجى السماح بإذن GPS.";
      message.className = "message error";
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function markAttendance() {
  const name = document.getElementById("employeeName").value.trim();
  const id = document.getElementById("employeeId").value.trim();

  if (!name || !id) {
    message.textContent = lang === "en" ? "Please enter employee name and ID." : "يرجى إدخال اسم الموظف والرقم الوظيفي.";
    message.className = "message error";
    return;
  }

  if (!verifiedInside) {
    message.textContent = lang === "en" ? "Attendance cannot be marked unless the employee is inside the building." : "لا يمكن تسجيل الحضور إلا إذا كان الموظف داخل المبنى.";
    message.className = "message error";
    return;
  }

  const time = new Date().toLocaleString();
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${name}</td>
    <td>${id}</td>
    <td>${time}</td>
    <td>${lang === "en" ? "Present" : "حاضر"}</td>
  `;
  attendanceTable.appendChild(row);

  message.textContent = lang === "en" ? "Attendance marked successfully." : "تم تسجيل الحضور بنجاح.";
  message.className = "message success";

  document.getElementById("employeeName").value = "";
  document.getElementById("employeeId").value = "";
  locationStatus.value = "";
  distanceInfo.value = "";
  verifiedInside = false;
}

function applyLanguage(selected) {
  lang = selected;
  document.documentElement.lang = selected;
  document.documentElement.dir = selected === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", selected === "ar");
  langToggle.textContent = selected === "en" ? "AR" : "EN";

  document.querySelectorAll("[data-en]").forEach((el) => {
    el.textContent = el.dataset[selected];
  });

  document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
    el.placeholder = el.dataset[`${selected}Placeholder`];
  });

  document.title = selected === "en"
    ? "Ministry of Justice | Criminal Court Portal"
    : "وزارة العدل | بوابة المحكمة الجزائية";

  locationStatus.placeholder = selected === "en" ? "Not verified yet" : "لم يتم التحقق بعد";
  distanceInfo.placeholder = selected === "en" ? "Waiting for GPS..." : "بانتظار GPS...";
}

langToggle.addEventListener("click", () => {
  applyLanguage(lang === "en" ? "ar" : "en");
});

cookieAccept.addEventListener("click", () => {
  cookiePopup.style.display = "none";
});

applyLanguage("en");
