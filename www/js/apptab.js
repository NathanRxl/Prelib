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
		report: function(stationId,numberOfBike){
			return $http({
    url: 'https://prelib-api.herokuapp.com/report/'+stationId+'/'+numberOfBike+'/', 
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
        navigator.geolocation.getCurrentPosition(onGeolocationSuccessRefresh, onError,{enableHighAccuracy: true});
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
        navigator.geolocation.getCurrentPosition(onGeolocationSuccessDistancedRecomputed, onError,{enableHighAccuracy: true});
        $ionicLoading.hide();
    }
    else {
        navigator.geolocation.getCurrentPosition(onGeolocationSuccessRefresh, onError,{enableHighAccuracy: true});
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
app.controller('ReportController', function($scope,$stateParams,$ionicPopup,PrelibAPI,$localstorage,$ionicActionSheet,$state,station){
    
    $scope.station = station;
    var ratio = ($scope.station.available_bikes/$scope.station.bike_stands).toFixed(2);
    if (ratio > 0.5) {$scope.backgroundColor="rgba(165, 217, 254, 0.9)";}
    else if (ratio > 0.20)  {$scope.backgroundColor="rgba(241, 202, 148, 0.9)";}
    else  {$scope.backgroundColor="rgba(229, 141, 127, 0.9)";}
    
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

   $scope.addtoFav= function(idStation) {
        console.log("added to Favorites",idStation)
        var fav=$localstorage.getObject('favorites');
        //var fav=$localstorage.setObject('favorites',idStation);
        if(fav==null)
            { fav=[idStation];
              $localstorage.setObject('favorites',fav);}
        else
            {fav.push(idStation)
        $localstorage.setObject('favorites',fav);}
        console.log("list_fav",fav)
        return fav;

   };

    
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

app.controller("MapCtrl", function($scope,VelibAPI,mapService,$localstorage,$stateParams,$q,$rootScope) {
    
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
    map.on('locationfound', onLocationFound);
    
    function onLocationError(e) {
        alert(e.message);
    }
    map.on('locationerror', onLocationError);
    
    $scope.locate = function(){
        map.locate({setView: true, enableHighAccuracy: true, maxZoom :16});
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
    
    var loadStationsMarkers = function() {
        console.log('markers reloaded');
        if (markers1.getLayers().length>0) {
            map.removeLayer(markers1);
            markers1.clearLayers();  
        }
        markers1 = new L.layerGroup();
        angular.forEach($scope.stations, function(station) {
            var stationShouldBeDispayedInlargeZoom = map.getZoom()>=15 && station.position.lat>=map.getBounds()._southWest.lat && station.position.lat<=map.getBounds()._northEast.lat && station.position.lng>= map.getBounds()._southWest.lng && station.position.lng<= map.getBounds()._northEast.lng;
            var stationShouldBeDispayedInSmallZoom = map.getZoom()<15 && Math.abs(map.getCenter().lat-station.position.lat)<0.005 && Math.abs(map.getCenter().lng-station.position.lng)<0.01;
            if (stationShouldBeDispayedInlargeZoom || stationShouldBeDispayedInSmallZoom) {
                var color;
                if (station.available_bikes==0) {color='red';}
                else if (station.available_bikes==station.bike_stands)  {color='orange';}
                else  {color='lightblue';}
                var customIcon = L.AwesomeMarkers.icon({
                    icon: '',
                    markerColor: color,
                    prefix: 'fa',
                    html: station.available_bikes
                }); 
                var marker = L.marker([station.position.lat, station.position.lng],{clickable:true,icon: customIcon});
                marker.bindPopup("<b>"+station.name.slice(8)+"</b>"+"<br>"+"Bikes:"+station.available_bikes+" /Stands:"+station.bike_stands);
                markers1.addLayer(marker);
            }
        })
        map.addLayer(markers1);
    }

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
        marker.bindPopup("<a style='text-decoration: none' href='#/tabs/stations/"+station.number+"'>"+station.name.slice(8)+"</a>"+"<br>"+station.available_bikes+" / "+station.bike_stands);
        //ui-sref='tabs.station({stationID: "+station.number+ "})
        
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
        map.locate({setView: true, enableHighAccuracy: true, maxZoom :16});
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
            $scope.stations = $localstorage.get("stations"+$rootScope.contract);
            loadStationsMarkers2();
            $scope.stations.forEach(function(station) {
            if (station.number == $stateParams.stationID) {
                    console.log({lat:station.position.lat,lng:station.position.lng});
                    map.setView({lat:station.position.lat,lng:station.position.lng},10,{reset :true});
                    console.log(map.getCenter());}
            })
            
        }
        else {
            VelibAPI.getStationsfromAPI($rootScope.contract).success(function(data){
                $scope.stations = data;
                loadStationsMarkers2();
                $scope.stations.forEach(function(station) {
                if (station.number == $stateParams.stationID) { 
                    console.log({lat:station.position.lat,lng:station.position.lng});
                    map.setView({lat:station.position.lat,lng:station.position.lng},10,{reset :true});
                    console.log(map.getCenter());
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
