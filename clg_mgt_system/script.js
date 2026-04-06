// Data Storage
let students = JSON.parse(localStorage.getItem("students")) || [];
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let timetable = JSON.parse(localStorage.getItem("timetable")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  updateDashboard();
  displayStudents();
  displaySubjects();
  displayTimetable();
  populateSubjectDropdowns();
  setTodayDate();
  populateReportDropdowns();
});

// Tab Switching
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active class from all nav tabs
  document.querySelectorAll(".nav-tab").forEach((navTab) => {
    navTab.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(tabName).classList.add("active");

  // Add active class to clicked nav tab
  event.target.classList.add("active");

  // Update specific tab content
  if (tabName === "dashboard") {
    updateDashboard();
  }
}

// Dashboard Functions
function updateDashboard() {
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("totalSubjects").textContent = subjects.length;

  // Calculate today's attendance
  const today = new Date().toDateString();
  const todayAttendance = attendance.filter(
    (a) => new Date(a.date).toDateString() === today,
  );

  if (todayAttendance.length > 0) {
    const presentCount = todayAttendance.filter(
      (a) => a.status === "present",
    ).length;
    const percentage = Math.round(
      (presentCount / todayAttendance.length) * 100,
    );
    document.getElementById("todayAttendance").textContent = percentage + "%";
  } else {
    document.getElementById("todayAttendance").textContent = "N/A";
  }

  // Today's classes
  const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable.filter((t) => t.day === todayDay);
  document.getElementById("totalClasses").textContent = todayClasses.length;

  // Display today's schedule
  displayTodaySchedule(todayClasses);
}

function displayTodaySchedule(classes) {
  const scheduleDiv = document.getElementById("todaySchedule");
  if (classes.length === 0) {
    scheduleDiv.innerHTML =
      '<p class="empty-state">No classes scheduled for today</p>';
    return;
  }

  let html =
    "<table><thead><tr><th>Time</th><th>Subject</th></tr></thead><tbody>";
  classes.forEach((cls) => {
    html += `
                    <tr>
                        <td>${cls.startTime} - ${cls.endTime}</td>
                        <td>${cls.subjectName}</td>
                    </tr>
                `;
  });
  html += "</tbody></table>";
  scheduleDiv.innerHTML = html;
}

// Student Management
document.getElementById("studentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const student = {
    id: Date.now(),
    name: document.getElementById("studentName").value,
    rollNumber: document.getElementById("rollNumber").value,
    email: document.getElementById("studentEmail").value,
    class: document.getElementById("studentClass").value,
  };

  students.push(student);
  localStorage.setItem("students", JSON.stringify(students));

  document.getElementById("studentForm").reset();
  showSuccess("studentSuccess");
  displayStudents();
  updateDashboard();
  populateReportDropdowns();
});

function displayStudents() {
  const list = document.getElementById("studentsList");
  if (students.length === 0) {
    list.innerHTML =
      '<tr><td colspan="5" class="empty-state">No students added yet</td></tr>';
    return;
  }

  list.innerHTML = students
    .map(
      (student) => `
                <tr>
                    <td>${student.rollNumber}</td>
                    <td>${student.name}</td>
                    <td>${student.email || "-"}</td>
                    <td>${student.class || "-"}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
                    </td>
                </tr>
            `,
    )
    .join("");
}

function deleteStudent(id) {
  if (confirm("Are you sure you want to delete this student?")) {
    students = students.filter((s) => s.id !== id);
    localStorage.setItem("students", JSON.stringify(students));
    displayStudents();
    updateDashboard();
    populateReportDropdowns();
  }
}

// Subject Management
document.getElementById("subjectForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const subject = {
    id: Date.now(),
    code: document.getElementById("subjectCode").value,
    name: document.getElementById("subjectName").value,
    instructor: document.getElementById("instructor").value,
  };

  subjects.push(subject);
  localStorage.setItem("subjects", JSON.stringify(subjects));

  document.getElementById("subjectForm").reset();
  showSuccess("subjectSuccess");
  displaySubjects();
  populateSubjectDropdowns();
  updateDashboard();
});

