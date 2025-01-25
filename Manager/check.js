// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCib5ywnEJvXXIePdWeKZtrKMIi2-Q_9sM",
  authDomain: "geo-orbit-ed7a7.firebaseapp.com",
  databaseURL: "https://geo-orbit-ed7a7-default-rtdb.firebaseio.com",
  projectId: "geo-orbit-ed7a7",
  storageBucket: "geo-orbit-ed7a7.firebasestorage.app",
  messagingSenderId: "807202826514",
  appId: "1:807202826514:web:5630f581f6f9dff46aebcb",
  measurementId: "G-H15DN69132"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Check if user is authenticated
// Get userEmail from sessionStorage
const userEmail = sessionStorage.getItem('userEmail');

const search=document.getElementById("search");
search.addEventListener('click', async () => {
    const EmployeeID=document.getElementById('empid').value;

if (!userEmail) {
  console.log("No user is authenticated!");
  alert("Please sign in to proceed.");
  window.location.href = "/index.html";  // Redirect to login page
} else {
  console.log("User is authenticated with Email:", userEmail);

  try {
    // Reference the attendance collection in Firestore
    const attendanceCollection = collection(db, "/company/Microsoft/Attendance");

    // Create query to filter by Email
    const q = query(attendanceCollection, where("EmployeeID", "==", EmployeeID));

    // Fetch query results
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      let tableRows = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Build table rows
        tableRows += `
          <tr>
            <td>${data.Date || "N/A"}</td>
            <td>${data.EmployeeID || "N/A"}</td>
            <td>${data.Role || "N/A"}</td>
            <td>${data.Firstlogin || "N/A"}</td>
            <td>${data.Lastlogin || "N/A"}</td>
            <td>${data.Logindata || "N/A"}</td>
          </tr>
        `;
      });

      // Create table content
      const profileContent = `
        <h2>Your Attendance History</h2>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee ID</th>
              <th>Role</th>
              <th>First Login</th>
              <th>Last Login</th>
              <th>Logins</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;

      // Insert content into profile class
      document.getElementById('profile').innerHTML = profileContent;
    } else {
      console.log("No attendance records found for this EmployeeID.");
      document.getElementById('profile').innerHTML = "<p>No records found</p>";
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    document.getElementById('profile').innerHTML = "<p>Error fetching records. Please try again later.</p>";
  }
}



});


// Function to generate the calendar dates for the selected month and year
function generateCalendar() {
    const month = document.getElementById("calendar__month").value;
    const year = document.getElementById("calendar__year").value;
    const date = new Date(year, month); // Start from the 1st day of the selected month
    const firstDay = date.getDay(); // Day of the week for the 1st of the month
    const lastDate = new Date(year, parseInt(month) + 1, 0).getDate(); // Last day of the month

    const calendarDates = document.getElementById("calendar-dates");
    calendarDates.innerHTML = ""; // Clear the existing dates

    // Get today's date
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Add empty cells for the first week days
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        calendarDates.appendChild(emptyCell);
    }

    // Add the actual dates of the month
    for (let day = 1; day <= lastDate; day++) {
        const dateCell = document.createElement("div");
        dateCell.classList.add("calendar__date");

        // Check if the current date is today's date and highlight it
        if (day === todayDate && month == todayMonth && year == todayYear) {
            dateCell.classList.add("calendar__date--today");
        }

        dateCell.innerHTML = `<span>${day}</span>`;
        dateCell.addEventListener("click", function () {
            selectDate(dateCell);
        });
        calendarDates.appendChild(dateCell);
    }
}

// Function to handle date selection
function selectDate(dateCell) {
    // Remove the selected class from any other date
    const selectedDate = document.querySelector(".calendar__date--selected");
    if (selectedDate) {
        selectedDate.classList.remove("calendar__date--selected");
    }

    // Mark the clicked date as selected
    dateCell.classList.add("calendar__date--selected");

    // Fetch attendance data based on the selected date
    const selectedDateValue = dateCell.querySelector("span").innerText;
    const month = document.getElementById("calendar__month").value;
    const year = document.getElementById("calendar__year").value;
    
    // Format the selected date in YYYY-MM-DD format
    const formattedDate = `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-${selectedDateValue.toString().padStart(2, '0')}`;
    
    fetchAttendanceData(formattedDate);
}

// Function to fetch attendance data from Firestore based on the selected date
async function fetchAttendanceData(selectedDate) {
    // Get the selected employee's ID from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail');
    const employeeID = document.getElementById('empid').value;  // Assuming empid is an input field
    if (!userEmail) {
        alert("Please sign in to proceed.");
        window.location.href = "/index.html";  // Redirect to login page
        return;
    }

    try {
        // Firestore query to get attendance data for the selected date and employee ID
        const attendanceCollection = collection(db, "/company/Microsoft/Attendance");
        const q = query(attendanceCollection, where("EmployeeID", "==", employeeID), where("Date", "==", selectedDate));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0].data(); // Assume the first result is the correct one
            // Display the selected date's attendance data in a form-like structure
            displayProfileForm(doc);
        } else {
            document.getElementById('profile').innerHTML = `<p>No attendance record found for ${selectedDate}</p>`;
        }
    } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        document.getElementById('profile').innerHTML = "<p>Error fetching records. Please try again later.</p>";
    }
}

// Function to display selected date's details in a form// Function to display selected date's details in a form
// Function to display selected date's details in a form
function displayProfileForm(data) {
    const profileContent = `
        <h2>Attendance Details for Selected Date</h2>
        <div class="profile-form">
    <div class="profile-item">
        <label for="empid1"     >Employee ID    :</label>
        <p id="empid1">${data.EmployeeID || "N/A"}</p>
    </div>
    
    <div class="profile-item">
        <label for="role"       >Role           :</label>
        <p id="role">${data.Role || "N/A"}</p>
    </div>
    
    <div class="profile-item">
        <label for="first-login">First Login    :  </label>
        <p id="first-login">${data.Firstlogin || "N/A"}</p>
    </div>
    
    <div class="profile-item">
        <label for="last-login" >Last Login     :  </label>
        <p id="last-login">${data.Lastlogin || "N/A"}</p>
    </div>
    
    <div class="profile-item">
        <label for="logins"     >Logins         :            </label>
        <p id="logins">${data.Logindata || "N/A"}</p>
    </div>
</div>

    `;

    document.getElementById('profile').innerHTML = profileContent;
}



// Function to show the calendar
function showCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.classList.add("show");

    // Set the month and year dropdown to today's values
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Set the selected options to today's month and year
    document.getElementById("calendar__month").value = currentMonth;
    document.getElementById("calendar__year").value = currentYear;

    // Generate the calendar for today's month and year
    generateCalendar();
}

// Event listeners for the "Show Calendar" button
document.getElementById("show-calendar-btn").addEventListener("click", showCalendar);

// Initial calendar generation on page load
window.onload = generateCalendar;

// Update calendar when month or year is changed
document.getElementById("calendar__month").addEventListener("change", generateCalendar);
document.getElementById("calendar__year").addEventListener("change", generateCalendar);
