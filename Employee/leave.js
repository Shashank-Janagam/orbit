// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection,addDoc, query, where, orderBy,getDocs,getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
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

// // // Check if the user is authenticated
// onAuthStateChanged(auth, async (user) => {
//     if (!user) {
//       alert("Access Denied. Please log in.");
//       window.location.href = "/index.html"; // Redirect to login page
//     }
//     alert(user);
// });
// Check if user is authenticated
// Get userEmail from sessionStorage
const userUID=sessionStorage.getItem('userUID');
const company=sessionStorage.getItem('company');
 // console.log(company);
 if(!userUID){
    alert("Access Denied. Please log in.");
      window.location.href = "/index.html"; 

 }

const userEmail=sessionStorage.getItem('userEmail')

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
function selectDate(dateCell) {
    const selectedDatesContainer = document.getElementById("selecteddates");

    const selectedDateValue = dateCell.querySelector("span").innerText;
    const month = document.getElementById("calendar__month").value;
    const year = document.getElementById("calendar__year").value;

    // Format the selected date in DD-MM-YYYY format
    const formattedDat = `${selectedDateValue.toString().padStart(2, '0')}-${(parseInt(month) + 1).toString().padStart(2, '0')}-${year}`;

    // Get the current number of selected date divs
    const selectedDates = selectedDatesContainer.querySelectorAll('.dates');

    // If the date is already selected, remove the selection
    if (dateCell.classList.contains("calendar__date--selected")) {
        dateCell.classList.remove("calendar__date--selected");

        // Remove the date div from the selected dates container
        let existingDateDiv = document.querySelector(`.dates[data-date="${formattedDat}"]`);
        if (existingDateDiv) {
            existingDateDiv.remove();
        }
    } else {
        // If the date is not selected, check if there are already 6 selected dates
        if (selectedDates.length >= 6) {
                document.getElementById('fel').innerHTML="You can Select maximum of 6 Dates";

                return; // Exit if limit is reached
        }

        // Mark the date as selected
        dateCell.classList.add("calendar__date--selected");

        // Create a new div for the selected date
        let dateDiv = document.createElement("div");
        dateDiv.classList.add("dates");
        dateDiv.setAttribute("data-date", formattedDat); // Store date as an attribute
        dateDiv.innerText = formattedDat;

        // Append to selected dates container inside leavedet
        selectedDatesContainer.appendChild(dateDiv);
    }
}



// Function to fetch attendance data from Firestore based on the selected date
let formattedDate=null;
let time=null;
fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata")
            .then(response => response.json())
            .then(async data => {
                const [month, day, year] = data.date.split("/");
                formattedDate = `${day}-${month}-${year}`;
                time = data.time.slice(0, 5); // Extract "HH:MM"

            })
            .catch(error => console.error("Error fetching IST time:", error));



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



document.getElementById("request").addEventListener('click', async() => {
    const selectedDatesContainer = document.getElementById("selecteddates");
let datearray=[];
    const fel=document.getElementById('fel');
    fel.innerHTML="";
    const selectedDates = selectedDatesContainer.querySelectorAll('.dates');
    selectedDates.forEach(datediv=>{
        datearray.push(datediv.innerText);

    });
    const textInput = document.getElementById("textmessage");
    const textMessage = textInput.value.trim();  
    textInput.value = ""; // Clear input immediately

    if(selectedDates.length==0){
        fel.innerHTML="No Dates Selected...!";
    }else{
    if (!textMessage) {
        fel.innerHTML="Please Fill the Reason";
    }else{
    try{
    const leaveref= await addDoc(collection(db,`company/${company}/Leave_Approvals`),{
        Date:formattedDate,
        Time:time,
        SelectedDates:datearray,
        EmployeeID:userEmail.replace("@gmail.com",""),
        Reason:textMessage,
        Status:"false",
    });
    
    datearray=[];
    const calendarDates = document.querySelectorAll(".calendar__date--selected");
    calendarDates.forEach(dateCell => {
        dateCell.classList.remove("calendar__date--selected");
    });
    fel.style.color="green";
    fel.innerHTML="Request Sent To concerned Manager";
    selectedDatesContainer.innerHTML="";
    }catch(error){
        alert(error);
    }
}
    }
});
try{
const leaves = collection(db, `company/${company}/Leave_Approvals`);
const q = query(leaves, where("EmployeeID", "==", userEmail.replace("@gmail.com","")));
const querySnapshot = await getDocs(q);
if (!querySnapshot.empty) {
    console.log(doc);
    const history=document.getElementById('history');
     // Assume the first result is the correct one
    // Display the selected employee's details in the profile form
    querySnapshot.forEach(doc=>{
        const leavedata=doc.data();
        const Date=leavedata.Date;
        const reason=leavedata.Reason;
        const status=leavedata.Status;
        const dateArray=leavedata.SelectedDates;
        let dateDiv = document.createElement("div");
        dateDiv.classList.add("leaves");

        if(status=="false"){
            dateDiv.style.backgroundColor="rgb(248, 221, 188)";
        }else{
            dateDiv.style.backgroundColor="rgb(184, 226, 194)";
        }
        let leaveDetailsHTML = `
        <div class="leave-details">
            <p class="rdate"><strong>Date: ${Date}</strong></p>
            <p class="res"><strong>Reason: ${reason}</strong></p>
            <p class="status"><strong>Status: ${status === "true" ? "Approved" : "Pending"}</strong></p>
        </div>
        <div class="dates-section">
            <p class="adates"><strong>Leave Dates:</strong></p>
            <ul class="leave-dates-list">
                <!-- Date items will be inserted here -->
            </ul>
        </div>
    `;
    
    
    // Loop through dateArray to display each date
    dateArray.forEach(date => {
        leaveDetailsHTML += `<li>${date}</li>`;
    });

    leaveDetailsHTML += `</ul>`;
    
    dateDiv.innerHTML = leaveDetailsHTML;
        // Append to selected dates container inside leavedet
        history.appendChild(dateDiv);



    });
  } else {
    document.getElementById("fell").style.display="block";
    document.getElementById("fell").innerHTML="No Leave Records";


  }


}catch(error){
    alert(error);
}


