// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy,getDocs,getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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

  const userRef = doc(db, `company/${company}/managers`, userUID); // Fetch user data from Firestore
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

  if (company!=userData.Company) {
    alert("Session expired. Please log in again.");
    window.location.href = "/index.html";
    return;
  }

  try {
    // Check if the user role exists in the users collection
    const userRef = doc(db, `company/${company}/managers`, userUID); // Fetch user data from Firestore
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userRole = userData.Role; // Assuming the role is stored under 'role' in the user document

      if (userRole === "Manager") {
        console.log("User is a manager. Access granted.");
        sessionStorage.setItem('userRole', 'manager');
      } else {
        alert("Access Denied. Only managers can view this page.");
        await signOut(auth);
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
// Check if user is authenticated
// Get userEmail from sessionStorage
const userUID=sessionStorage.getItem('userUID');
const company=sessionStorage.getItem('company');
 // console.log(company);

const userEmail=sessionStorage.getItem('userEmail')


const search=document.getElementById("search");
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
      // Reference the attendance collection in Firestore
      const company = sessionStorage.getItem('company');
      const attendanceCollection = collection(db, `/company/${company}/Attendance`);

      // Get today's date (define todayDate here)
        // Format date as YYYY-MM-DD

      // Create query to filter by EmployeeID and Date <= Today
      const q = query(
          attendanceCollection,
          where("EmployeeID", "==", EmployeeID),  // Filter by EmployeeID
          orderBy("Date2", "desc")                 // Order by Date in descending order
      );

      // Fetch query results
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
          let tableRows = "";

          querySnapshot.forEach((doc) => {
              const data = doc.data();
              
              // Determine color for Status
          let statusColor = "green"; // Default to green
          if (data.Status === "Absent") {
            statusColor = "red";
          }
        
          // Build table rows with inline style for the status column
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
              <h2 id="fel">Employee Attendance Details</h2>
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

          // Insert content into profile class
          const pro=document.getElementById('profile');
          pro.style.display='block';
          document.getElementById('profile').innerHTML = profileContent;
      } else {
          console.log("No attendance records found for this EmployeeID.");
          document.getElementById('fel').innerHTML = "<p>Employee Not Found</p>";
      }
  } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
      document.getElementById('profile').innerHTML = "<p>Error fetching records. Please try again later.</p>";
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


function displayEmployeeProfile(data) {
  //   console.log(data.Dob);
  console.log("DOB: ", data.Dob);  // Check directly if it’s null or undefined
  console.log("Mobile: ", data.mobileNumber);  // Check directly if it’s null or undefined
  
  
  
      const imgElement = document.getElementById('userPhoto');
      
      // Set the image source to the fetched URL
      imgElement.src = data.photoURL;
    
      // Make the image visible after it's loaded
      imgElement.onload = function() {
        imgElement.style.display = 'block';   // Ensure it's visible
        imgElement.style.opacity = 1;   
             }       // Fade in effect (if using opacity)
      const pro=document.getElementById('profile1');
          pro.style.display='block';
          pro.style.opacity=1;
      
   
  
    // Update the UI with employee data
    document.getElementById("userName").innerText = data.name || "Not provided";
    document.getElementById("userEmail").innerText = data.email || "Not provided";
  //   document.getElementById("userPhoto").src = data.photoURL ; // Fallback to default image
    document.getElementById("dob").innerText = "Date of birth: " + (data.Dob || "Not provided");
    document.getElementById("userMobile").innerText = "Mobile: " + (data.mobileNumber || "Not provided");
    
    document.getElementById('role').innerText = data.Role || "Not provided";
    document.getElementById('company').innerText = data.Company || "Not provided";
  }


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

// let dateselected="date";
const EmployeeID=document.getElementById('empid').value;
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
    const formattedDat = `${selectedDateValue.toString().padStart(2, '0')}-${(parseInt(month) + 1).toString().padStart(2, '0')}-${year}`;
    

      empdate(formattedDat);

    
    // dateselected=formattedDate;
}

// Function to fetch attendance data from Firestore based on the selected date





// Function to show the calendar
// function showCalendar() {
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
// }

// Event listeners for the "Show Calendar" button
// document.getElementById("show-calendar-btn").addEventListener("click", showCalendar);

// Initial calendar generation on page load
window.onload = generateCalendar;

// Update calendar when month or year is changed
document.getElementById("calendar__month").addEventListener("change", generateCalendar);
document.getElementById("calendar__year").addEventListener("change", generateCalendar);





// async function empattend() {
    
    try {
      let formattedDate=null;
let time=null;

      try {
        const response = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata");
        const data = await response.json();
  
        // Extract date components
        const [month,day,year] = data.date.split("/"); // API returns YYYY-MM-DD
  
        // Format as YYYY/MM/DD
         formattedDate = `${day}-${month}-${year}`;
         time=data.time;
  
        console.log("Correct IST Time:", `${formattedDate} ${data.time}`);
    } catch (error) {
        console.error("Error fetching time:", error);
    }
      const company=sessionStorage.getItem('company');
      const attendanceCollection = collection(db, `/company/${company}/Attendance`);
        const q = query(attendanceCollection, where("Date", "==", formattedDate));
        const querySnapshot = await getDocs(q);
        
  
      if (!querySnapshot.empty) {
        const employeeList = document.getElementById('employeeList'); // Add this element in your HTML to display employees
        // employeeList.innerHTML = ''; // Clear the list first
  
        
        let tableRows = "";

        querySnapshot.forEach((doc) => {
          const data = doc.data();
        
          // Determine color for Status
          let statusColor = "green"; // Default to green
          if (data.Status === "Absent") {
            statusColor = "red";
          }
        
          // Build table rows with inline style for the status column
          tableRows += `
            <tr>
              <td>${data.Date || "--"}</td>
              <td>${data.EmployeeID || "--"}</td> 
              <td style="color: ${statusColor};">${data.Status || "--"}</td>
              <td>${data.Role || "--"}</td>
              <td>${data.Firstlogin || "--"}</td>
              <td>${data.Lastlogin || "--"}</td>
              <td>${data.Logindata || "--"}</td>
            </tr>
          `;
        });
        
        

       

        // Create table content
        const profileContent = `
            <h2 id="fel">Today Attendance Log</h2>
            <table class="styled-table">
                <thead>
                    <tr>
                        <th>Attended Date</th>
                        <th>Employee ID</th>
                        <th>Status</th>
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
        const pro=document.getElementById('profile');
        pro.style.display='block';
        document.getElementById('profile').innerHTML = profileContent;
        pro.style.width="700px";

   
      } else {
        console.log("No employees found.");
        const pro=document.getElementById('profile');
        pro.style.display='block';
        document.getElementById('profile').innerHTML = "No Employees Attended";
        pro.style.width="700px";
        
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  // }
  async function empdate(selectedDate) {
    try {
      const company = sessionStorage.getItem('company');
      const attendanceCollection = collection(db, `/company/${company}/Attendance`);
      const q = query(attendanceCollection, where("Date", "==", selectedDate));

      // Await the Firestore query
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
          let tableRows = "";

          querySnapshot.forEach((doc) => {
              const data = doc.data();
              let statusColor = "green"; // Default to green
              if (data.Status === "Absent") {
                statusColor = "red";
              }
              // Build table rows
              tableRows += `
                <tr>
                  <td>${data.Date || "-"}</td>
                  <td>${data.EmployeeID || "-"}</td>
              <td style="color: ${statusColor};">${data.Status || "--"}</td>
                  <td>${data.Role||"NA"}</td>
                  <td>${data.Firstlogin || "-"}</td>
                  <td>${data.Lastlogin || "-"}</td>
                  <td>${data.Logindata || "-"}</td>
                </tr>
              `;
          });

          // Create table content
          const profileContent = `
              <h2 id="fel">Attendance Details on ${selectedDate}</h2>
              <table class="styled-table">
                  <thead>
                      <tr>
                          <th>Attended Date</th>
                          <th>Employee ID</th>
                          <th>Status</th>
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
          const pro = document.getElementById('profile');
          pro.style.display = 'block';
          pro.style.width="700px";
          pro.innerHTML = profileContent;
      } else {
          document.getElementById('profile').innerHTML = `<p>No attendance records found for ${selectedDate}.</p>`;
      }
  } catch (error) {
      console.error("Error fetching attendance records from Firestore:", error);
      document.getElementById('profile').innerHTML = "<p>Error fetching records. Please try again later.</p>";
  }
}



