// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection,doc, query, where, orderBy,getDocs,getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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
const db = getFirestore(app);

// Check if the user is authenticated
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Access Denied. Please log in.");
    window.location.href = "/index.html"; // Redirect to login page
    return;
  }

  const userUID = user.uid;
  const company = sessionStorage.getItem('company');

  const userRef = doc(db, `company/${company}/users`, userUID); // Fetch user data from Firestore
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

  if (company!=userData.Company) {
    alert("Session expired. Please log in again.");
    window.location.href = "/index.html";
    return;
  }

  try {
    // Check if the user role exists in the users collection
    const userRef = doc(db, `company/${company}/users`, userUID); // Fetch user data from Firestore
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userRole = userData.role; // Assuming the role is stored under 'role' in the user document

      if (userRole === "manager") {
        console.log("User is a manager. Access granted.");
        sessionStorage.setItem('userRole', 'manager');
      } else {
        // alert("Access Denied. Only managers can view this page.");
        // await signOut(auth);
        window.location.href = "/index.html"; // Redirect to login page
      }
    } else {
      alert("User not found in the database.");
      await signOut(auth);
      window.location.href = "/index.html";
    }
  } catch (error) {
    console.error("Error fetching user role from Firestore:", error);
    alert("Error verifying access. Please try again.");
    window.location.href = "/index.html";
  }
});
// Fetch and display all employees with their roles
async function displayAllEmployees() {
    const company = sessionStorage.getItem('company');
    
    try {
      const usersCollection = collection(db, `/company/${company}/users`);
      const querySnapshot = await getDocs(usersCollection);
  
      if (!querySnapshot.empty) {
        const employeeList = document.getElementById('employeeList'); // Add this element in your HTML to display employees
        employeeList.innerHTML = ''; // Clear the list first
  
        querySnapshot.forEach(doc => {
          const employeeData = doc.data();
          const employeeName = employeeData.name || "Not provided";
          const employeeRole = employeeData.Role || "Not provided";
  
          // Create a new list item for each employee
          const li = document.createElement('li');
          li.textContent = `${employeeName} - ${employeeRole}`;
          employeeList.appendChild(li);
  
          // You can also add a click handler here to load the employee's profile when clicked
          li.addEventListener('click', () => {
            displayEmployeeProfile(employeeData);
          });
        });
      } else {
        console.log("No employees found.");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }
  
  // Search functionality for employee (same as before)
  const search = document.getElementById("search");
  search.addEventListener('click', async () => {
    const EmployeeI = document.getElementById('empid');
    const EmployeeID = EmployeeI.value;
  
    const triggerShake = (input) => {
      input.classList.remove('shake');
      void input.offsetWidth; // Trigger a reflow
      input.classList.add('shake');
    };
  
    if (!EmployeeID) {
      triggerShake(EmployeeI);
      return;
    }
  
    try {
      const company = sessionStorage.getItem('company');
      // Fetch employee details from 'users' collection by EmployeeID
      const usersCollection = collection(db, `/company/${company}/users`);
      const q = query(usersCollection, where("EmployeeID", "==", EmployeeID));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0].data(); // Assume the first result is the correct one
        // Display the selected employee's details in the profile form
        displayEmployeeProfile(doc);
      } else {
        alert("Employee not found.");
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
    }
  });
  
  // Function to display employee profile details (same as before)
  function displayEmployeeProfile(data) {
    const imgElement = document.getElementById('userPhoto');
    
    // Set the image source to the fetched URL
    imgElement.src = data.photoURL;
  
    // Make the image visible after it's loaded
    imgElement.onload = function() {
      imgElement.style.display = 'block';   // Ensure it's visible
      imgElement.style.opacity = 1;   
    };
    
    const pro = document.getElementById('profile');
    pro.style.display = 'block';
    pro.style.opacity = 1;
  
    // Update the UI with employee data
    document.getElementById("userName").innerText = data.name || "Not provided";
    document.getElementById("userEmail").innerText = data.email || "Not provided";
    document.getElementById("Dob").innerText = "Date of birth: " + (data.Dob || "Not provided");
    document.getElementById("userMobile").innerText = "Mobile: " + (data.mobileNumber || "Not provided");
    document.getElementById('Role').innerText = data.Role || "Not provided";
    document.getElementById('company').innerText = data.Company || "Not provided";
  }
  
  // Call displayAllEmployees when the page loads to show all employees
  document.addEventListener("DOMContentLoaded", function() {
    displayAllEmployees();
  });
  