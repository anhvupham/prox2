'use strict';

myApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'app/dashboard/dashboard.html',
            controller: 'DashboardCtrl'
        });
    }])
    .controller('DashboardCtrl', ["$rootScope", "$scope", "$http", "Process", "Utils", function($rootScope, $scope, $http, Process, Utils) {
        $scope.search = "";
        $scope.service = false;
        $scope.id = '';
        $scope.log = {
            title: '',
            content: []
        };
        $scope.logs = sessionStorage.logs ? JSON.parse(sessionStorage.logs) : [];
        $scope.onthispage = true;

        var wk; //worker instance

        $rootScope.$on("$routeChangeStart", function(next, current) {
            $scope.onthispage = false;
            wk.terminate(); //close worker
        });

        (function doit() {
            new Process().dashboard().then(function(res) {
                $scope.processes = res.data.processes;

                $scope.showLog = function(process) {
                    $scope.log.title = process.name;
                    $scope.log.content = $scope.logs.filter(function(x) {
                        return x.id === process.id;
                    });
                    $("#logs").modal('show');
                };

                io.socket.on('log', function(data) {
                    $scope.logs.push({
                        id: data.id,
                        log: data.log
                    });
                    // Cap The Amount of Logs to Hold In The Front End
                    if ($scope.logs.length > 1500) {
                        $scope.logs.shift();
                    }
                    sessionStorage.setItem("logs", JSON.stringify($scope.logs));
                    $('#' + data.id).addClass('activity');
                    setTimeout(function() {
                        $('#' + data.id).removeClass('activity');
                    }, 1000);
                });

                $scope.runningOnly = function(processes) {
                    $scope.processes = processes.filter(function(x) {
                        return x.running == true;
                    });
                };

                $scope.showAll = function() {
                    doit();
                };

                $scope.runningCount = function(processes) {
                    var runningprocesses = processes.filter(function(x) {
                        return x.running === true;
                    });
                    return runningprocesses.length;
                }

                $scope.startservice = function(process) {
                    var pid = process ? process.id : $scope.id;
                    var newservice = $scope.service;
                    if (!process) {
                        var options = $('#custombuild .modal-body input:checked');
                        for (var i = 0; i < options.length; i++) {
                            newservice.args[i] = $(options[i]).val();
                        }
                    }
                    if (process) {
                        process.stopping = false;
                        process.starting = true;
                    }

                    new Process({
                        id: pid
                    }).exec({
                        service: process ? false : newservice
                    }).then(function(res) {
                        var data = res.data;
                        if (data.service && data.needbuild) {
                            for (var i = 0; i < data.service.args.length; i++) {
                                if (data.service.args[i].match(/\?/g)) {
                                    data.service.args[i] = data.service.args[i].replace(/[\?\[\]]/g, '').split(':');
                                } else {
                                    data.service.args[i] = [data.service.args[i]];
                                }
                            }
                            $scope.id = data.service.id;
                            $scope.service = data.service;
                            $('#custombuild').modal('show');
                        }
                    });
                }

                $scope.stopservice = function(process) {
                    process.stopping = true;
                    process.starting = false;
                    new Process({
                        id: process.id
                    }).stop().then(function(data) {
                        console.log("Service " + process.name + " stopped");
                    });
                }

                if (window.Worker) {
                    wk = new Worker("worker/dashboard.js");
                    wk.onmessage = function(e) {
                        var row = $("#" + e.data.id);
                        var btnstop = row.find(".btn-success");
                        var btnstart = row.find(".btn-danger");
                        btnstop.css("display", e.data.status ? "inline-block" : "none");
                        btnstart.css("display", e.data.status ? "none" : "inline-block");
                    };
                    wk.postMessage($scope.processes);
                } else {
                    $scope.processes.forEach(function(p) {
                        (function checkstatus(p) {
                            if ($scope.onthispage) {
                                setTimeout(function() {
                                    new Process({
                                        id: p.id
                                    }).status().then(function(res) {
                                        p.running = res.data.status;
                                        checkstatus(p);
                                    });
                                }, 2000);
                            }
                        })(p);
                    });
                }
            });
        })();
    }]);
