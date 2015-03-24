
var app = angular.module('ionicApp', ['ionic', 'leaflet-directive']);

app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('home', {
    url: '/home',
    views: {
      'tab-home': { templateUrl: 'home.html' }
    }
  });
  $stateProvider.state('map', {
    url: '/map',
    views: {
      'tab-map': { templateUrl: 'map.html' }
    }
  });
  
  $urlRouterProvider.otherwise('/home');
});