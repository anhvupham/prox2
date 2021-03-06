'use strict';

myApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/new', {
                templateUrl: 'app/new/new.html',
                controller: 'NewCtrl'
            })
            .when('/new/:id', {
                templateUrl: 'app/new/new.html',
                controller: 'NewCtrl'
            });
    }])
    .controller('NewCtrl', ["$scope", "$http", "$routeParams", "Utils", "Process", "$location", function($scope, $http, $routeParams, Utils, Process, $location) {
        if ($routeParams.id) {
            new Process().getById($routeParams.id, function(data) {
                $scope.model = data;
                $scope.model.id = '';
            });
        } else {
            $scope.model = new Process();
        }

        function transformArgs(value) {
            return value.split(',');
        };

        $scope.$watch('model.file', function() {
            if ($scope.model) {
                var args = $scope.model.file.match(/(\$\d \= \")\w+\"/g),
                    key;

                if (args) {
                    args = args.map(function(x) {
                        key = x.replace(/\"/g, '').replace(/\$\d = /g, '');
                        return '[?not' + key + ':' + key + ']'
                    });

                    $scope.model.args = 'build.sh,' + args.join(',');
                }
            }
        });

        $scope.save = function(valid) {
            if (!valid) {
                Utils.toggleNotification(true, 'Please enter required fields', true);
                return;
            };
            var args = $scope.model.args;
            $scope.model.args = args.match(/\,/gi) ? transformArgs(args) : args
            $scope.model.post(function(data) {
                if (data.id) {
                    Utils.toggleNotification(true, 'Save successfully', false);
                    $location.path("/admin");
                } else {
                    Utils.toggleNotification(true, 'Save not successfully', true);
                }
            });
        };
    }]);
