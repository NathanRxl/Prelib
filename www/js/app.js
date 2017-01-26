// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

'use strict';
var app = angular.module('starter', ['ionic','leaflet-directive'])

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
		report: function(stationId,numberOfBikeAvailable,numberOfBikeBroken){
			return $http({
    url: 'https://prelib-api.herokuapp.com/report/'+stationId+'/'+numberOfBikeAvailable+'/'+numberOfBikeBroken+'/', 
    method: "GET"//,
    //params: {station_id:stationId, broken_bikes:numberOfBike}
    })
		},
        getPredictionOfStations: function(stationId){
            return $http({
    url: 'prelib-api.herokuapp.com/stations', 
    method: "POST",
    params: {station_id:stationId}
    })
		},
    //Get the json sent by Django app with the data over the last report
    getLast: function(stationId){
            return $http({
        url: 'https://prelib-api.herokuapp.com/report/'+stationId+'/', 
        method: "GET"
        })
    }
	}
})

app.factory('VelibAPI', function($http) {

	return {
		getStationsfromAPI: function(contractValue){
			return $http({
    url: 'https://api.jcdecaux.com/vls/v1/stations', 
    method: "GET",
    params: {contract:contractValue, apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    })
		},
        getStationfromAPI: function(contractValue,id){
			return $http({
    url: 'https://api.jcdecaux.com/vls/v1/stations/'+id, 
    method: "GET",
    params: {contract:contractValue, apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    })
		},
        getListContractfromAPI: function(){
			return $http({
    url: 'https://api.jcdecaux.com/vls/v1/contracts', 
    method: "GET",
    params: {apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
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

/////////////////////////////////////////////////////////////

var tryAPIGeolocation = function(successFunction, onError) {
    jQuery.post( "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDUqTtX0Jn1Cvo2ctI75deywOPbQHALFIo", function(success) {
        successFunction({coords: {latitude: success.location.lat, longitude: success.location.lng}});
  })
  .fail(function(err) {
    onError(err);
  });
};

/////////////////////////////////////////////////////////////

app.controller('StationsController', function($scope,$rootScope,VelibAPI,$localstorage,LoaderService,$ionicLoading,$window,stations ){
    LoaderService.show();
    if ($rootScope.nbStationsToDisplay!= undefined) 
        { $scope.nbStationsToDisplay = $rootScope.nbStationsToDisplay;}
    else { $scope.nbStationsToDisplay = 5;}
    $localstorage.setObject('nb_to_display',$scope.nbStationsToDisplay);
    $scope.stations = stations;
    
    $scope.formatDate = function(){
        var d = $scope.date;
        if (d!=undefined) { return d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds(); }
        else { return "calculating...";}
    }
    
     $scope.distanceToDisplay = function(distance){
        if (distance>=1000) { return "(à "+(distance/1000).toFixed(2)+" km)"; }
        else { return "(à "+distance.toFixed(0)+" m)"; }
    }
    
    $scope.backgroundColor = function(station){
        var ratio = (station.available_bikes/station.bike_stands).toFixed(2);
        if (ratio > 0.5) {return "rgba(165, 217, 254, 0.9) !important";}
        else if (ratio > 0.20)  {return "rgba(241, 202, 148, 0.9) !important";}
        else  {return "rgba(229, 141, 127, 0.9) !important";}
    }
    
    $scope.searchQuery = '';
    $scope.isSearching = false;
    
    $scope.clearSearch = function() {
        console.log('clearSearch');
        $scope.searchQuery = '';
        console.log($scope.isSearching);
    };
    
    $scope.showOrHideSearch = function() {
        console.log('showSearch');
        if ($scope.isSearching == false) { $scope.isSearching = true; }
        else { $scope.isSearching = false; }
        console.log($scope.isSearching);
    };
    
    var getNearestStation = function(data) {
			$scope.stations = data;
			var stationPosition;
			var distanceToStation;
			for (var i=0; i<$scope.stations.length; i++) {
               stationPosition = new google.maps.LatLng($scope.stations[i].position.lat, $scope.stations[i].position.lng);
			   distanceToStation = google.maps.geometry.spherical.computeDistanceBetween($scope.userPosition, stationPosition);
			   $scope.stations[i].distance = distanceToStation;
			}
            $localstorage.setObject("stations"+$rootScope.contract,data);
    }
    
    var onGeolocationSuccessDistancedRecomputed = function(position) {
        console.log(diff/1000);
		$scope.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $scope.date = new Date();
        $localstorage.setObject('last_connection',new Date().getTime());
        console.log("stations data load from storage but distance recomputed");
        var data = $localstorage.getObject("stations"+$rootScope.contract);
        getNearestStation(data);
	};
    
    var onGeolocationSuccessRefresh = function(position) {
        console.log(diff/1000);
		$scope.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $scope.date = new Date();
        $localstorage.setObject('last_connection',new Date().getTime());
        console.log("all recomputed");
        VelibAPI.getStationsfromAPI($rootScope.contract).success(function(data){getNearestStation(data); });
	};

	var onError = function(error) {
		alert('code: '    + error.code    + '\n' +
			 'message: ' + error.message + '\n' +
              'You need to accept geolocalisation to use this application'
             );
	}
	
    $scope.doRefresh = function() {
        tryAPIGeolocation(onGeolocationSuccessRefresh, onError);
        // navigator.geolocation.getCurrentPosition(onGeolocationSuccessRefresh, onError,{enableHighAccuracy: true});
        $scope.$broadcast('scroll.refreshComplete');
    };    
    
    var date = new Date().getTime();
    $scope.date = new Date();
    var last_connection = $localstorage.getObject('last_connection');
    $localstorage.setObject('last_connection',date);
    var diff = date - last_connection;
        
    if (last_connection != null && $localstorage.getObject("stations"+$rootScope.contract) != null && diff < 20000){
        console.log("stations data load from storage");
        $scope.stations = JSON.parse($localstorage.get("stations"+$rootScope.contract));
        $ionicLoading.hide();
    }
    else if(last_connection != null && $localstorage.getObject("stations"+$rootScope.contract) != null && diff < 60000){
        // navigator.geolocation.getCurrentPosition(onGeolocationSuccessDistancedRecomputed, onError,{enableHighAccuracy: true});
        tryAPIGeolocation(onGeolocationSuccessDistancedRecomputed, onError);
        $ionicLoading.hide();
    }
    else {
        tryAPIGeolocation(onGeolocationSuccessRefresh, onError);
        // navigator.geolocation.getCurrentPosition(onGeolocationSuccessRefresh, onError,{enableHighAccuracy: true});
        $ionicLoading.hide();
    }
      	
	
});

app.service('TodosService', function($q,$localstorage,LoaderService,VelibAPI,$rootScope) {
    LoaderService.show();
   
    if ($rootScope.contract == undefined && $localstorage.get('contract')==null) { $rootScope.contract = 'Paris';}
    else if ($rootScope.contract == undefined && $localstorage.get('contract') != null) {$rootScope.contract = $localstorage.get('contract');}
    console.log($rootScope.contract);
    var stationsData = null;
    
  return {
    stations: stationsData,
    getStations: function() {
        console.log("getStations");
      return this.stations
    },
    getStation: function(todoId) {
        console.log("getStation");
        if ($localstorage.getObject("stations"+$rootScope.contract) != null) {
        console.log("NOT NULL");
        stationsData = $localstorage.getObject("stations"+$rootScope.contract);
        var dfd = $q.defer()
        stationsData.forEach(function(station) {
        if (station.number == todoId) {
            dfd.resolve(station)}
      })
      return dfd.promise
    }
    else {
        console.log("NULL");
        VelibAPI.getStationsfromAPI($rootScope.contract).success(function(data){
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

app.service('favService', function(TodosService,$localstorage,$rootScope,$ionicPopup) {
    
    var isadded = function(StationId){
        var isadded=true
        var fav=$localstorage.getObject('favorites')
        if(fav!=null){
        var favnumber=[]
        for(var iter=0;iter<fav.length;iter++)
            {favnumber[iter]=fav[iter].number}
        var bool=favnumber.indexOf(StationId)
        if(bool!=-1){isadded=false}}
        return isadded;
    }
    
    return {
    addFav: function(StationId) {
        TodosService.getStation(StationId).then(function(station){
        if (station != null || station != undefined){
        var fav=$localstorage.getObject('favorites');
        if(isadded(StationId)==true){
        console.log("added to Favorites",station)
        if(fav==null)
            { fav=[station];
              $localstorage.setObject('favorites',fav);}
        else
            {fav.push(station)
        $localstorage.setObject('favorites',fav);}
        console.log("list_fav",fav)
         $ionicPopup.alert({
            title:'Favorites',
            template:'This station has been added to Favorites'
        })
        return fav;}
        else{
            var favnumber=[]
            for(var iter=0;iter<fav.length;iter++)
            {favnumber[iter]=fav[iter].number}
            fav.splice(favnumber.indexOf(StationId),favnumber.indexOf(StationId));
            console.log("fav_delete",fav)
            $localstorage.setObject("favorites",fav)
            $ionicPopup.alert({
            title:'Favorites',
            template:'This station has been deleted from Favorites'
        })
            return fav;
        }
        }
    });
    },
    ifadded: function(StationId,type) {
        var style;
        if(isadded(StationId)==true){ 
            if(type==1) {style='white'}
            else if(type==2) {style='grey'}
        }
        else{style='yellow';}
        return style;
    }
    }
})
app.controller('ReportController', function($scope,$stateParams,$ionicPopup,PrelibAPI,$localstorage,$ionicActionSheet,$state,station,favService){
    
    $scope.station = station;
    var ratio = ($scope.station.available_bikes/$scope.station.bike_stands).toFixed(2);
    if (ratio > 0.5) {$scope.backgroundColor="rgba(165, 217, 254, 0.9)";}
    else if (ratio > 0.20)  {$scope.backgroundColor="rgba(241, 202, 148, 0.9)";}
    else  {$scope.backgroundColor="rgba(229, 141, 127, 0.9)";}

    GetLastReport();
    
    function showAlert(numberOfBike) {
        var textToDisplay = "";
        if (numberOfBike==1){textToDisplay = "Merci d'avoir reporté un vélo";}
        else if (numberOfBike>1){textToDisplay = "Merci d'avoir signalé "+numberOfBike +" vélos";}
       var alertPopup = $ionicPopup.alert({
            title: "Prelib'",
            template: textToDisplay
        });
    };
    
    function GetLastReport(){
    PrelibAPI.getLast($scope.station.number).success(function(data){
        console.log('last report data from heroku db',data);
        if (typeof(data) === 'object'){
            var dmy = data.report_date.split(" ")[0].split("\\");
            var hms = data.report_date.split(" ")[1].split(":");
            var diff = new Date()-(new Date(dmy[2],dmy[1]-1,dmy[0],hms[0],hms[1],hms[2]));
            diff = diff - 1000*60*60*2 //2 heures de décalages avec le serveur
            var time="0s";
            if (diff/(1000*60*60*24)>1){time=Math.floor(diff/(1000*60*60*24))+"d";}
            else if (diff/(1000*60*60)>1){time=Math.floor(diff/(1000*60*60))+"h";}
            else if (diff/(1000*60)>1){time=Math.floor(diff/(1000*60))+"m";}
            else if (diff/(1000)>=0){time=Math.floor(diff/1000)+"s";}
            $scope.LastReportValue=data.broken_bikes+" broken bikes ("+time+")";
        }
        else{  $scope.LastReportValue=data };
    })
    };
    
    $scope.report = function(idStation,numberOfBike) {
        console.log([idStation,numberOfBike]);
        PrelibAPI.report(idStation,$scope.station.available_bikes,numberOfBike).success(function(data){
            console.log('POST resquest successfull');
            console.log(data);
            GetLastReport();
        })
        .error(function(data){
            console.log('POST request failure');
            console.log(data);
        });
        showAlert(numberOfBike);
        
    }    
    
    
    
    $scope.formatAddress = function() {
        var first = $scope.station.address.split("-")[0].toLowerCase();
        first = first.substr(0, 1).toUpperCase() + first.substr(1);
        return first + "-" + $scope.station.address.split("-")[1];
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
    
    // Triggered on a button click, or some other target
    $scope.showMapChoices = function() {

   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Native maps' },
       { text: 'Prelib map' }
     ],
     //destructiveText: 'Delete',
     titleText: 'Where to visualize this station ?',
     cancelText: 'Cancel',
     cancel: function() {
        },
     buttonClicked: function(index) {
         console.log(index);
         if (index == 0) {window.location.href = mapsUrl;}
         else if (index == 1) {
             //$state.go('tabs.maps');
             $state.transitionTo('tabs.maps', {stationID: $scope.station.number});
         }
       return true;
     }
   });
    }

    $scope.ifadded = function(StationId){ return favService.ifadded(StationId,1); };
    $scope.addtoFav = function(StationId) { favService.addFav(StationId); };

    
});

app.service('mapService', function($rootScope) {
    return {
    getCenter: function() {
        if ($rootScope.center!=undefined) { return $rootScope.center; }
        else {return null; }
    },
    getZoom: function() {
        if ($rootScope.zoom!=undefined) { return $rootScope.zoom; }
        else {return null; }
    },
    getBounds: function() {
        if ($rootScope.bounds!=undefined) { return $rootScope.bounds; }
        else {return null; }
    },
    setCenter: function(center) {
        //console.log(center);
        $rootScope.center = center;
    },
    setZoom: function(zoom) {
        //console.log(zoom);
        $rootScope.zoom = zoom;
    },
    setBounds: function(bounds) {
        //console.log(bounds);
        $rootScope.bounds = bounds;
    }
    }
})

app.controller("MapCtrl", function($scope,VelibAPI,mapService,$localstorage,$stateParams,$q,$rootScope,$compile,$ionicPopup,favService) {
    
    console.log($rootScope.contract);
    if ($rootScope.contract == undefined) { $rootScope.contract = 'Paris';}
    console.log($rootScope.contract);
    
    var map;
    if (map == undefined) { 
    console.log('initializing map');
    map = L.map('map',{ zoomControl:false });
    L.tileLayer('http://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoiZW1pbGVtYXRoaWV1IiwiYSI6IkhURVU2SFUifQ.1K2LjZmtAhfY-VmuAKXS_w', {
            zoom : 16,
			maxZoom: 17,
            minZoom: 6/*,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',*/
    }).addTo(map);
    }
    
    var centerIcon = L.AwesomeMarkers.icon({
                    icon: 'ion-person',
                    markerColor: 'lightgray',
                    prefix: 'ion',
                    html: ''
                });
    
    //var markerCenter = L.marker();
    var markerCenter = L.userMarker({smallIcon:true});
    var circleCenter = L.circle();
    
    var date = new Date().getTime();
    $scope.date = new Date();
    var last_connection = $localstorage.getObject('last_connection');
    $localstorage.setObject('last_connection',date);
    var diff = date - last_connection;
 
    var markers1 = new L.layerGroup();
    var markers2 = new L.layerGroup();
    
    function onLocationFound(e) {
        console.log(e);
        var radius = e.accuracy / 2;
        //circleCenter.setLatLng(e.latlng);
        //circleCenter.setRadius(radius);
        //circleCenter.addTo(map);
        markerCenter.setLatLng(e.latlng);
        markerCenter.setAccuracy(e.accuracy);
        markerCenter.setPulsing(true);
        //markerCenter.setIcon(centerIcon);
        markerCenter.addTo(map);
        map.setView(markerCenter.getLatLng(),16); 
        markerCenter.bindPopup("You are within " + radius.toFixed(0) + " meters from this point");
    }

    function onGeoLocationFound(e) {
        console.log(e);
        var accuracy = 2000;
        var radius = accuracy / 2;
        markerCenter.setLatLng({lat:e.coords.latitude, lng:e.coords.longitude});
        markerCenter.setAccuracy(accuracy);
        markerCenter.setPulsing(true);
        markerCenter.addTo(map);
        map.setView(markerCenter.getLatLng(),16); 
        markerCenter.bindPopup("You are within " + radius.toFixed(0) + " meters from this point");
    }

    map.on('locationfound', onLocationFound);
    
    function onLocationError(e) {
        alert(e.message);
    }
    map.on('locationerror', onLocationError);
    
    $scope.locate = function(){
        tryAPIGeolocation(onGeoLocationFound, onLocationError);
        // map.locate({setView: true, enableHighAccuracy: true, maxZoom :16});
    }
    
    $scope.isInversed= false;
    $scope.title = "<i class='icon ion-reply'></i> Pick Up";
    $scope.updateNeed = function() {
        loadStationsMarkers2();
        if ($scope.title == "<i class='icon ion-reply'></i> Pick Up") {$scope.title = "<i class='icon ion-forward'></i> Drop Off";}
        else {$scope.title = "<i class='icon ion-reply'></i> Pick Up"; }
    }
    
    $scope.refresh = function(){
        VelibAPI.getStationsfromAPI($rootScope.contract).success(function(data){ $scope.stations = data;})
        loadStationsMarkers2();
    }
    
    
    $scope.addtoFav = function(StationId) { favService.addFav(StationId,2);};
    $scope.ifadded=function(StationId){ return favService.ifadded(StationId);};

    
    var loadStationsMarkers2 = function() {
        if (markers2 != undefined) { map.removeLayer(markers2); }
    markers2 = new L.MarkerClusterGroup({disableClusteringAtZoom: 15, iconCreateFunction: function (cluster) {
				var markers = cluster.getAllChildMarkers();
                var ratio;
				var totalAvailable = 0;
                var totalCapacity = 0;
				for (var i = 0; i < markers.length; i++) {
					totalAvailable += markers[i].available;
                    totalCapacity += markers[i].capacity;
				}
                ratio = (100*totalAvailable/totalCapacity).toFixed(0);
            if ($scope.isInversed) { ratio = 100 - ratio; }
				var c = ' marker-cluster-';
                if (ratio > 50) { c += 'lightblue';}
                else if (ratio > 20) {c += 'beige';} 
                else { c += 'lightred';}
            if (ratio < 100) { ratio = ratio + '%';}
		      return new L.DivIcon({ html: '<div><span>' + ratio + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
			}
    });

    angular.forEach($scope.stations, function(station) {
        var color,textOnMArker;
        var ratio = (station.available_bikes/station.bike_stands).toFixed(2);
        if ($scope.isInversed) {
            ratio = 1 - ratio;
            textOnMArker = station.bike_stands-station.available_bikes;
        }
        else { textOnMArker = station.available_bikes; }
        if (ratio > 0.5) {color='lightblue';}
        else if (ratio > 0.20)  {color='beige';}
        else  {color='lightred';}
        var customIcon = L.AwesomeMarkers.icon({
              icon: '',
              markerColor: color,
              prefix: 'fa',
              html: textOnMArker
        });
        var marker = L.marker([station.position.lat, station.position.lng],{clickable:true,icon: customIcon});
        marker.available = station.available_bikes;
        marker.capacity = station.bike_stands;
        var html = '<div style="display:inline-block;margin:0px;margin-left:-1em;margin-bottom:-1em;margin-top:-0.5em;margin-right:-1em"> <div style="display:inline-block;margin-right:0.5em;text-decoration:none"><a ng-click="addtoFav('+station.number+')" ng-style="{color:ifadded('+station.number+')}" class="icon ion-star" style="font-size:3em"></a> </div><div style="display:inline-block;text-align:center;"> <a style="text-decoration: none" href="#/tabs/stations/'+station.number+'">'+station.name.slice(8)+'</a>'+'<br>'+station.available_bikes+' / '+station.bike_stands+'</div> </div>',
    linkFunction = $compile(angular.element(html));
    var newScope = $scope.$new();
        
        
        /*marker.bindPopup("<div style='display:inline-block;margin:0px;margin-left:-1em;margin-bottom:-1em;margin-top:-0.5em;margin-right:-1em'> <div ng-click='addtoFav()' style='display:inline-block;margin-right:0.5em'> <a class='icon ion-star energized' style='font-size: 3em'></a> </div> <div style='display:inline-block;text-align:center;'> <a style='text-decoration: none' href='#/tabs/stations/"+station.number+"'>"+station.name.slice(8)+"</a>"+"<br>"+station.available_bikes+" / "+station.bike_stands+"</div></div>");*/
        //ui-sref='tabs.station({stationID: "+station.number+ "})
        marker.bindPopup(linkFunction(newScope)[0]);
        markers2.addLayer(marker);        
    })
    map.addLayer(markers2);
    }
        
     map.on('moveend', function(e) {
         //loadStationsMarkers2();
        //mapService.setZoom(map.getZoom());
        //mapService.setCenter(map.getCenter());
        //mapService.setBounds(map.getBounds());
    });
    
    if ($stateParams.stationID == undefined || $stateParams.stationID == '' || $stateParams.stationID == null) {
        console.log('$stateParams.stationID not defined')
        console.log($stateParams.stationID);
        tryAPIGeolocation(onGeoLocationFound, onLocationError);
        // map.locate({setView: true, enableHighAccuracy: true, maxZoom :16});
        if (last_connection != null && $localstorage.getObject("stations"+$rootScope.contract) != null && diff < 100000){
            console.log("stations data load from storage");
            $scope.stations = $localstorage.getObject("stations"+$rootScope.contract);
            loadStationsMarkers2();
        }
        else {
            console.log(mapService.getCenter());
            VelibAPI.getStationsfromAPI($rootScope.contract).success(function(data){
                $scope.stations = data;
                loadStationsMarkers2();
             })
        }
        //map.setView(mapService.getCenter(),17); 
        //map.fitBounds(mapService.getBounds());
        //map.panTo(mapService.getCenter());
    }
    else {
        console.log('$stateParams.stationID defined')
        console.log($stateParams.stationID);
        if (last_connection != null && $localstorage.get("stations"+$rootScope.contract) != null && diff < 100000){
            console.log("stations data load from storage");
            $scope.stations = $localstorage.getObject("stations"+$rootScope.contract);
            loadStationsMarkers2();
            $scope.stations.forEach(function(station) {
            if (station.number == $stateParams.stationID) {
                    map.setView({lat:station.position.lat,lng:station.position.lng},10,{reset :true});
            }
            })
            
        }
        else {
            VelibAPI.getStationsfromAPI($rootScope.contract).success(function(data){
                $scope.stations = data;
                loadStationsMarkers2();
                $scope.stations.forEach(function(station) {
                if (station.number == $stateParams.stationID) { 
                    map.setView({lat:station.position.lat,lng:station.position.lng},10,{reset :true});
                }
                })
            })
        }
    }    
})

app.controller("Fav",function($scope,$rootScope,$localstorage){
    var fav=$localstorage.getObject('favorites')
        console.log(fav)
        $scope.fav=fav;

        $scope.elem = {
            showDelete: false
    };
    
  $scope.moveItem = function(item, fromIndex, toIndex) {
    $scope.fav.splice(fromIndex, 1);
    $scope.fav.splice(toIndex, 0, item);
    $localstorage.setObject("favorites",$scope.fav)
  };
  
  $scope.onItemDelete = function(item) {
    $scope.fav.splice($scope.fav.indexOf(item), 1);
    $localstorage.setObject("favorites",$scope.fav)
  };
   
})

app.controller("settingsCtrl", function($scope,$rootScope,$localstorage,$ionicPopup,$http,VelibAPI) {
    if ($rootScope.nbStationsToDisplay == undefined) {$scope.data = { 'nbStationsToDisplay' : '5' };}
    else {$scope.data = { 'nbStationsToDisplay' :  $rootScope.nbStationsToDisplay};}
    $scope.$watch('data.nbStationsToDisplay', function() {
        $rootScope.nbStationsToDisplay = $scope.data.nbStationsToDisplay;
    })
    
    if ($rootScope.contract != undefined) { $scope.chosen = {name:$rootScope.contract} };
    
    if ($localstorage.getObject('contracts') == undefined) {
        VelibAPI.getListContractfromAPI().success(function(data){
            $scope.contracts = data;
            $localstorage.setObject('contracts',data);
        });
    }
    else {
        $scope.contracts = $localstorage.getObject('contracts');
    }
    $scope.changeContract = function(item){
        console.log(item);
        $rootScope.contract = item;
        $localstorage.set('contract',item);
    };

    $scope.sendFeedback=function(){
        $ionicPopup.prompt({
        title: 'Votre commentaire',
        template: 'Envoyez nous vos remarques:',
        inputPlaceholder: 'Votre commentaire',
        cancelText: 'Précédent'
        }).then(function(res) {
            return $http({
            url: 'https://mandrillapp.com/api/1.0/messages/send.json', 
            method: "POST",
            data:{
                "key":"yym9tA_1xFDZXQubN5yZrg",
                "message":{
                    "text":res,
                    "subject":"Feedback",
                    "from_email":"utilisateur@prelib.com",
                    "to":[
                    {
                        "email":"teamprelib@gmail.com",
                        "name":"Prelib",
                        "type":"to"
                    }
                    ],
                "autotext":null            
                }
            }
                 }).done(function(response) {
   console.log(response); // if you're into that sorta thing
 });
             console.log('Your password is', res);
 });
    };

    $scope.aPropos=function(){
        $ionicPopup.alert({
            title:'A propos',
            template:'Application réalisée par <br>'+'  -Emile Mathieu<br>'+'  -Thomas Pesneaut<br>'
                    +'  -Nathan Rouxel <br>'+'  -Dany Srage <br><br>'+'Avec la collaboration de Theodo'
        })
    }

})

app.controller("settupCtrl", function($scope,$rootScope,$localstorage,$ionicPopup,$http,VelibAPI) {
    
})

app.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider
  .state('tabs', {
      url: "/tabs",
      abstract: true,
      templateUrl: "tabs.html"
    })
  .state('tabs.stations', {
    url: '/stations',
      views: {
        'stations-tab': {
          controller: 'StationsController',
          templateUrl: 'stations.html'
        }
    },
    resolve: {
      stations: function(TodosService) {
        return TodosService.getStations()
      }
    }
  })
  .state('tabs.station', {
    url: '/stations/:stationID',
      views: {
          'stations-tab': {
            controller: 'ReportController',
            templateUrl: 'station.html'
          }
      },
    resolve: {
      station: function($stateParams, TodosService) {
        return TodosService.getStation($stateParams.stationID)
      }
    }
  })
  .state('tabs.favorites', {
      url: "/favorites",
      views: {
        'favorites-tab': {
          templateUrl: "favorites.html",
          controller: "Fav"
        }
      }
    })
  .state('tabs.maps', {
      url: "/maps:stationID",
      views: {
        'maps-tab': {
          templateUrl: "maps.html",
          controller: "MapCtrl"
        }
      }
    })
    .state('tabs.settings', {
      url: "/settings",
      views: {
        'settings-tab': {
          templateUrl: "settings.html",
            controller: "settingsCtrl"
        }
      }
  })

    $urlRouterProvider.otherwise("/tabs/stations");
});          
