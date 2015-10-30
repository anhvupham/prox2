angular.module('dashboardroute', [])
.factory('getDashBoard', ['$http', function($http){
	var results;
	$http.get('/dashboard').success(function(data){
		results = data;
	});
	return {};
}]);