function displaySubjects() {
  const list = document.getElementById("subjectsList");
  if (subjects.length === 0) {
    list.innerHTML =
      '<tr><td colspan="4" class="empty-state">No subjects added yet</td></tr>';
    return;
  }

  list.innerHTML = subjects
    .map(
      (subject) => `
                <tr>
                    <td>${subject.code}</td>
                    <td>${subject.name}</td>
                    <td>${subject.instructor || "-"}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteSubject(${subject.id})">Delete</button>
                    </td>
                </tr>
            `,
    )
    .join("");
}

function deleteSubject(id) {
  if (confirm("Are you sure you want to delete this subject?")) {
    subjects = subjects.filter((s) => s.id !== id);
    localStorage.setItem("subjects", JSON.stringify(subjects));
    displaySubjects();
    populateSubjectDropdowns();
    updateDashboard();
  }
}

// Timetable Management
document
  .getElementById("timetableForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const selectedSubject = subjects.find(
      (s) => s.id == document.getElementById("timetableSubject").value,
    );

    const entry = {
      id: Date.now(),
      day: document.getElementById("day").value,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      startTime: document.getElementById("startTime").value,
      endTime: document.getElementById("endTime").value,
    };

    timetable.push(entry);
    localStorage.setItem("timetable", JSON.stringify(timetable));

    document.getElementById("timetableForm").reset();
    showSuccess("timetableSuccess");
    displayTimetable();
    updateDashboard();
  });

function displayTimetable() {
  const list = document.getElementById("timetableList");
  if (timetable.length === 0) {
    list.innerHTML =
      '<tr><td colspan="4" class="empty-state">No classes scheduled yet</td></tr>';
    return;
  }

  // Sort by day and time
  const sortedTimetable = [...timetable].sort((a, b) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return (
      days.indexOf(a.day) - days.indexOf(b.day) ||
      a.startTime.localeCompare(b.startTime)
    );
  });

  list.innerHTML = sortedTimetable
    .map(
      (entry) => `
                <tr>
                    <td>${entry.day}</td>
                    <td>${entry.subjectName}</td>
                    <td>${entry.startTime} - ${entry.endTime}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteTimetableEntry(${entry.id})">Delete</button>
                    </td>
                </tr>
            `,
    )
    .join("");
}

function deleteTimetableEntry(id) {
  if (confirm("Are you sure you want to delete this class from timetable?")) {
    timetable = timetable.filter((t) => t.id !== id);
    localStorage.setItem("timetable", JSON.stringify(timetable));
    displayTimetable();
    updateDashboard();
  }
}

// Attendance Management
function setTodayDate() {
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  document.getElementById("attendanceDate").value = dateString;
}

function loadStudentsForAttendance() {
  const subjectId = document.getElementById("attendanceSubject").value;
  const grid = document.getElementById("attendanceGrid");

  if (!subjectId) {
    grid.innerHTML = '<p class="empty-state">Please select a subject</p>';
    return;
  }

  if (students.length === 0) {
    grid.innerHTML = '<p class="empty-state">No students available</p>';
    return;
  }

  grid.innerHTML = students
    .map(
      (student) => `
                <div class="student-card" data-student-id="${student.id}">
                    <h4>${student.name}</h4>
                    <p>Roll: ${student.rollNumber}</p>
                    <div class="attendance-buttons">
                        <button class="btn-present" onclick="markAttendance(${student.id}, 'present', this)">
                            Present
                        </button>
                        <button class="btn-absent" onclick="markAttendance(${student.id}, 'absent', this)">
                            Absent
                        </button>
                    </div>
                </div>
            `,
    )
    .join("");
}

function markAttendance(studentId, status, button) {
  const card = button.closest(".student-card");
  const buttons = card.querySelectorAll("button");

  buttons.forEach((btn) => {
    btn.style.opacity = "0.5";
    btn.style.transform = "scale(1)";
  });

  button.style.opacity = "1";
  button.style.transform = "scale(1.1)";

  card.setAttribute("data-status", status);
}

