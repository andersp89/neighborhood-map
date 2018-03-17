/* Travel Planner - Udacity */

// Data about locations
var locations = [
	{title: 'Dokk1', location: {lat: 56.153553, lng: 10.214211}, id:0},
	{title: 'Magasin', location: {lat: 56.157123, lng: 10.206952}, id:1},
	{title: 'ARoS', location: {lat: 56.153919, lng: 10.199716}, id:2},
	{title: 'Musikhuset Aarhus', location: {lat: 56.152800, lng: 10.199335}, id:3},
	{title: 'Den Gamle By', location: {lat: 56.158783, lng: 10.192115}, id:4},
	{title: 'Latiner Kvarteret', location: {lat: 56.158775, lng: 10.210766}, id:5},
	{title: 'Frederiksbjerg Idrætscenter', location: {lat: 56.144028, lng: 10.197061}, id:6},
	{title: 'Marselisborg Dyrehave', location: {lat: 56.120410, lng: 10.219898}, id:7}
];

// Binding model to KO for automatic UI refresh
var locationModel = function(marker) {
	var self = this;
	// This function takes in a COLOR, and then creates a new marker
	// icon of that color. The icon will be 21 px wide by 34 high, have an origin
	// of 0, 0 and be anchored at 10, 34).
	this.newMarkerIcon = function(markerColor) {
		var markerImage = new google.maps.MarkerImage(
			'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
			'|40|_|%E2%80%A2',
			new google.maps.Size(21, 34),
			new google.maps.Point(0, 0),
			new google.maps.Point(10, 34),
			new google.maps.Size(21,34));
		return markerImage;
	}

	// Google Maps infowindow
	this.newMapsInfoWindow = function() {
		return new google.maps.InfoWindow();
	}

	// Basic location information from locations array
	this.location = marker.location;
	this.title = marker.title;
	this.id = marker.id;
	this.lat = marker.lat;
	this.lng = marker.lng;

	this.infoWindowContent = '<div id="infoWindowContainer"><div id="infoWindowYelp"><p id="infoWindowTitle">' +
				self.title + '</p><div id="yelpContent" data-bind="html: yelpMsg"><p id="yelpLoading">Retreiving information from Yelp, plea' +
				'se wait...</p></div></div><div id="infoWindowStreet"><div id="infoWindowPano" data-bind="html: googleError"></div></div></div>';

	// Bind information to marker
	this.marker = new google.maps.Marker({
		position: self.location,
		location: self.location,
		title: self.title,
		show: true,
		infoWindowContent: self.infoWindowContent,
		id: self.id,
		newMarkerIcon: self.newMarkerIcon('FF9933'),
		newMapsInfoWindow: self.newMapsInfoWindow
	});
};
	

