/* Travel Planner - Udacity */

	// Model with data
//	var locations = [
//		{title: 'Dokk1', location: {lat: 56.153553, lng: 10.214211}},
//		{title: 'Magasin', location: {lat: 56.157123, lng: 10.206952}},
//		{title: 'ARoS', location: {lat: 56.153919, lng: 10.199716}},
//		{title: 'Musikhuset Aarhus', location: {lat: 56.152800, lng: 10.199335}},
//		{title: 'Den Gamle By', location: {lat: 56.158783, lng: 10.192115}},
//		{title: 'Latiner Kvarteret', location: {lat: 56.158775, lng: 10.210766}},
//		{title: 'Frederiksbjerg Idrætscenter', location: {lat: 56.144028, lng: 10.197061}},
//		{title: 'Marselisborg Dyrehave', location: {lat: 56.120410, lng: 10.219898}}
//	];

	// Data
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

		//this.title = ko.observable(data.title);
		//this.lat = ko.observable(data.location.lat);
		//this.lng = ko.observable(data.location.lng);
		//this.location = ko.observable(data)

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

		this.newMapsInfoWindow = function() {
			return new google.maps.InfoWindow();
		}

		  // basic location information from locations
		  this.location = marker.location;
		  this.title = marker.title;
		  this.id = marker.id;
		  this.lat = marker.lat;
		  this.lng = marker.lng;



		this.infoWindowContent = '<div id="infoWindowContainer"><div id="infoWindowYelp"><p id="infoWindowTitle">' +
					self.title + '</p><div id="yelpContent" data-bind="html: yelpMsg"><p id="yelpLoading">Retreiving information from Yelp, plea' +
					'se wait...</p></div></div><div id="infoWindowStreet"><div id="infoWindowPano" data-bind="html: googleError"></div></div></div>';

		this.marker = new google.maps.Marker({
			//map: map,
			//animation: google.maps.Animation.DROP,
			position: self.location,
			location: self.location,
			//map: map,
			title: self.title,
			show: true,
			infoWindowContent: self.infoWindowContent,
			id: self.id,
			newMarkerIcon: self.newMarkerIcon('FF9933'),
			newMapsInfoWindow: self.newMapsInfoWindow
		});
		//console.log("jeg kan se den"+this.initiateList());


	};
	

var viewModel = function() {

	// skulle ikke være nødvendigt med disse mærkelige vars!
//TEST!	var markers = [];

//var windowOpened;


	var self = this;

			
	
	// HERFRA TODO!	
	// Constructor creates a new map - only center and zoom are required.
	
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 56.15431, lng: 10.207227},
		zoom: 15,
		//scaleControl: true,
		mapTypeControl: false
	});


	this.infoWindow = new google.maps.InfoWindow();
	//console.log("hurray map lavet!")
	// Initiate list of locations
	this.locationsList = ko.observableArray([]);
	//T2 initiateList();

	//T2 function initiateList() {
		//T2 self.locationsList.removeAll();
		locations.forEach(function(marker) {
			self.locationsList.push(new locationModel(marker));
			//console.log(locationModel(marker))
		});
	//T2}
	
	

	// Create markers on map
			this.showListings = function() {
			//console.log("hello")
			var bounds = new google.maps.LatLngBounds();
			// Extend the boundaries of the map for each marker and display the marker

			self.locationsList().forEach(function(e){
				e.marker.setMap(map)
				bounds.extend(e.marker.position)
			})
			map.fitBounds(bounds);

	/*		for (var i=0; i<self.locationsList().length; i++) {
				var marker = self.locationsList()[i].marker;
				self.locationsList()[i].marker.setMap(map)

				//console.log(self.locationsList()[i].marker)

				bounds.extend(marker.position)
			}
			map.fitBounds(bounds);
*/
			/*
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(map);
				bounds.extend(markers[i].position);
			}
			map.fitBounds(bounds);
			*/
		}();
		// Fit map to markers
	//this.showListings();
	
	// Add window and highlight marker at click
	this.locationsList().forEach(function(e){
		//addListenerWindow(e.marker);
		//addListenerMarker(e.marker);
		e.marker.addListener('click', function() {
				self.setIconOnMarker(e.marker);//, highlightedIcon);
				self.populateInfoWindow(e.marker);
			});
		
	})
