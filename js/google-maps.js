/* Google Maps API */

var map;
var markers = [];
	
function initMap() {
	// Constructor creates a new map - only center and zoom are required.

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 56.15431, lng: 10.207227},
		zoom: 15,
		mapTypeControl: false
	});

	// Markers, once stored in db

	var locations = [
		{title: 'Trifork', location: {lat: 56.153944, lng: 10.212539}},
		{title: 'Köd Restaurant', location: {lat: 56.155178, lng: 10.209552}},
		{title: 'Aros', location: {lat: 56.153919, lng: 10.199716}},
		{title: 'Stående Pige', location: {lat: 56.152135, lng: 10.200845}},
		{title: 'Den Gamle By', location: {lat: 56.158783, lng: 10.192115}},
		{title: 'Latiner Kvarteret', location: {lat: 56.158775, lng: 10.210766}}
	]

	var largeInfowindow = new google.maps.InfoWindow();

	// Create a "highlighted location" marker color for when the user
    // click location.
	var highlightedIcon = makeMarkerIcon('FF9933');

		// The following group uses the location array to create an array of markers on initialize.
		for (var i = 0; i < locations.length; i++) {
		  // Get the position from the location array.
		  var position = locations[i].location;
		  var title = locations[i].title;
		  // Create a marker per location, and put into markers array.
		   var marker = new google.maps.Marker({
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i
		  });
		  // Push the marker to our array of markers.
		  markers.push(marker);
		  // Create an onclick event to open an infowindow at each marker.
		  var infoWindowOn = false;
		  marker.addListener('click', function() {
			populateInfoWindow(this, largeInfowindow);
		  });

          marker.addListener('click', function() {
            	this.setIcon(highlightedIcon);
        	});
          //marker.addListener('mouseout', function() {
          //  this.setIcon(null);
          //});
		}
		showListings();
		document.getElementById('show-listings').addEventListener('click', showListings);
		document.getElementById('hide-listings').addEventListener('click', hideListings);
}

      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      }

	  // This function will loop through the markers array and display them all.
	  function showListings() {
		var bounds = new google.maps.LatLngBounds();
		// Extend the boundaries of the map for each marker and display the marker
		for (var i = 0; i < markers.length; i++) {
		  markers[i].setMap(map);
		  bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
	  }

	  // This function will loop through the listings and hide them all.
	  function hideListings() {
		for (var i = 0; i < markers.length; i++) {
		  markers[i].setMap(null);
		}
	}

	  // This function takes in a COLOR, and then creates a new marker
      // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).

      function highlightMarker() {
      	var highlightedMarker = new google.maps.Marker({
      		animation: google.maps.Animation.BOUNCE
      	})
      }


      function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }
