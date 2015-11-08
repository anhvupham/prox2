'use strict';

myApp.factory('Process', ['$http', 'Utils', function($http, Utils) {
    function Process(data) {
        this.id = data ? data.id : '';
        this.name = data ? data.name : '';
        this.command = data ? data.command : 'sh';
        this.args = data ? data.args : 'build.sh, [?notbuild:build], [?notrun:run]';
        this.cwd = data ? data.cwd : '';
        this.img = data ? data.img : '';
        this.stopcmd = data ? data.stopcmd : '';
        this.checkcmd = data ? data.checkcmd : '';
        this.pid = data ? data.pid : '';
        this.port = data ? data.port : '';
        this.hidden = data ? data.hidden : false;
        this.logs = data ? data.logs : [];
        this.file = data ? data.file : 'if [ $1 = "build" ]; then \n#Enter some commands here for building service \nfi\n\nif [ $2 = "run" ]; then \n#Enter some commands here for running service \nfi';
    };

    Process.prototype.status = function(callback) {
        $http.get('/status/' + this.id).success(function(data) {
            callback(data);
        });
    };

    Process.prototype.stop = function(callback) {
        $http.delete('/execute/' + this.id).success(function(data) {
            callback(data);
        });
    };

    Process.prototype.exec = function(body, callback) {
        $http.post('/execute/' + this.id, body).success(function(data) {
            callback(data);
        });
    };

    Process.prototype.dashboard = function(callback) {
        $http.get('/dashboard', this).success(function(data) {
            callback(data);
        });
    };

    Process.prototype.post = function(callback) {
        $http.post('/process', this).success(function(data) {
            callback(data);
        });
    };

    Process.prototype.get = function(search, callback) {
        $http.get('/process?search=' + search).success(function(data) {
            callback(data);
        });
    };

    Process.prototype.getById = function(id, callback) {
        var self = this;
        $http.get('/process/' + id).success(function(data) {
            for (var x in self) {
                if (self.hasOwnProperty(x)) {
                    self[x] = data[x];
                }
            }
            callback(self);
        });
    };

    Process.prototype.deleteById = function(id, callback) {
        $http.delete('/process/' + id).success(function(data) {
            callback(data);
        });
    };

    Process.prototype.putById = function(id, callback) {
        $http.put('/process/' + id, this).success(function(data) {
            callback(data);
        });
    };

    return Process;
}]);
