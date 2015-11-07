'use strict';

myApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/edit/:id', {
            templateUrl: 'app/edit/edit.html',
            controller: 'EditCtrl'
        });
    }])
    .controller('EditCtrl', ["$scope", "$http", "$routeParams", "Utils", "Process", "$location", function($scope, $http, $routeParams, Utils, Process, $location) {
        function transformArgs(value) {
            return value.split(',');
        };

        new Process().getById($routeParams.id, function(data) {
            $scope.model = data;

            $scope.$watch('model.file', function() {
                var args = $scope.model.file.match(/(\$\d \= \")\w+\"/g),
                    key;

                if (args) {
                    args = args.map(function(x) {
                        key = x.replace(/\"/g, '').replace(/\$\d = /g, '');
                        return '[?not' + key + ':' + key + ']'
                    });

                    $scope.model.args = 'build.sh,' + args.join(',');
                }
            });
        });

        $scope.save = function(valid) {
            if (!valid) {
                Utils.toggleNotification(true, 'Please enter required fields', true);
                return;
            };
            var args = $scope.model.args;
            $scope.model.args = args.match(/\,/gi) ? transformArgs(args) : args
            $scope.model.putById($scope.model.id, function(data) {
                if (data.id) {
                    Utils.toggleNotification(true, 'Save successfully', false);
                } else {
                    Utils.toggleNotification(true, 'Save not successfully', true);
                }
            });
        };
        $scope.copy = function() {
            $location.path("/new/" + $scope.model.id);
        };
    }]);
