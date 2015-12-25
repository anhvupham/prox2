'use strict';

myApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/admin', {
            templateUrl: 'app/admin/admin.html',
            controller: 'AdminCtrl'
        });
    }])
    .controller('AdminCtrl', ["$scope", "Process", "Utils", "$location", function($scope, Process, Utils, $location) {
        $scope.search = "";
        $scope.showPopup = null;

        (function load() {
            new Process().get($scope.search, function(data) {
                $scope.processes = data;
            });
        }());

        $scope.delete = function(index, id, name) {
            $scope.process = {
                id: id,
                name: name
            };
            $scope.showPopup.open();
        };

        $scope.onSuccess = function() {
            load();
        }

        $scope.copy = function(id) {
            $location.path("/new/" + id);
        }
    }]);