/*
		this.populateMapWithMarkers = function() {
			//var infoWindow = newMapsInfoWindow();
			// Create a "highlighted location" marker color by click on marker

			// kan slettes?
			//var highlightedIcon = newMarkerIcon('FF9933');

			// Create marker for each entry in locations array
			//console.log("hall: "+self.locationsList().length;)


			for (var i = 0; i < self.locationsList().length; i++) { // To-do: when this code is integrated with ViewModel, then should this refer to observable array instead.

				//var position = self.locationsList()[i].location; //Kan slettes?
				//var title = self.locationsList()[i].title; // Kan slettes? 
				//console.log(title)
				//console.log(position)
				// Create a marker per location, and push into markers array.
	//			var marker = new google.maps.Marker({
	//				position: position,
	//				title: title,
	//				infoWindowContent: infoWindowContent,
	//				id: i
	//			});
				
				//console.log(self.locationsList())
				var marker = self.locationsList()[i].marker;
				// hvis det hele konverteres, så skal denne væK!
				//TEST markers.push(marker);
				//console.log(marker)
				// Create an onclick event to open an infowindow and show a marker for each marker.
				addListenerWindow(marker); //infoWindow);
				addListenerMarker(marker);//, highlightedIcon);
			}
			// Create Array of Maps markers to activate 
			// the true marker, when clicking list items of menu
			// to do!
			//createMarkerArray(markers);
		}
this.populateMapWithMarkers();*/
		// integrer showListings med populateMapWithMarkers?
		// Fit map to markers






//PRØVES!
		// ER ÆNDRET!
	/*	function addListenerWindow(marker){//, infoWindow) {
			marker.addListener('click', function() {
				populateInfoWindow(marker);
				//setInfoWindowOnMarker(marker, infoWindow);
			}); 
*/
		//	marker.addListener('domready', function() {
		//		ko.applybindings(self, $("infoWindowContainer"));
		//		setInfoWindowOnMarker(marker, infoWindow)
		//	});
				/*
				 * When the info window opens, bind it to Knockout.
				 * Only do this once.
				 */
		//        google.maps.event.addListener(self.infoWindow, 'domready', function () {
		//            if (!isInfoWindowLoaded) {
		//                ko.applyBindings(self, $("#info-window")[0]);
		//               isInfoWindowLoaded = true;
		//            }
		//        });


////		}

/*		function addListenerMarker(marker){//, highlightedIcon) {
			marker.addListener('click', function() {
				setIconOnMarker(marker);//, highlightedIcon);
			});
		}
*/
		// TOdo - hvad gør jeg lige her? Hvordan kobler jeg sammen med list items?
		//this.infoWindow = newMapsInfoWindow();
		// Kan slettes!
//		function newMapsInfoWindow() {
//			return new google.maps.InfoWindow();
//		}


		// Slettes!!
		// Control where to set info window

		/*
		function setInfoWindowOnMarker(marker, infowindow) {
			if (windowOpened === undefined) {
				populateInfoWindow(marker, infowindow);
				windowOpened = infowindow;
			} else {
				windowOpened.close();
				populateInfoWindow(marker,infowindow);
				windowOpened = infowindow;
			}
		}
		*/

		// Kan også slettes? kan jeg ikke bare lave en icon, som infoWindow?
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
		
