let map = L.map('map').setView([40.897, -74.03], 16);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Remove the default zoom control (which is added automatically)
map.zoomControl.remove();

// Add a new zoom control at the desired location
L.control.zoom({
  position: 'bottomright' // or 'topleft', 'topright', 'bottomleft'
}).addTo(map);

// Create layer groups for different feature types
let buildingsLayer = L.layerGroup();
let parkingLayer = L.layerGroup();
let diningLayer = L.layerGroup();

// Store all features with their names and layers
let locationFeatures = [];
// console.log(locationFeatures)
let parkingIcon = L.icon({
  iconUrl: './assets/parking-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

let diningIcon = L.icon({
  iconUrl: './assets/food-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Custom layer to handle KML features
let customLayer = L.geoJSON(null, {
  style: function (feature) {
    // Style for polygons (buildings)
    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      return {
        fillColor: '#01579B',
        fillOpacity: 0.5,
        color: '#01579B',
        weight: 2,
        opacity: 0.7
      };
    }
    // Default style for other features
    return {};
  },
  pointToLayer: function (feature, latlng) {
    // Use custom parking icon
    if (feature.properties.styleUrl && feature.properties.styleUrl.includes('880E4F')) {
      return L.marker(latlng, { icon: parkingIcon });
    }
    // Use custom dining icon
    if (feature.properties.styleUrl && feature.properties.styleUrl.includes('0288D1')) {
      return L.marker(latlng, { icon: diningIcon });
    }
    // Default marker
    return L.marker(latlng);
  },
  onEachFeature: function (feature, layer) {
    // Existing popup and layer logic...
    let name = feature.properties?.name || 'Unnamed Location';
    locationFeatures.push({
      name: name,
      layer: layer
    });
    let popupContent = '<b>' + name + '</b>';
    if (feature.properties?.description) {
      popupContent += '<br>' + feature.properties.description;
    }
    layer.bindPopup(popupContent);

    // UNCOMMENT THIS IF YOU WANT TO BRING BACK OLD ANIMATION HANDLING
    // layer.on('popupopen', () => {
    //     setTimeout(() => {
    //         const img = document.querySelector('.leaflet-popup-content img');
    //         if (img) {
    //             map.panBy([0, -100], { animate: true, duration: 0.1 });
    //         }
    //     }, 10);
    // });

    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      layer.on('mouseover', function () {
        this.setStyle({
          fillOpacity: 0.8,
          weight: 3
        });
      });
      layer.on('mouseout', function () {
        this.setStyle({
          fillOpacity: 0.5,
          weight: 2
        });
      });
      buildingsLayer.addLayer(layer);
    } else if (feature.properties.styleUrl && feature.properties.styleUrl.includes('880E4F')) {
      parkingLayer.addLayer(layer);
    } else if (feature.properties.styleUrl && feature.properties.styleUrl.includes('0288D1')) {
      diningLayer.addLayer(layer);
    } else {
      buildingsLayer.addLayer(layer);
    }
  }
});

// Function to sort locations (numbers first, then letters)
function sortLocations(a, b) {
  // Extract the number part if it exists (e.g., "1. Bancroft Hall" → 1)
  const numA = parseInt(a.name.match(/^\d+/)?.[0] || Infinity);
  const numB = parseInt(b.name.match(/^\d+/)?.[0] || Infinity);

  // If both have numbers, sort numerically
  if (!isNaN(numA)) {
    if (!isNaN(numB)) {
      return numA - numB;
    }
    return -1; // Numbers come before non-numbers
  }
  if (!isNaN(numB)) return 1;

  // Otherwise sort alphabetically
  return a.name.localeCompare(b.name);
}

// Load the KML file
omnivore.kml('campus.kml', null, customLayer)
  .on('ready', function () {
    console.log(customLayer);

    // Add buildings layer by default
    buildingsLayer.addTo(map);

    // Check the state of the parking toggle before adding the parking layer
    if (document.getElementById('parking-toggle').checked) {
      parkingLayer.addTo(map);
    }

    // Check the state of the dining toggle before adding the dining layer
    if (document.getElementById('dining-toggle').checked) {
      diningLayer.addTo(map);
    }

    // Sort locations (numbers first, then alphabetically)
    locationFeatures.sort(sortLocations);

    // Populate the dropdown
    const select = document.getElementById('location-select');
    locationFeatures.forEach(feature => {
      const option = document.createElement('option');
      option.value = feature.name;
      option.textContent = feature.name;
      select.appendChild(option);
    });

    // Fit bounds to show all features
    map.fitBounds(this.getBounds());
  });

// Toggle controls
document.getElementById('parking-toggle').addEventListener('change', function (e) {
  if (e.target.checked) {
    parkingLayer.addTo(map); // Add the parking layer to the map
  } else {
    map.removeLayer(parkingLayer); // Remove the parking layer from the map
  }
});

document.getElementById('dining-toggle').addEventListener('change', function (e) {
  if (e.target.checked) {
    diningLayer.addTo(map); // Add the dining layer to the map
  } else {
    map.removeLayer(diningLayer); // Remove the dining layer from the map
  }
});


document.getElementById('location-select').addEventListener('change', function (e) {
  const selectedName = e.target.value;
  if (!selectedName) return;

  // Find the selected feature
  const selectedFeature = locationFeatures.find(f => f.name === selectedName);
  if (!selectedFeature) return;

  let center;
  let zoom = 16;

  // Check if the selected feature is a parking-related feature
  const isParkingFeature = selectedFeature.layer.options.icon?.options.iconUrl?.includes('parking-icon.png');
  const isDiningFeature = selectedFeature.layer.options.icon?.options.iconUrl?.includes('food-icon.png');

  if (isParkingFeature) {
    // Check if the parking toggle is off
    const parkingToggle = document.getElementById('parking-toggle');
    if (!parkingToggle.checked) {
      // Flip the parking toggle on
      parkingToggle.checked = true;

      // Add the parking layer to the map
      parkingLayer.addTo(map);
    }
  }

  if (isDiningFeature) {
    // Check if the dining toggle is off
    const diningToggle = document.getElementById('dining-toggle');
    if (!diningToggle.checked) {
      // Flip the parking toggle on
      diningToggle.checked = true;

      // Add the parking layer to the map
      diningLayer.addTo(map);
    }
  }
  ''
  // If it’s a polygon or MultiPolygon, grab its bounds and take the center of the bounds
  if (selectedFeature.layer.getBounds) {
    const bounds = selectedFeature.layer.getBounds();
    center = bounds.getCenter();
  } else {
    // It’s a point marker
    center = selectedFeature.layer.getLatLng();
  }

  // Center and zoom the map
  console.log('Setting Center ', center);

  // Use the `moveend` event to open the popup after the map finishes animating
  map.once('moveend', function () {
    // Open the popup only after the map has finished moving
    selectedFeature.layer.openPopup();
  });

  // Animate the map to the new center and zoom level
  map.setView(center, zoom, { animate: true });
});