function saveAttendance() {
  const subjectId = document.getElementById("attendanceSubject").value;
  if (!subjectId) {
    alert("Please select a subject");
    return;
  }

  const cards = document.querySelectorAll(".student-card[data-status]");
  if (cards.length === 0) {
    alert("Please mark attendance for at least one student");
    return;
  }

  const date = new Date().toISOString().split("T")[0];

  cards.forEach((card) => {
    const studentId = parseInt(card.getAttribute("data-student-id"));
    const status = card.getAttribute("data-status");

    const record = {
      id: Date.now() + Math.random(),
      studentId: studentId,
      subjectId: parseInt(subjectId),
      date: date,
      status: status,
    };

    attendance.push(record);
  });

  localStorage.setItem("attendance", JSON.stringify(attendance));
  alert("Attendance saved successfully!");

  // Reset the form
  document.getElementById("attendanceGrid").innerHTML =
    '<p class="empty-state">Attendance saved! Select a subject to mark new attendance.</p>';
  document.getElementById("attendanceSubject").value = "";
  updateDashboard();
}

// Reports
function populateReportDropdowns() {
  const studentSelect = document.getElementById("reportStudent");
  studentSelect.innerHTML =
    '<option value="">All Students</option>' +
    students
      .map(
        (s) => `<option value="${s.id}">${s.name} (${s.rollNumber})</option>`,
      )
      .join("");

  const subjectSelect = document.getElementById("reportSubject");
  subjectSelect.innerHTML =
    '<option value="">All Subjects</option>' +
    subjects.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
}

function generateReport() {
  const studentId = document.getElementById("reportStudent").value;
  const subjectId = document.getElementById("reportSubject").value;
  const reportContent = document.getElementById("reportContent");

  let filteredAttendance = [...attendance];

  if (studentId) {
    filteredAttendance = filteredAttendance.filter(
      (a) => a.studentId == studentId,
    );
  }

  if (subjectId) {
    filteredAttendance = filteredAttendance.filter(
      (a) => a.subjectId == subjectId,
    );
  }

  if (filteredAttendance.length === 0) {
    reportContent.innerHTML =
      '<p class="empty-state">No attendance records found</p>';
    return;
  }

  // Group by student and calculate percentage
  const studentStats = {};

  filteredAttendance.forEach((record) => {
    const student = students.find((s) => s.id === record.studentId);
    if (!student) return;

    if (!studentStats[student.id]) {
      studentStats[student.id] = {
        name: student.name,
        rollNumber: student.rollNumber,
        present: 0,
        absent: 0,
        total: 0,
      };
    }

    studentStats[student.id].total++;
    if (record.status === "present") {
      studentStats[student.id].present++;
    } else {
      studentStats[student.id].absent++;
    }
  });

  let html = '<div class="table-container"><table>';
  html +=
    "<thead><tr><th>Roll Number</th><th>Name</th><th>Present</th><th>Absent</th><th>Total</th><th>Percentage</th></tr></thead><tbody>";

  Object.values(studentStats).forEach((stat) => {
    const percentage = Math.round((stat.present / stat.total) * 100);
    const percentageClass = percentage >= 75 ? "btn-success" : "btn-danger";

    html += `
                    <tr>
                        <td>${stat.rollNumber}</td>
                        <td>${stat.name}</td>
                        <td>${stat.present}</td>
                        <td>${stat.absent}</td>
                        <td>${stat.total}</td>
                        <td><span class="btn ${percentageClass}">${percentage}%</span></td>
                    </tr>
                `;
  });

  html += "</tbody></table></div>";
  reportContent.innerHTML = html;
}

// Utility Functions
function populateSubjectDropdowns() {
  const timetableSubject = document.getElementById("timetableSubject");
  timetableSubject.innerHTML =
    '<option value="">Select Subject</option>' +
    subjects.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");

  const attendanceSubject = document.getElementById("attendanceSubject");
  attendanceSubject.innerHTML =
    '<option value="">Select Subject</option>' +
    subjects.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");

  populateReportDropdowns();
}

function showSuccess(elementId) {
  const element = document.getElementById(elementId);
  element.style.display = "block";
  setTimeout(() => {
    element.style.display = "none";
  }, 3000);
}
