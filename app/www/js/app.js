// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

'use strict';
var app = angular.module('starter', ['ionic'])

//A remplacer par une fonction angular directement
//On peut avec angular utiliser des 'views' ce qui permet de naviguer dans la même page et ainsi avoir toujours accès aux variables

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

app.factory('PrelibAPI', function($http) {

	return {
		report: function(stationName,numberOfBike){
			return $http({
    url: 'prelib-api.herokuapp.com/create_report', 
    method: "POST",
    params: {stationName:stationName, numberOfBike:numberOfBike}
    })
		},
        
        getPredictionOfStations: function(stationId){
            return $http({
    url: 'prelib-api.herokuapp.com/stations', 
    method: "POST",
    params: {stationName:stationId}
    })
		}
	}
})

app.factory('VelibAPI', function($http) {

	return {
		getStationsfromAPI: function(){
			return $http({
    url: 'https://api.jcdecaux.com/vls/v1/stations', 
    method: "GET",
    params: {contract:'Paris', apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    })
		},
        getStationfromAPI: function(id){
			return $http({
    url: 'https://api.jcdecaux.com/vls/v1/stations/'+id, 
    method: "GET",
    params: {contract:'Paris', apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    })
		}
	}
})

app.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
        if ($window.localStorage[key]==undefined) {
            return null; }
        else {
      return JSON.parse($window.localStorage[key]);
        }
    }
  }
}]);

app.factory('LoaderService', function($rootScope, $ionicLoading) {
  return {
        show : function() {
            $rootScope.loading = $ionicLoading.show({
              // The text to display in the loading indicator
              content: '<i class="icon ion-looping"></i> Loading',
              // The animation to use
              animation: 'fade-in',
              // Will a dark overlay or backdrop cover the entire view
              showBackdrop: true,
              // The maximum width of the loading indicator
              // Text will be wrapped if longer than maxWidth
              maxWidth: 400,
              // The delay in showing the indicator
              showDelay: 0
            });
        },

        hide : function(){
            $rootScope.loading.hide();
        }
    }
});

app.controller('StationsController', function($scope,VelibAPI,$localstorage,LoaderService,$ionicLoading,$window,stations ){
    LoaderService.show();
    $scope.nbStationsToDisplay = 5;
    $scope.stations = stations;
    
    $scope.formatDate = function(){
        var d = $scope.date;
        if (d!=undefined) { return d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds(); }
        else { return "calculating...";}
    }
    
    var getNearestStation = function(data) {
			$scope.stations = data;
			var stationPosition;
			var distanceToStation;
			for (var i=0; i<$scope.stations.length; i++) {
               stationPosition = new google.maps.LatLng($scope.stations[i].position.lat, $scope.stations[i].position.lng);
			   distanceToStation = google.maps.geometry.spherical.computeDistanceBetween($scope.userPosition, stationPosition);
			   $scope.stations[i].distance = distanceToStation;
			}
            $localstorage.setObject('stations',data);
            console.log('stations data saved');
    }
    
    var onGeolocationSuccessDistancedRecomputed = function(position) {
		$scope.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $scope.date = new Date();
        $localstorage.setObject('last_connection',new Date().getTime());
        console.log("stations data load from storage but distance recomputed");
        var data = JSON.parse($localstorage.get('stations'));
        getNearestStation(data);
	};
    
    var onGeolocationSuccessRefresh = function(position) {
		$scope.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $scope.date = new Date();
        $localstorage.setObject('last_connection',new Date().getTime());
        console.log("all recomputed");
        VelibAPI.getStationsfromAPI().success(function(data){getNearestStation(data); });
	};

	function onError(error) {
		alert('code: '    + error.code    + '\n' +
			 'message: ' + error.message + '\n' +
              'You need to accept geolocalisation to use this application'
             );
	}
	
    $scope.doRefresh = function() {
        navigator.geolocation.getCurrentPosition(onGeolocationSuccessRefresh, onError,{enableHighAccuracy: true});
        $scope.$broadcast('scroll.refreshComplete');
    };    
    
    var date = new Date().getTime();
    $scope.date = new Date();
    var last_connection = $localstorage.getObject('last_connection');
    $localstorage.setObject('last_connection',date);
    var diff = date - last_connection;
        
    if (last_connection != null && $localstorage.get('stations') != null && diff < 10000){
        console.log("stations data load from storage");
        $scope.stations = JSON.parse($localstorage.get('stations'));
    }
    else if(last_connection != null && $localstorage.get('stations') != null && diff < 20000){
        navigator.geolocation.getCurrentPosition(onGeolocationSuccessDistancedRecomputed, onError,{enableHighAccuracy: true});
    }
    else {
        navigator.geolocation.getCurrentPosition(onGeolocationSuccessRefresh, onError,{enableHighAccuracy: true});
    }
    $ionicLoading.hide();  	
	
});

