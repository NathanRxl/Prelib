// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var app = angular.module('starter', ['ionic'])

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
       $scope.stations[i].distance = distance;
        
   }
       
       console.log($scope.stations);
    })
    $scope.predicate = 'distance';
    
    /*$http.get("https:///api.jcdecaux.com/vls/v1/stations", {
    params: {contract:'Paris', apiKey: '9bf9a1b35a26563496adb00c856e095664084c78'}
    }).success(function(data) {
     $scope.stations = data;
    })*/
 
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
