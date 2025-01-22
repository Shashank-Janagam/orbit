// Function to check if a point is within a polygon (box)
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
        } else {
          document.getElementById("result").textContent = "You are outside the office range.";
          console.log("You are outside the polygon area.");
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
