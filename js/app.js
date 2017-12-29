/* Neighborhood Map Project - Udacity */

(function() {
	'use strict';
	console.log("Hello!");


	var ViewModel = function() {
		var self = this;
		// Data 
		var locations = [
			{title: 'Trifork', location: {lat: 56.153944, lng: 10.212539}},
			{title: 'Köd Restaurant', location: {lat: 56.155178, lng: 10.209552}},
			{title: 'Aros', location: {lat: 56.153919, lng: 10.199716}},
			{title: 'Stående Pige', location: {lat: 56.152135, lng: 10.200845}},
			{title: 'Den Gamle By', location: {lat: 56.158783, lng: 10.192115}},
			{title: 'Latiner Kvarteret', location: {lat: 56.158775, lng: 10.210766}}
		]

		// Initiate
		this.markerList = ko.observableArray([])

		locations.forEach(function(marker) {
			self.markerList.push(marker);
		});
	}

	ko.applyBindings(new ViewModel())

})();