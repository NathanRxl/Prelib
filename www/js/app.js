// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

"use strict";
var app = angular.module('starter', ['ionic'])

function getQueryVariable(variable) //A remplacer par une fonction angular directement
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

app.factory('VelibAPI', function($http) {
	var stations=[];

	return {
		getStationsfromAPI: function(){
			return $http({
    url: 'https://api.jcdecaux.com/vls/v1/stations', 
    method: "GET",
    params: {contract:'Paris', apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    })
		}
	}
})

app.controller('StoreController', function($scope,$http,VelibAPI){

    
	var onGeolocationSuccess = function(position) {
		$scope.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    VelibAPI.getStationsfromAPI().success(function(data){
        getNearestStation(data);
    });
        
		var getNearestStation = function(data) {
			$scope.stations = data;
			var stationPosition;
			var distanceToStation;
			for (var i=0; i<$scope.stations.length; i++) {
                stationPosition = new google.maps.LatLng($scope.stations[i].position.lat, $scope.stations[i].position.lng);
			   distanceToStation = google.maps.geometry.spherical.computeDistanceBetween($scope.userPosition, stationPosition);
			   $scope.stations[i].distance = distanceToStation;
			}
		}
		
	};

	function onError(error) {
		alert(//'code: '    + error.code    + '\n' +
			 // 'message: ' + error.message + '\n'
              'You need to accept geolocalisation to use this application'
             );
	}

	navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onError,{enableHighAccuracy: true});
    
	$scope.available_bike=function(){
	return  getQueryVariable("nb");
	}

	$scope.items = [
		{ id: 1 },
		{ id: 2 },
		{ id: 3 },
		{ id: 4 },
		{ id: 5 },
		{ id: 6 },
		{ id: 7 },
		{ id: 8 },
		{ id: 9 },
		{ id: 10 },
		{ id: 11 },
		{ id: 12 },
		{ id: 13 },
		{ id: 14 },
		{ id: 15 },
		{ id: 16 },
		{ id: 17 },
		{ id: 18 },
		{ id: 19 },
		{ id: 20 },
		{ id: 21 },
		{ id: 22 },
		{ id: 23 },
		{ id: 24 },
		{ id: 25 },
		{ id: 26 },
		{ id: 27 },
		{ id: 28 },
		{ id: 29 },
		{ id: 30 },
		{ id: 31 },
		{ id: 32 },
		{ id: 33 },
		{ id: 34 },
		{ id: 35 },
		{ id: 36 },
		{ id: 37 },
		{ id: 38 },
		{ id: 39 },
		{ id: 40 },
		{ id: 41 },
		{ id: 42 },
		{ id: 43 },
		{ id: 44 },
		{ id: 45 },
		{ id: 46 },
		{ id: 47 },
		{ id: 48 },
		{ id: 49 },
		{ id: 50 } ];
 });
 
app.directive("stationName", function() {
    return {
      restrict: 'E',
      templateUrl: "templates/station-name.html"
    };
});
                                                                                                        
var app = angular.module('myApp', ['ionic']);
app.config(function($stateProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    templateUrl: 'index.html'
  })
  .state('infos', {
    url: '/infos',
    templateUrl: 'infos.html'
  });
});                                                                                                                    