const freeze=document.getElementById('freeze');
freeze.addEventListener("click", async () => {
  try {
    let formattedDate=null;
    let time=null;
    const company = sessionStorage.getItem('company');
    try {
      const response = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata");
      const data = await response.json();

      // Extract date components
      const [month,day,year] = data.date.split("/"); // API returns YYYY-MM-DD

      // Format as YYYY/MM/DD
       formattedDate = `${day}-${month}-${year}`;
       time=data.time;

      console.log("Correct IST Time:", `${formattedDate} ${data.time}`);
  } catch (error) {
      console.error("Error fetching time:", error);
  }
    const employeesCollection = collection(db, `/company/${company}/users`);
    const employeesSnapshot = await getDocs(employeesCollection);

    // Get the attendance data for the day
    const attendanceCollection = collection(db, `/company/${company}/Attendance`);
    const attendanceQuery = query(attendanceCollection, where("Date", "==", formattedDate));
    const attendanceSnapshot = await getDocs(attendanceQuery);

    const currentDate = new Date();

              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
              const day = String(currentDate.getDate()).padStart(2, '0'); // Day of the month
              const date = `${year}-${month}-${day}`; // Format as YYYY-MM-DD

            
    const attendedEmployeeIDs = new Set();
    attendanceSnapshot.forEach((doc1) => {
      const data = doc1.data();
      attendedEmployeeIDs.add(data.EmployeeID);
    });

    // Loop through employees and mark those who haven't attended as absent
    for (const doc2 of employeesSnapshot.docs) {
      const employee = doc2.data();
      const employeeID = employee.EmployeeID;

      if (!attendedEmployeeIDs.has(employeeID)) {
        try {
          // Create a document for the absent employee
          const attendanceDocRef = doc(db, `company/${company}/Attendance/${employeeID}_${formattedDate}`);
          await setDoc(attendanceDocRef, {
            EmployeeID: employeeID,
            Date: formattedDate,
            Date2:date,
            Status: "Absent",
            Role:employee.Role,
          });
          console.log("Attendance successfully marked as absent for:", employeeID);
        } catch (error) {
          console.error("Error freezing attendance and marking absent: ", error);
          alert(`Error freezing attendance for ${employeeID}: ${error.message}`);
        }
      }
    }

    // alert("Attendance has been frozen for today, and absent employees have been marked.");
    document.getElementById('fel').innerHTML="<p>Attendance has been frozen for today, and absent employees have been marked.</p>";
  } catch (error) {
    console.error("Error freezing attendance and marking absent:", error); 
    alert("Error freezing attendance. Please try again.");
  }
});