var viewModel = function() {
	var self = this;

	// Constructor creates a new map - only center and zoom are required.
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 56.15431, lng: 10.207227},
		zoom: 15,
		//scaleControl: true,
		mapTypeControl: false
	});

	this.infoWindow = new google.maps.InfoWindow();

	// Initiate list of locations
	this.locationsList = ko.observableArray([]);
	locations.forEach(function(marker) {
		self.locationsList.push(new locationModel(marker));
	});
	
	// Create markers on map
	// Fit map to markers
	this.showListings = function() {
		var bounds = new google.maps.LatLngBounds();
		// Extend the boundaries of the map for each marker and display the marker
		self.locationsList().forEach(function(e){
			e.marker.setMap(map)
			bounds.extend(e.marker.position)
		})
		map.fitBounds(bounds);
	}();
	
	// Add window and highlight marker at click
	this.locationsList().forEach(function(e){
		e.marker.addListener('click', function() {
			self.setIconOnMarker(e.marker);//, highlightedIcon);
			self.populateInfoWindow(e.marker);
		});
	})

	// Control where to set marker
	var markerSelected;
	this.setIconOnMarker = function(marker){//, highlightedIcon) {
		if (markerSelected === undefined) {
			marker.setIcon(marker.newMarkerIcon);
			markerSelected = marker;
		} else {
			markerSelected.setIcon(null);
			marker.setIcon(marker.newMarkerIcon);
			markerSelected = marker;
		}
	}
		
	// Populates the infowindow when the marker is clicked.
	this.populateInfoWindow = function(marker){
		// Make sure the infowindow is not already opened on this marker.
		if (self.infoWindow.marker != marker) {
			self.infoWindow.marker = marker;
			self.infoWindow.setContent(marker.infoWindowContent);
			self.infoWindow.open(map, marker);
							
			// Ensure that the marker property is cleared if the infowindow is closed.
			self.infoWindow.addListener('closeclick', function() {
				self.infoWindow.marker = null;
			});

			// Retreive data from Yelp and StreetView about marker location
			self.getStreetViewData(marker);
			self.getYelpData(marker.title);
		}
	}

	this.googleError = ko.observable();
	this.getStreetViewData = function(marker) {
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
				
				// Remove previous button binding
				ko.cleanNode($('#infoWindowStreet')[0]); 
				// Re-apply button binding
				ko.applyBindings(model, $('#infoWindowStreet')[0]); 

				
				self.googleError('<p id="googleErrorMsg">Sorry, no Google Street View found for ' + marker.title + '</p>');
			}
		}
		// Use streetview service to get the closest streetview image within
		// 50 meters of the markers position
		streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
	}

	// AJAX call to web server, to retrieve data from Yelp
	this.getYelpData = function(title) {
		$.ajax({
			dataType: "json",
			method: 'GET',
			url: 'http://localhost:8080/yelp-search',
			data: {
				'search_term': title,
				'search_location': 'Aarhus, DK'
			},
			error: function(data, status, error) {
				alert("Sorry! No information from Yelp is available. Please refer to the following error: " + status);
			},
			success: function(data, status) { 
				self.populateInfoWindowWithYelpData(data, title);
			}
		});
	}
		
	this.yelpMsg = ko.observable();
	// Populate infowindow with Yelp Data
	this.populateInfoWindowWithYelpData = function(data, title) {
		// Remove previous button binding
		ko.cleanNode($('#yelpContent')[0]);
		// Re-apply button binding
		ko.applyBindings(model, $('#yelpContent')[0]); 

		// Check if Yelp information is available and populate window
		if (data.no_business === true){
			self.yelpMsg('<p id="yelpErrorMsg">' + data.message + '</p>')
		} else {
			var imgSrc = self.setYelpStarsImg(data.rating);
			var openedNow;
			if (typeof data.hours != 'undefined') {
				openedNow = self.isOpenedNow(data.hours[0].is_open_now);
			} else {
				openedNow = "";
			}
			self.yelpMsg(
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
	}

	this.isOpenedNow = function(is_open_now) {
		if (is_open_now === true) {
			return '<p id="yelpOpened">Open</p>';
		} else {
			return '<p id="yelpClosed">Closed</p>';
		}
	}

	this.setYelpStarsImg = function(rating) {
		var imgSrc;
		if (rating == 5) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_5.png';
			return imgSrc;
		} else if (rating == 4.5) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_4_half.png';
			return imgSrc;
		} else if (rating == 4) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_4.png';
			return imgSrc;
		} else if (rating == 3.5) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_3_half.png';
			return imgSrc;
		} else if (rating == 3) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_3.png';
			return imgSrc;
		} else if (rating == 2.5) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_2_half.png';
			return imgSrc;
		} else if (rating == 2) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_2.png';
			return imgSrc;
		} else if (rating == 1.5) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_1_half.png';
			return imgSrc;
		} else if (rating == 1) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_1.png';
			return imgSrc;
		} else if (rating == 0.5) {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_0_half.png';
			return imgSrc;
		} else {
			imgSrc = 'img/yelp_stars/web_and_ios/small/small_0.png';
			return imgSrc;
		}
	}

	// Hide or show menu by clicking hamburger icon
	this.showMenu = ko.observable(true);
	this.showHideHamburgerMenu = function() {
		if (self.showMenu() === true) {
			self.showMenu(false);
		} else {
			self.showMenu(true);
		}
	};

	// Set current location by click at menu items
	this.currentLocation = ko.observable();
	this.setCurrentLocation = function(clickedItem) {
		// Initiate necessitated variables, to create marker at map
		self.currentLocation(clickedItem);	

		var marker = clickedItem.marker;
		map.setCenter(marker.getPosition());
		
		self.setIconOnMarker(marker);
		self.populateInfoWindow(marker);
	};


	this.updateMarkers = function(filteredLocations) {
		// Show all markers, if search bar is empty
		if (filteredLocations === false) {
			self.locationsList().forEach(function(e) {
				e.marker.setVisible(true);
			})
			return;
		}

		// Remove all markers, if no found
		if (!filteredLocations.length) {
			self.locationsList().forEach(function(e) {
				e.marker.setVisible(false);
		  })
			return;
		};

		// Remove markers, not found in filtered list
		self.locationsList().forEach(function(e) {
			var found;
			filteredLocations.forEach(function(k) {
				if (e.id === k.id || found === true){
					//self.locationsList()[i].marker.setVisible(true);	
					e.marker.setVisible(true);
					found = true;
				} else {
					e.marker.setVisible(false);
				} 
			})
		})			
	}

	// Filter list with search query
	self.searchQuery = ko.observable("");
	self.searchClick = ko.observable();	
	this.filteredLocations = ko.computed(function() {
		// Array to search in
		var originalLocations = self.locationsList();
		// Search string
		var searchQuery = self.searchQuery().toLowerCase();
		var searchClick = self.searchClick();
		
		// Show all markers and list items, if search bar is empty
		if (!searchQuery) {
		  self.updateMarkers(false);
		  return originalLocations;
		}

		// Filter list for search word
		var filteredLocations = originalLocations.filter(function(option) {
		  return option.title.toLowerCase().indexOf(searchQuery) === 0;
		});

		self.updateMarkers(filteredLocations);
		return filteredLocations;
	});



	};

var model;
function initMap() {
	// Apply data bindings to viewmodel
	model = new viewModel;
	ko.applyBindings(model);
}

var mapsErrorHandler = function() {
	$(".container").append("<div class='google-error'>Google Maps can't be loaded</div>");

}
