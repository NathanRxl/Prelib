// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

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

app.controller('StoreController', function($scope,$http){
    var geolocalisation = {};
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
        $scope.$apply(function(){
      console.log(position);
        $scope.position = position;
        console.log(position.coords.latitude);
          geolocalisation.lat = position.coords.latitude;
          geolocalisation.lng = position.coords.longitude;
        });
    });
    }
    console.log($scope.position);
    console.log(geolocalisation);
    var localisation = {latitude:48.857940092963034,longitude:2.347010058114489};
    var p1 = new google.maps.LatLng(localisation.latitude, localisation.longitude);
   $http({
    url: 'https://api.jcdecaux.com/vls/v1/stations', 
    method: "GET",
    params: {contract:'Paris', apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    }).success(function(data) {
     $scope.stations = data;
       
    for (var i=0; i <$scope.stations.length; i++) {
       var p2 = new google.maps.LatLng($scope.stations[i].position.lat, $scope.stations[i].position.lng);
       var distance = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
	   var nb_velo=$scope.stations[i].available_bikes;
	   var capacity=$scope.stations[i].bike_stands

	   $scope.stations[i].nb_velo=nb_velo;
       $scope.stations[i].distance = distance;
	   $scope.stations[i].capacity=capacity;
        
   }
       
       console.log($scope.stations);
    })
    $scope.predicate = 'distance';
    
	$scope.available_bike=function(){
	return  getQueryVariable("nb");
	}
		
    /*$http.get("https:///api.jcdecaux.com/vls/v1/stations", {
    params: {contract:'Paris', apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    }).success(function(data) {
     $scope.stations = data;
    })*/
	

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
    { id: 50 }
  ];
 });
app.directive("stationName", function() {
    return {
      restrict: 'E',
      templateUrl: "templates/station-name.html"
    };
});

/*var stations = [{"number":31705,"name":"31705 - CHAMPEAUX (BAGNOLET)","address":"RUE DES CHAMPEAUX (PRES DE LA GARE ROUTIERE) - 93170 BAGNOLET","latitude":48.8645278209514,"longitude":2.34701005811448916170724425901},{"number":10042,"name":"10042 - POISSONNIÈRE - ENGHIEN","address":"52 RUE D'ENGHIEN / ANGLE RUE DU FAUBOURG POISSONIERE - 75010 PARIS","latitude":48.87242006305313,"longitude":2.348395236282807}];*/
      
/*.controller('StoreController', [ '$http',function($http){
     var store = this;
     store.products = [ ];
    $http.get('//api.jcdecaux.com/vls/v1/contracts.json', {apiKey:9bf9a1b35a26563496adb00c856e095664084c78}).success(function(data){
        store.product  = data;
    });
}]);*/
                                                                                                        
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
