// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection, query,orderBy, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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
let presentCount=0;
let absentCount=0;
if (!userEmail) {
  console.log("No user is authenticated!");
  alert("Please sign in to proceed.");
  window.location.href = "/index.html";  // Redirect to login page
} else {
  console.log("User is authenticated with Email:", userEmail);

  try {
    // Reference the attendance collection in Firestore
    const company=sessionStorage.getItem('company');
    const attendanceCollection = collection(db, `/company/${company}/Attendance`);

    // Create query to filter by Email
    const employeeID = userEmail.replace("@gmail.com", ""); 
    // Example if the email is used for EmployeeID
    console.log(employeeID);
    const today = new Date();

      // Create query to filter by EmployeeID and Date <= Today
      const q = query(
          attendanceCollection,
          where("EmployeeID", "==", employeeID),  // Filter by EmployeeID
          orderBy("Date2", "desc")                 // Order by Date in descending order
      );

    // Fetch query results
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      let tableRows = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
      

        if (data.Status === "Present") {
          presentCount++;
      } else if (data.Status === "Absent") {
          absentCount++;
      }
        
        // Build table rows
        let statusColor = "green"; // Default to green
              if (data.Status === "Absent") {
                statusColor = "red";
              }
        tableRows += `
          <tr>
            <td>${data.Date || "--"}</td>
            <td>${data.EmployeeID || "--"}</td>
            <td style="color: ${statusColor};">${data.Status || "--"}</td>
            <td>${data.Firstlogin || "--"}</td>
            <td>${data.Lastlogin || "--"}</td>
            <td>${data.Logindata || "--"}</td>
          </tr>
        `;
      });

      // Create table content
      const profileContent = `
      <div id="hed">
        <h2>Your Attendance History</h2>
       
        </div>
        <table class="styled-table">
          <thead>
            <tr>
              <th>Attended Date</th>
              <th>Employee ID</th>
              <th>Status</th>
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
      drawChart(presentCount, absentCount);

      // Insert content into profile class
      document.getElementById('profile').innerHTML = profileContent;
      document.getElementById('contains').style.display='flex';
    } else {
      console.log("No attendance records found for this EmployeeID.");
      document.getElementById('profile').innerHTML = "<p>No records found</p>";
    }
  } catch (error) {``
    console.error("Error fetching user data from Firestore:", error);
    document.getElementById('profile').innerHTML = "<p>Error fetching records. Please try again later.</p>";
  }
}
function drawChart(present, absent) {
  const ctx = document.getElementById('attendanceChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Present', 'Absent'],
      datasets: [{
        data: [present, absent],
        backgroundColor: ['#2D79F3', '#F39C12'], // Colors for Present & Absent
        borderWidth: 2, // You can adjust the thickness if needed
        borderColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Transparent Borders
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false }
      }
    }
  });
}



