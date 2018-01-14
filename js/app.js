/* Travel Planner - Udacity */

// QUESTIONS:
// * How could I put initMap and supporting functions in the ViewModel in the IIFE, that is currently commented out?

//(function() {
	//'use strict';

	// Model
	var locations = [
		{title: 'Trifork', location: {lat: 56.153944, lng: 10.212539}},
		{title: 'Köd Restaurant', location: {lat: 56.155178, lng: 10.209552}},
		{title: 'ARoS', location: {lat: 56.153919, lng: 10.199716}},
		{title: 'Stående Pige', location: {lat: 56.152135, lng: 10.200845}},
		{title: 'Den Gamle By', location: {lat: 56.158783, lng: 10.192115}},
		{title: 'Latiner Kvarteret', location: {lat: 56.158775, lng: 10.210766}},
		{title: 'Fitness World', location: {lat: 56.144076, lng: 10.199951}}
	];

	// Binding model to KO for automatic UI refresh
	var Marker = function(data) {
		this.title = ko.observable(data.title);
		this.lat = ko.observable(data.location.lat);
		this.lng = ko.observable(data.location.lng);
	}

	// ViewModel
	var ViewModel = function() {
		var self = this;
		
		// Initiate list of locations
		self.locationsList = ko.observableArray([]);
		locations.forEach(function(marker) {
			self.locationsList.push(new Marker(marker));
		});

		// Hide or show menu by clicking hamburger icon
		self.showMenu = ko.observable(true);
		self.ShowHideHamburgerMenu = function() {
			if (self.showMenu() == true) {
				self.showMenu(false);
				showListings();
			} else {
				self.showMenu(true);
				showListings();
			}
		};

		// Set current location by click at menu items
		self.currentLocation = ko.observable( self.locationsList()[0] );
		self.setCurrentLocation = function(newLocation) {
			// Initiate variables, to create markers at map
			self.currentLocation(newLocation);			
			var title = self.currentLocation().title()
			var id = getId(title);
			var array = createMarkerArray();

			var highlightedIcon = newMarkerIcon('FF9933');
			setIconOnMarker(array[id], highlightedIcon);
			
			var largeInfowindow = newMapsInfoWindow();//new google.maps.InfoWindow();
			setInfoWindowOnMarker(array[id], largeInfowindow)	
		};

	};

	ko.applyBindings(new ViewModel())

//})();

/* Google Maps API */

var map;
var markers = [];
var markerSelected;
var windowOpened;

function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 56.15431, lng: 10.207227},
		zoom: 15,
		mapTypeControl: false
	});

	populateMapWithMarkers();
	showListings();
};

function populateMapWithMarkers() {
	var infoWindow = newMapsInfoWindow();
	// Create a "highlighted location" marker color by click on marker
	var highlightedIcon = newMarkerIcon('FF9933');

	// Create marker for each entry in locations array
	for (var i = 0; i < locations.length; i++) {
		var position = locations[i].location;
		var title = locations[i].title;
		
		// Create a marker per location, and push into markers array.
		var marker = new google.maps.Marker({
			position: position,
			title: title,
			id: i
		});
		markers.push(marker);

		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', function() {
			setInfoWindowOnMarker(this, infoWindow);
		});

		marker.addListener('click', function() {
			setIconOnMarker(this, highlightedIcon)
		})
	};
	// Create Array of Maps markers to activate 
	// the true marker, when selecting list items
	createMarkerArray(markers);
}

function newMapsInfoWindow() {
	return new google.maps.InfoWindow();
}

// Control where to set info window
function setInfoWindowOnMarker(marker, infowindow) {
	if (windowOpened == null) {
		populateInfoWindow(marker, infowindow);
		windowOpened = infowindow;
	} else {
		windowOpened.close();
		populateInfoWindow(marker,infowindow);
		windowOpened = infowindow;
	}
};

// Control where to set marker
function setIconOnMarker(marker, highlightedIcon) {
	if (markerSelected == null) {
		marker.setIcon(highlightedIcon);
		markerSelected = marker;
	} else {
		markerSelected.setIcon(null);
		marker.setIcon(highlightedIcon);
		markerSelected = marker;
	}
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		// Clear the infowindow content to give the streetview time to load.
		infowindow.setContent('');
		infowindow.setContent('<div id="infoWindowContainer"><div id="infoWindowYelp"><p id="infoWindowTitle">' +
			marker.title + '</p><div id="yelpContent"><p id="yelpLoading">Retreiving information from Yelp, please wait...</p></div></div>' +
			'<div id="infoWindowStreet"><div id="infoWindowPano"></div></div></div>');
		infowindow.marker = marker;
		
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});
		//$('#infoWindowTitle').text("Yelp being loaded...");
		// Retreive data from Yelp and StreetView about marker location
		getStreetViewData(marker, infowindow);
		getYelpData(marker.title);

		// Open the infowindow on the correct marker.
		infowindow.open(map, marker);
	}
};

