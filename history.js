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
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user is authenticated!");
    window.location.href = "index.html";
  } else {
    console.log("Authenticated user:", user.uid);

    try {
      // Reference the collection where employee records are stored
      const attendanceCollection = collection(db, "/company/Microsoft/Attendance");
      
      // Create a query to filter by EmployeeID
      const employeeID = user.email.replace("@gmail.com", "");
      const q = query(attendanceCollection, where("EmployeeID", "==", employeeID));
      
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
          <table class="styled-table"">
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
    }
  }
});
