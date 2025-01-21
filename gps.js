// Haversine formula to calculate the distance between two coordinates (in kilometers)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
  
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
  
  // Function to draw a radius circle on the map
  function drawRadius(map, targetLocation, radiusInKm) {
    const circle = new google.maps.Circle({
      center: targetLocation, // Center of the circle
      radius: radiusInKm * 1000, // Radius in meters
      map: map, // The map instance
      fillColor: "#0000FF", // Fill color of the circle
      fillOpacity: 0.2, // Transparency of the fill
      strokeColor: "#0000FF", // Outline color of the circle
      strokeOpacity: 0.8, // Transparency of the outline
      strokeWeight: 2, // Thickness of the outline
      title: "Your Office Radius"
    });
  
    return circle;
  }
  
  // Function to get current location and check if it's within the target radius
  function getLocationAndCheckRadius() {
    const targetLat = 17.1973511; // Example target latitude (Office location)
    const targetLon = 78.5984766; // Example target longitude (Office location)
    const radius = 0.05; // Radius in kilometers (50 meters)
  
    const defaultLocation = { lat: targetLat, lng: targetLon };
    const map = new google.maps.Map(document.getElementById("map"), {
      center: defaultLocation,
      zoom: 16,
    });
    const map2 = new google.maps.Map(document.getElementById("map2"), {
        center: defaultLocation,
        zoom: 16,
      });
  
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        position => {
          const currentLat = position.coords.latitude;
          const currentLon = position.coords.longitude;
          console.log("Your current location: Latitude:", currentLat, "Longitude:", currentLon);
  
          const userLocation = { lat: currentLat, lng: currentLon };
          const targetLocation = { lat: targetLat, lng: targetLon };
  
          // Create a marker for the user's location
          new google.maps.Marker({
            position: userLocation,
            map: map2,
            title: "You are here",
          });
  
          // Create a marker for the target location (Office)
          new google.maps.Marker({
            position: targetLocation,
            map: map,
            title: "Office Location",
          });


  
          // Draw the radius circle on the map
          drawRadius(map, targetLocation, radius);
  
          // Calculate the distance between the current location and target location
          const distance = haversine(currentLat, currentLon, targetLat, targetLon);
          document.getElementById("radi").textContent ="Your at a Distance "+ distance.toFixed(2) + " km";
  
          // Check if the user is within the specified radius
          if (distance <= radius) {
            document.getElementById("result").textContent = "You are within the range of your Office";
            console.log("You are within the target radius of " + radius + " km.");
          } else {
            document.getElementById("result").textContent = "You are not within your Office Range";
            console.log("You are outside the target radius of " + radius + " km.");
          }
  
          map.setCenter(targetLocation); // Set map center to the office location
          map2.setCenter(userLocation);
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
  
  // Call the function to get location and check if within the radius
  getLocationAndCheckRadius();
  