//this.infoWindowContent = '<div id="infoWindowContainer"><div id="infoWindowYelp"><p id="infoWindowTitle">' +
//				'marker.title' + '</p><div id="yelpContent"><p id="yelpLoading" data-bind="text: myMessage">Retreiving information from Yelp, plea' +
//				'se wait...</p></div></div><div id="infoWindowStreet"><div id="infoWindowPano"></div></div></div>';
	



		// Populates the infowindow when the marker is clicked.
		
		this.populateInfoWindow = function(marker){//, infowindow) { //slet evt. infowindow
			// Make sure the infowindow is not already opened on this marker.

			// ÆNDRER ALLE INFOWINDOW TIL SELF! + stort W!
			if (self.infoWindow.marker != marker) {
				//ko.applyBindings(model, $('.btn-modal-image')[0]); // re-apply button binding
				//var isInfoWindowLoaded = false;
				// Clear the infowindow content to give the streetview time to load.
				//var myMessage = ko.observable();
				//ko.applyBindings(new populateInfoWindow(), document.getElementByID('infoWindowContainer'));
				
				self.infoWindow.marker = marker;
				///infowindow.marker = marker;

				//self.infoWindow.setContent(marker.infoWindowContent);
				self.infoWindow.setContent(marker.infoWindowContent);
				//self.infoWindow.open(map, marker);
				self.infoWindow.open(map, marker);
				


				//infowindow.setContent('');
			//	infowindow.setContent('<div id="infoWindowContainer"><div id="infoWindowYelp"><p id="infoWindowTitle">' +
			//		marker.title + '</p><div id="yelpContent"><p id="yelpLoading" data-bind="text: myMessage">Retreiving information from Yelp, plea' +
			//		'se wait...</p></div></div><div id="infoWindowStreet"><div id="infoWindowPano"></div></div></div>');
				
				//console.log(self.myMessage())
				
				// Ensure that the marker property is cleared if the infowindow is closed.
				self.infoWindow.addListener('closeclick', function() {
					self.infoWindow.marker = null;
				});

				// Retreive data from Yelp and StreetView about marker location
				self.getStreetViewData(marker);
				self.getYelpData(marker.title);

				// Open the infowindow on the correct marker.
				//infowindow.open(map, marker);
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
					
					ko.cleanNode($('#infoWindowStreet')[0]); // remove previous button binding
					ko.applyBindings(model, $('#infoWindowStreet')[0]); // re-apply button binding

					
					self.googleError('<p id="googleErrorMsg">Sorry, no Google Street View found for ' + marker.title + '</p>');
					//infowindow.setContent('<div>' + marker.title + '</div>' +
					//	'<div>No Street View Found</div>');
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
			//self.myMessage("hello")
			ko.cleanNode($('#yelpContent')[0]); // remove previous button binding
			ko.applyBindings(model, $('#yelpContent')[0]); // re-apply button binding

			if (data.no_business === true){
				//console.log(self.myMessage())
				
				self.yelpMsg('<p id="yelpErrorMsg">' + data.message + '</p>')
				//self.yelpError(data.message)
				//$("#yelpContent").text(data.message);	
			} else {
				var imgSrc = self.setYelpStarsImg(data.rating);
				var openedNow;
				if (typeof data.hours != 'undefined') {
					openedNow = self.isOpenedNow(data.hours[0].is_open_now);
				} else {
					openedNow = "";
				}
				
				
				//self.yelpMsg
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

				
		//		$("#yelpContent").html(
		//			'<div><p id="yelpCategory">'+data.categories[0].title+'</p>'+
		//			openedNow +	'<p id="yelpAddress">' + data.location.address1 + 
		//			', ' + data.location.city + ' in ' + data.location.country +
		//			'<p id="yelpPhone">Tlf.: ' + data.display_phone + '</p>' +
		//			'<div id="yelpImgs"><a href="' + data.url + '">' +
		//			'<img id="yelpReviewLogo" src="' + imgSrc + '"/>' +
		//			'<img id="yelpLogo" src="img/Yelp_trademark_RGB_outline.png"/>'+
		//			'</a>'+'</div>' + '<p id="yelpReviewCount">Based on ' +
		//			data.review_count + ' Reviews</p>' + '</div>');
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

		// Array of Maps markers in memory, to set the right marker
		// and infowindow when list items is being clicked
		/*
		var createMarkerArray = (function(array) {
			return function() {
				return array;
			};
		})(markers);
		*/

		// kan slettes eller bruges i search?
		// Returns a title's id
		/*
		function getId(title) {	
			// Create array of titles
			var titleArray = [];
			for (var i = 0; i < locations.length; i++) {
				titleArray.push(locations[i].title);
			}
			return titleArray.findIndex(function(search) {
				return search == title;
			});
		} */


// Kopierete show listings herfra!

	// Kan slettes!!

		// This function takes in a COLOR, and then creates a new marker
		// icon of that color. The icon will be 21 px wide by 34 high, have an origin
		// of 0, 0 and be anchored at 10, 34).
		/*
		function newMarkerIcon(markerColor) {
			var markerImage = new google.maps.MarkerImage(
				'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
				'|40|_|%E2%80%A2',
				new google.maps.Size(21, 34),
				new google.maps.Point(0, 0),
				new google.maps.Point(10, 34),
				new google.maps.Size(21,34));
			return markerImage;
		} */

	 //Hertil TODO


		// Hide or show menu by clicking hamburger icon
		self.showMenu = ko.observable(true);
		self.ShowHideHamburgerMenu = function() {
			if (self.showMenu() === true) {
				self.showMenu(false);
				//showListings();
			} else {
				self.showMenu(true);
				//showListings();
			}
		};


		// Set current location by click at menu items
		self.currentLocation = ko.observable();
		self.setCurrentLocation = function(clickedItem) {
			// Initiate necessitated variables, to create marker at map
			self.currentLocation(clickedItem);	

			var marker = clickedItem.marker;
			map.setCenter(marker.getPosition());
			//map.setZoom(13);
			//toggleBounce(marker); // måske?
			
			//var highlightedIcon = newMarkerIcon('FF9933');
			//var largeInfowindow = newMapsInfoWindow();
			
			self.setIconOnMarker(marker);//, marker.newMarkerIcon);
			//setInfoWindowOnMarker(marker, self.infoWindow);
			self.populateInfoWindow(marker);
			
/*			console.log(marker)
			//console.log(newLocation)
			//console.log(self.currentLocation())		
			var title = self.currentLocation().marker.title;
			var id = getId(title);
			var array = createMarkerArray();

			var highlightedIcon = newMarkerIcon('FF9933');
			setIconOnMarker(array[id], highlightedIcon);
			
			var largeInfowindow = newMapsInfoWindow();
			setInfoWindowOnMarker(array[id], largeInfowindow); */
		};

		// Search function to find matching markers and list items
/*
		this.searchArray = function() {
			var searchArray = [];
			for (var i=0; i<self.locationsList().length; i++){
				searchArray.push(self.locationsList()[i].marker);
			}
			return searchArray;
		}
		*/

		// inputText value fra ipnut felt
		//searchLocations på key up. 

		this.updateMarkers = function(filteredLocations) {
		// Show all markers, if search bar is empty
		if (filteredLocations === false) {
			self.locationsList().forEach(function(e) {
				e.marker.setVisible(true);
			})
			return;
		}


		if (!filteredLocations.length) {
			self.locationsList().forEach(function(e) {
				e.marker.setVisible(false);
		  })
			return;
		};

		self.locationsList().forEach(function(e) {
			var found;
			filteredLocations.forEach(function(k) {
				if (e.id === k.id || found === true){
					//self.locationsList()[i].marker.setVisible(true);	
					e.marker.setVisible(true);
					found = true;
				} else {
					e.marker.setVisible(false);
					//self.locationsList()[i].marker.setVisible(false);

				} 
			})
		})			
		}

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


/*
		self.searchLocations = function() {
			var filterString = this.inputText().toLowerCase();
			// Hide showNoResults style
			self.showNoResults(false);

			// Initiate new list, to search all locations
			//var searchArray = self.searchArray();
			//console.log(searchArray);
			//T2 initiateList();
			// self.locationsList()[0].marker.setVisible(false)

			// Show all markers
			console.log(self.locationsList().length);
			for (var i=0; i<self.locationsList().length; i++) {
				self.locationsList()[i].marker.setVisible(true);
			}

		//	for (var x=0; x<markers.length; x++) {
		//		markers[x].setVisible(true);
		//	}; 

			// Initiate new list, if no results found
			if (nothingFound === true) {
				//T2 initiateList();
				nothingFound = false;
			}

			// Array to hold matching locations
			var foundLocations = [];
			var searchTerm = self.inputText().toString().toLowerCase();
			// Remember words, which do not match ALL chars in searchTerm in array
			var notFoundLocations = [];
			var match;
			


			// Search in list for search term
			if (searchTerm) {
				// Search each word in locations list
				for (var i=0; i<self.locationsList().length; i++) {
					var locationTitle = self.locationsList()[i].marker.title.toLowerCase();
					// Search each letter in search term
					for (var x=0; x<searchTerm.length; x++) {
						// If ALL letters in location's title match the searched word, then set matchTrue to true
						if (searchTerm[x] === locationTitle[x] && notFoundLocations[i] === undefined) {
							match = true;
						} else {
							match = false;							
							notFoundLocations.push(i);
							break;
						}
					}
					
					// Update array with all matching words
					if (match === true){
						foundLocations.push(i)
					}
				}
				
				// Update list with the matching words and non-matching words
				// Send both matching words, to decide if none are found and non-matching to remove those from list.
				self.updateListAndMap(foundLocations, notFoundLocations);
			}

			// Update list if search bar is empty
			if (searchTerm === "" || null || undefined) {
				console.log("toooom felt!");
				//searchArray;
				//initiateList();
			}
		};

*/
		// Show nothing found style
/*		var nothingFound;
		self.showNoResults = ko.observable();
		self.nothingFound = function (){
			// Remove all list items of menu and close infoWindow pop up
			
			self.infoWindow.close();
			
			// Hide all markers
			//for (var x=0; x<markers.length; x++) {
			for (var i=0; i<self.locationsList().length; i++) {
				
				//self.locationsList()[i].setMap(null);
				
				//self.locationsList()[i].marker.setMap(null);
				self.locationsList()[i].marker.setVisible(false);
				//markers[i].setVisible(false);
				//self.locationsList()[i].marker.setVisible(false);
				//markers[x].setVisible(false);
			};

			// er denne nødvendig? Ja, ift. at fjerne menu items. kunne også gøres med visble ko binding.
			//T2 her går det helt galt
			//self.locationsList.removeAll();

			// Show no results html element
			self.showNoResults(true);
			nothingFound = true;
		};
		
		//this.hideMenuItem = ko.observable(true);
		// Update list and map with matching locations
		self.updateListAndMap = function (foundLocations, notFoundLocations) {			
			// If no locations are found
			if (foundLocations.length === 0){
				self.nothingFound();
				return;
			}

			// TEST!
			console.log(self.locationsList().length)
			console.log(self.locationsList())
			self.locationsList()[0].marker.setVisible(null);
			//console.log(self.locationsList()[0].marker.visible)
			

			// Hide markers not found in search
			for (var i=0; i<self.locationsList().length; i++) {
				for (var k=0; k<notFoundLocations.length; k++) {
					if (notFoundLocations[k] === self.locationsList()[i].marker.id) {
						self.locationsList()[i].marker.setVisible(false);
						//self.hideMenuItem(false);
					}
				}
			}


			// Remove the locations elements from array, to show only the matching
			// Start from the last element, to avoid interferring with indexing after
			// splicing
			/*
			//var sum = self.locationsList().length;
			for (var z=notFoundLocations.length -1; z>= 0; z--) {
				self.locationsList.splice(notFoundLocations[z], 1);
			}
			*/
			
			// Mærkeligt at ovenfor fungerer locationsList uden ()?? med splice



			/*
			for (var i=0; i<markers.length; i++) {
				for (var k=0; k<notFoundLocations.length; k++) {
					if (notFoundLocations[k] === markers[i].id) {
						markers[i].setVisible(false);
					}
				}
			};
			*/

			// Update map according to markers
			//showListings();
/*
		};
*/
	};

	//ko.applyBindings(new ViewModel());

//})();

/* Google Maps API and related functions */


// Model!
var model;

function initMap() {
	// Apply data bindings to viewmodel
	model = new viewModel;
	ko.applyBindings(model);

}

// To do!
var mapsErrorHandler = function() {
	$(".container").append("<div class='google-error'>Google Maps can't be loaded</div>");

}
