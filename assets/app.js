'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', [
        'ngRoute'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({
            redirectTo: '/dashboard'
        });
    }])
    .filter('rawHtml', ['$sce', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }])
    .controller('indexCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {
        $scope.searchAvailable = false;
        $rootScope.$on("$routeChangeSuccess", function(current, previous) {
            if($location.$$path === "/dashboard" || $location.$$path === "/admin") {
                $scope.searchAvailable = true;
            } else {
                $scope.searchAvailable = false;
            }
        });
        $scope.$watch("search", function(value) {
            var controller = angular.element($(".container.main")).scope();
            if (controller) controller.search = value;
        });
    }]);