app.service('TodosService', function($q,$localstorage,LoaderService,VelibAPI) {
    LoaderService.show();
   
    var stationsData = null;
    
  return {
    stations: stationsData,
    getStations: function() {
        console.log("getStations");
      return this.stations
    },
    getStation: function(todoId) {
        console.log("getStation");
      /*var dfd = $q.defer()
      this.stations.forEach(function(station) {
        if (station.number == todoId) {
            dfd.resolve(station)}
      })
      return dfd.promise*/
        if ($localstorage.get('stations') != null) {
        console.log("NOT NULL");
        stationsData = JSON.parse($localstorage.get('stations'));
        var dfd = $q.defer()
        stationsData.forEach(function(station) {
        if (station.number == todoId) {
            dfd.resolve(station)}
      })
      return dfd.promise
    }
    else {
        console.log("NULL");
        VelibAPI.getStationsfromAPI().success(function(data){
            stationsData = data;
            var dfd = $q.defer()
             stationsData.forEach(function(station) {
        if (station.number == todoId) {
            dfd.resolve(station)}
      })
      return dfd.promise                                               
        });
    }
    }
  }
})
 
app.controller('ReportController', function($scope,$stateParams,$ionicPopup,PrelibAPI,$localstorage,station){
    
    $scope.station = station;
    
    function showAlert(numberOfBike) {
        var textToDisplay = "";
        if (numberOfBike==1){textToDisplay = "Merci d'avoir reporté un vélo";}
        else if (numberOfBike>1){textToDisplay = "Merci d'avoir signalé "+numberOfBike +" vélos";}
       var alertPopup = $ionicPopup.alert({
            title: "Prelib'",
            template: textToDisplay
        });
    };
    
    $scope.report = function(idStation,numberOfBike) {
        console.log([idStation,numberOfBike]);
        PrelibAPI.report(idStation,numberOfBike).success(function(data){
            console.log('POST resquest successfull');
            console.log(data);
        })
        .error(function(data){
            console.log('POST request failure');
            console.log(data);
        });
        showAlert(numberOfBike);
    }
    
    $scope.formatAddress = function(part) {
        var first = $scope.station.address.split("-")[0].toLowerCase();
        var firstPart = first.split(" ");
        var newFirstPart = "";
        for (var i=0; i<firstPart.length; i++) {
            newFirstPart = newFirstPart + firstPart[i].substr(0, 1).toUpperCase() + firstPart[i].substr(1) + " " ;
        }
        var second = $scope.station.address.split("-")[1].toLowerCase();
        var secondPart = second.split(" ");
        var newSecondPart = "";
        for (var i=0; i<secondPart.length; i++) {
            newSecondPart = newSecondPart + secondPart[i].substr(0, 1).toUpperCase() + secondPart[i].substr(1) + " " ;
        }
        if (part==1) { return newFirstPart; }
        else if (part==2) { return newSecondPart; }
    }
    
    var devList = new Array($scope.station.available_bikes+1);
    for (var i = 0; i < devList.length; i++) { devList[i]={name: i, id: i}; }
    $scope.devList = devList;
    
    var isIOS = ionic.Platform.isIOS();
    var isAndroid = ionic.Platform.isAndroid();
    var isWindowsPhone = ionic.Platform.isWindowsPhone();
    
    var mapsUrl = "https://maps.google.com?saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng;
    if (isIOS) { mapsUrl = "https://maps.apple.com?saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng;}
    else if (isAndroid) { mapsUrl = "https://maps.google.com?saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng; }
    else if (isWindowsPhone) { mapsUrl = "maps:saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng; }
    $scope.mapsUrl = mapsUrl;
    
});

app.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider
  .state('stations', {
    url: '/stations',
    controller: 'StationsController',
    templateUrl: 'stations.html',
    resolve: {
      stations: function(TodosService) {
        return TodosService.getStations()
      }
    }
  })
  .state('station', {
    url: '/stations/:stationID',
    controller: 'ReportController',
    templateUrl: 'station.html',
    resolve: {
      station: function($stateParams, TodosService) {
        return TodosService.getStation($stateParams.stationID)
      }
    }
  })
    $urlRouterProvider.otherwise('/stations');
});          

