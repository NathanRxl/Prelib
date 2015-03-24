// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

'use strict';
var app = angular.module('starter', ['ionic','$selectBox','leaflet-directive'])

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
    //LoaderService.show();
    $scope.nbStationsToDisplay = 3;
    $scope.stations = stations;
    
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
		}
    
	var onGeolocationSuccess = function(position) {
		$scope.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        
        var date = new Date().getTime();
        var last_connection = $localstorage.getObject('last_connection');
        $localstorage.setObject('last_connection',date);
        var diff = date - last_connection;
        if (last_connection != null && diff < 10000){
            console.log(diff/1000);
            console.log("stations data load from storage");
            $scope.stations = JSON.parse($localstorage.get('stations'));
        }
        else if(last_connection != null && diff < 20000){
            console.log(diff/1000);
            console.log("stations data load from storage but distance recomputed");
            var data = JSON.parse($localstorage.get('stations'));
            getNearestStation(data);
        }
        else {
            console.log("all recomputed");
            VelibAPI.getStationsfromAPI().success(function(data){getNearestStation(data); });
        }
        $ionicLoading.hide();  
	};
    
    var onGeolocationSuccessRefresh = function(position) {
		$scope.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var date = new Date().getTime();
        $localstorage.setObject('last_connection',date);
        console.log("all recomputed");
        VelibAPI.getStationsfromAPI().success(function(data){getNearestStation(data); });
	};

	function onError(error) {
		alert('code: '    + error.code    + '\n' +
			 'message: ' + error.message + '\n' +
              'You need to accept geolocalisation to use this application'
             );
	}

	navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onError,{enableHighAccuracy: true});
    
    $scope.doRefresh = function() {
        navigator.geolocation.getCurrentPosition(onGeolocationSuccessRefresh, onError,{enableHighAccuracy: true});
        $scope.$broadcast('scroll.refreshComplete');
    };
});
 
