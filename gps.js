// Function to check if a point is within a polygon (box)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, doc,getDoc, setDoc,Timestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



function isPointInPolygon(point, polygon) {
  const x = point.lat;
  const y = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

// Function to draw a polygon (box) on the map
function drawPolygon(map, polygon) {
  const path = polygon.map(point => ({ lat: point.lat, lng: point.lng }));
  new google.maps.Polygon({
    paths: path,
    map: map,
    fillColor:"#18aff1",
    fillOpacity: 0.5,
    strokeColor: "#18aff1",
    strokeOpacity: 1,
    strokeWeight: 2,
    title: "Office Area"
  });
}

// Function to get current location and check if it's within the polygon
function getLocationAndCheckPolygon() {
  const polygon = [
    { lat: 17.1975195, lng: 78.5983140 }, // Top-left corner
    { lat: 17.1976073, lng: 78.5991066 }, // Top-right corner
    { lat: 17.1969238, lng: 78.5992008 }, // Bottom-right corner
    { lat: 17.1968527, lng: 78.5983751 }  // Bottom-left corner

    // { lat: 17.2115389, lng: 78.6033113 }, // Top-left corner
    // { lat: 17.2118795, lng: 78.6034384 }, // Top-right corner
    // { lat: 17.2117314, lng: 78.6037210}, // Bottom-right corner
    // { lat: 17.2115746, lng: 78.6036443 } 
  ]; // Replace with your fixed office coordinates

  const defaultLocation = { lat: polygon[0].lat, lng: polygon[0].lng };
  const map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 18,
    // mapTypeId: google.maps.MapTypeId.SATELLITE, // Set the map to Satellite view
    
  });
  const map2 = new google.maps.Map(document.getElementById("map2"), {
    center: defaultLocation,
    zoom: 16,
    // mapTypeId: google.maps.MapTypeId.SATELLITE, // Set to satellite view
  });

  drawPolygon(map, polygon);
  drawPolygon(map2, polygon);


  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      position => {
        const currentLat = position.coords.latitude;
        const currentLon = position.coords.longitude;
        console.log("Your current location: Latitude:", currentLat, "Longitude:", currentLon);

        const userLocation = { lat: currentLat, lng: currentLon };
        // Create a custom icon for the user's location (blue dot)

        // Create a marker for the user's location
        new google.maps.Marker({
          position: userLocation,
          map: map2,
          title: "You are here",
          // icon: userLocationIcon,
          
        });
        const targetLocation=polygon;

        

        // Check if the user is within the polygon
        const inside = isPointInPolygon(userLocation, polygon);
        if (inside) {
          document.getElementById("result").textContent = "You are within the office range.";
          console.log("You are within the polygon area.");
          logAttendance(); // Replace "user123" with the actual user ID


        } else {
          document.getElementById("result").textContent = "You are outside the office range.";
          console.log("You are outside the polygon area.");
          logAttendance(); // Replace "user123" with the actual user ID

        }

        map2.setCenter(userLocation); // Set map center to the user's location
        map.setCenter(targetLocation);
      },
      error => {
        console.error("Error getting location:", error);
        alert("There was an error retrieving your location. Please enable location services and try again.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Call the function to get location and check polygon
getLocationAndCheckPolygon();




async function logAttendance() {
  try {
    const collectionName = "company/Microsoft/Attendance"; // Firestore collection for attendance
    const userId = localStorage.getItem('userUID'); // Retrieve the user ID


     
        console.log("Authenticated user:", userId);
    
        // Now, fetch user data from Firestore
        const userRef = doc(db, "users", userId); // Reference to the user's document
        try {
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // User data exists, retrieve and display it
            const userData = userDoc.data(); 
            const currentDate = new Date();
            const date = currentDate.toISOString().split("T")[0]; // Extracts YYYY-MM-DD
            // const date1 = currentDate.toISOString().split("T")[0]; // Extracts YYYY-MM-DD

// Extracts HH:MM:SS (ensures 2-digit formatting)
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');
            const time = `${hours}:${minutes}:${seconds}`;
            
            const docId = `${userData.EmployeeID}_${currentDate.toISOString().split("T")[0]}`;

             const attendanceData = {

            EmployeeID:userData.EmployeeID,
              Role:userData.Role,
             Date: date,
             Time:time,

            attendanceTime: Timestamp.fromDate(currentDate),
    };
    
    await setDoc(doc(db, collectionName, docId), attendanceData);

    console.log("Attendance logged successfully!");
            
          } else {
            console.log("No user data found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
        }
      

    // Generate a unique ID for the document, such as combining userId and date
   

    // Create the attendance data
   

    // Add the attendance data to Firestore
    
  } catch (error) {
    console.error("Error logging attendance:", error);
  }
}

// Example Usage: Call the function with the user ID