function getStreetViewData(marker, infowindow) {
	var streetViewService = new google.maps.StreetViewService();
	var radius = 50;
	
	// In case the status is OK, which means the pano was found, compute the
	// position of the streetview image, then calculate the heading, then get a
	// panorama from that and set the options
	function getStreetView(data, status) {
		if (status == google.maps.StreetViewStatus.OK) {
			var nearStreetViewLocation = data.location.latLng;
			var heading = google.maps.geometry.spherical.computeHeading(
			nearStreetViewLocation, marker.position);
			// infowindow.setContent('<div id="infoWindowTitle">' + marker.title + '</div><div id="infoWindowPano"></div>');
			var panoramaOptions = {
				position: nearStreetViewLocation,
				pov: {
					heading: heading,
					pitch: 30
				}
			};
			var panorama = new google.maps.StreetViewPanorama(
				document.getElementById('infoWindowPano'), panoramaOptions);
		} else {
			infowindow.setContent('<div>' + marker.title + '</div>' +
				'<div>No Street View Found</div>');
		}
	}

	// Use streetview service to get the closest streetview image within
	// 50 meters of the markers position
	streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
}
//	$(document).ajaxStart(function() {
//		$('#infoWindowYelp').text("Yelp being loaded...");
//	});
// AJAX call to server
function getYelpData(title) {
	$.ajax({
		dataType: "json",
		method: 'GET',
		url: 'http://localhost:808990/yelp-search',
		data: {
			'search_term': title,
			'search_location': 'Aarhus, DK'
		},
		error: function(data, status, error) {
			console.log(status)
			yelpErrorMessage(error);
		},
		success: function(data, status) { 
			populateInfoWindowWithYelpData(data);					
		}
	})
};

function yelpErrorMessage(error) {
	$("#locationTitle").html("Sorry! No information from Yelp is available. Please refer to the following error:" + error);
}

// Populate infowindow with Yelp Data
function populateInfoWindowWithYelpData(data) {
	if (data.no_business == true){
		$("#yelpContent").text(data.message);	
	} else {
		var imgSrc = setYelpStarsImg(data.rating);
		var openedNow;
		if (typeof data.hours != 'undefined') {
			openedNow = isOpenedNow(data.hours[0].is_open_now);
		} else {
			openedNow = "";
		}
		
		$("#yelpContent").html(
			'<div><p id="yelpCategory">'+data.categories[0].title+'</p>'+
			openedNow +	'<p id="yelpAddress">' + data.location.address1 + 
			', ' + data.location.city + ' in ' + data.location.country +
			'<p id="yelpPhone">Tlf.: ' + data.display_phone + '</p>' +
			'<div id="yelpImgs"><a href="' + data.url + '">' +
			'<img id="yelpReviewLogo" src="' + imgSrc + '"/>' +
			'<img id="yelpLogo" src="img/Yelp_trademark_RGB_outline.png"/>'+
			'</a>'+'</div>' + '<p id="yelpReviewCount">Based on ' +
			data.review_count + ' Reviews</p>' + '</div>');
	}
};

function isOpenedNow(is_open_now) {
	if (is_open_now == true) {
		return '<p id="yelpOpened">Open</p>'
	} else {
		return '<p id="yelpClosed">Closed</p>'
	}
}

function setYelpStarsImg(rating) {
	var imgSrc;
	if (rating == 5) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_5.png';
	} else if (rating == 4.5) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_4_half.png';
	} else if (rating == 4) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_4.png'
	} else if (rating == 3.5) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_3_half.png'
	} else if (rating == 3) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_3.png'
	} else if (rating == 2.5) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_2_half.png'
	} else if (rating == 2) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_2.png'
	} else if (rating == 1.5) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_1_half.png'
	} else if (rating == 1) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_1.png'
	} else if (rating == 0.5) {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_0_half.png'
	} else {
		return imgSrc = 'img/yelp_stars/web_and_ios/small/small_0.png'
	}
}

// Array of Maps markers in memory
// Used to set right infoWin
var createMarkerArray = (function(array) {
	return function() {
		return array;
	};
})(markers);

// Returns a title's id
function getId(title) {	
	// Create array of titles
	var titleArray = [];
	for (var i = 0; i < locations.length; i++) {
		titleArray.push(locations[i].title)
	}
	return titleArray.findIndex(function(search) {
		return search == title;
	});
};


// This function will loop through the markers array and display them all.
function showListings() {
	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
	};
	map.fitBounds(bounds);
};

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function newMarkerIcon(markerColor) {
	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21,34));
	return markerImage;
};