app.controller('ReportController', function($scope,$stateParams,$ionicPopup,PrelibAPI,$localstorage,station){
    
    $scope.station = station;
    
    function showAlert(numberOfBike) {
        var textToDisplay = "";
        if (numberOfBike==1){textToDisplay = "Merci d'avoir reporté un vélo";}
        else if (numberOfBike>1){textToDisplay = "Merci d'avoir reporté "+numberOfBike +" vélos";}
       var alertPopup = $ionicPopup.alert({
            title: "Prelib'",
            template: textToDisplay
        });
        //alertPopup.then(function(res) {});
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
    
    var liste = new Array(50);
    for (var i = 0; i < liste.length; i++) { liste[i]=i+1; }
    $scope.items = liste;
    
    var devList = new Array(50);
    for (var i = 0; i < devList.length; i++) { devList[i]={name: i+1, id: i+1}; }
    $scope.devList = devList;
    

    var isIOS = ionic.Platform.isIOS();
    var isAndroid = ionic.Platform.isAndroid();
    var isWindowsPhone = ionic.Platform.isWindowsPhone();
    
    //var mapsUrl = "http://maps.google.com?q="+$scope.station.address;
    //var mapsUrl = "http://maps.google.com?q="+$scope.station.position.lat+","+$scope.station.position.lng;
    //var mapsUrl = "http://www.google.com/maps/place/"+$scope.station.position.lat+","+$scope.station.position.lng+"/@"+$scope.station.position.lat+","+$scope.station.position.lng+",17z";
    //var mapsUrl = "http://google.com/maps/preview/@"+$scope.station.position.lat+","+$scope.station.position.lng+","+"18z";
    var mapsUrl = "https://maps.google.com?saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng;
    if (isIOS) { mapsUrl = "https://maps.apple.com?saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng;}
    else if (isAndroid) { mapsUrl = "https://maps.google.com?saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng; }
    else if (isWindowsPhone) { mapsUrl = "maps:saddr=Current+Location&daddr="+$scope.station.position.lat+","+$scope.station.position.lng; }
    $scope.mapsUrl = mapsUrl;
    console.log($scope.mapsUrl);
    
});
                                                                                                        
app.service('TodosService', function($q,$localstorage,LoaderService,VelibAPI) {
    console.log('TodosService1');
    LoaderService.show();
    var test;
    if ($localstorage.get('stations') != null) {
        console.log("NOT NULL");
        test = JSON.parse($localstorage.get('stations'));
    }
    else {
    console.log("NULL");
    VelibAPI.getStationsfromAPI().success(function(data){
        test = data;
    });
    }
    
  return {
      stations: test,
      
    getStations: function() {
      return this.stations
    },
    getStation: function(todoId) {
      var dfd = $q.defer()
      this.stations.forEach(function(station) {
        if (station.number == todoId) {
            dfd.resolve(station)}
      })
      return dfd.promise
    }
  }
})

.controller("MapCtrl", [ '$scope', function($scope) {
    angular.extend($scope, {
        osloCenter: {
            lat: 59.91,
            lng: 10.75,
            zoom: 12
        },
        markers: {
            osloMarker: {
                lat: 59.91,
                lng: 10.75,
                message: "I want to travel here!",
                focus: true,
                draggable: false
            }
        },
        defaults: {
    maxZoom: 14,
    minZoom: 1,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    attributionControl: true,
    tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    tileLayerOptions: {
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    icon: {
        url: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon.png',
        retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon@2x.png',
        size: [25, 41],
        anchor: [12, 40],
        popup: [0, -40],
        shadow: {
            url: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
            retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
            size: [41, 41],
            anchor: [12, 40]
        }
    },
    path: {
        weight: 10,
        opacity: 1,
        color: '#0000ff'
    },
    center: {
        lat: 0,
        lng: 0,
        zoom: 10
    }
}
    });
}])

app.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider
  .state('tabs', {
      url: "/tab",
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
  .state('tabs.maps', {
      url: "/maps",
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
          templateUrl: "settings.html"
        }
      }
  })
    $urlRouterProvider.otherwise("/tab/stations");
});          

angular.module('$selectBox', [])
    .directive('selectBox', function () {
    return {
        restrict: 'E',
        require: ['ngModel', 'ngData', 'ngSelectedId', 'ngSelectedValue', '?ngTitle', 'ngiItemName', 'ngItemId'],
        template: '<input class="selectInput" id="showed" type="text" ng-click="showSelectModal()" readonly/>' + '<span id="hidden" type="text" style="display: none;"></span>',
        controller: function ($scope, $element, $attrs, $ionicModal, $parse) {
            $scope.modal = {};

            $scope.showSelectModal = function () {
                var val = $parse($attrs.ngData);
                $scope.data = val($scope);

                $scope.modal.show();
            };

            $scope.closeSelectModal = function () {
                $scope.modal.hide();
            };

            $scope.$on('$destroy', function (id) {
                $scope.modal.remove();
            });

            //{{'Gift.modalTitle' | translate}}
            $scope.modal = $ionicModal.fromTemplate('<ion-modal-view id="select">' + '<ion-header-bar>' + '<h1 class="title">' + $attrs.ngTitle + '</h1>' + ' <a ng-click="closeSelectModal()" class="button button-icon icon ion-close"></a>' + '</ion-header-bar>' + '<ion-content>' + '<ul class="list">' + '<li class="item" ng-click="clickItem(item)" ng-repeat="item in data" ng-bind-html="item[\'' + $attrs.ngItemName + '\']"></li>' + '</ul>' + ' </ion-content>' + '</ion-modal-view>', {
                scope: $scope,
                animation: 'slide-in-up'
            });

            $scope.clickItem = function (item) {
                var index = $parse($attrs.ngSelectedId);
                index.assign($scope.$parent, item[$attrs.ngItemId]);

                var value = $parse($attrs.ngSelectedValue);
                value.assign($scope.$parent, item[$attrs.ngItemName]);

                $scope.closeSelectModal();
            };
        },
        compile: function ($element, $attrs) {
            var input = $element.find('input');
            angular.forEach({
                'name': $attrs.name,
                'placeholder': $attrs.ngPlaceholder,
                'ng-model': $attrs.ngSelectedValue
            }, function (value, name) {
                if (angular.isDefined(value)) {
                    input.attr(name, value);
                }
            });

            var span = $element.find('span');
            if (angular.isDefined($attrs.ngSelectedId)) {
                span.attr('ng-model', $attrs.ngSelectedId);
            }
        }
    };
});