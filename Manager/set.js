import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCib5ywnEJvXXIePdWeKZtrKMIi2-Q_9sM",
  authDomain: "geo-orbit-ed7a7.firebaseapp.com",
  projectId: "geo-orbit-ed7a7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const userUID = sessionStorage.getItem('userUID');

// Use async function for Firebase data fetching
async function fetchUserData() {
  if (!userUID) {
    console.log("No user is authenticated!");
    alert("Please sign in to proceed.");
    window.location.href = "/index.html"; // Redirect to login page
  } else {
    const company=sessionStorage.getItem('company');
    // const docRef = doc(db, `company/${company}/Location`, "PolygonData");
    const userRef = doc(db, `company/${company}/managers`, userUID); // Reference to the user's document
    const userDoc = await getDoc(userRef);
    if(!userDoc.exists()){
        // alert("Not a manager");
        window.location.href="/index.html";
        return 0;
    }
  }
}


let map;
let polygon;
let markers = [];
const userData =  fetchUserData(); // Fetch user data before checking


// Initialize map after page load
function initMap() {
  console.log('initMap function is being called');
  const defaultLocation = { lat: 0, lng: 0 };
  

  map = new google.maps.Map(document.getElementById("maps"), {
    center: defaultLocation,
    zoom: 2,
  });

  // Geolocation handling
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(userLocation);
        map.setZoom(14);

        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here!",
        });
      },
      () => {
        alert("Geolocation failed. Using default location.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }

  google.maps.event.addListener(map, "click", async (event) => {
    if (markers.length < 4) {
      addMarker(event.latLng);
    }

    if (markers.length === 4) {
      const userData = await fetchUserData(); // Fetch user data before checking
      if (userData!=0) {
        drawPolygon();
      } else {
        alert("You are not allowed to set location.");
      }
    }
  });
}

function addMarker(location) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
  });
  markers.push(marker);
}

function drawPolygon() {
  if (polygon) {
    polygon.setMap(null);
  }

  const polygonCoords = markers.map((marker) => marker.getPosition());

  polygon = new google.maps.Polygon({
    paths: polygonCoords,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
  });

  polygon.setMap(map);
  printCoordinates(polygonCoords);
}

async function saveCoordinatesToDatabase(coords) {
  try {
    const polygonData = {};
    coords.forEach((coord, index) => {
      polygonData[`lat${index + 1}`] = coord.lat();
      polygonData[`lng${index + 1}`] = coord.lng();
    });
    const company=sessionStorage.getItem('company');
    const docRef = doc(db, `company/${company}/Location`, "PolygonData");
    await setDoc(docRef, polygonData);

    console.log("Polygon coordinates saved successfully.");
    document.getElementById('fel').innerHTML=`<p>Location Saved Successfully</p>`; 

  } catch (error) {
    console.error("Error saving coordinates to Firestore:", error);
  }
}

function printCoordinates(coords) {
  const output = coords.map((coord, index) => {
    return `Point ${index + 1}: Lat ${coord.lat()}, Lng ${coord.lng()}`;
  });

  console.log(output.join("\n"));
  saveCoordinatesToDatabase(coords);
}

// Wait until the window is loaded to initialize the map
window.onload = function() {
  initMap();
};
