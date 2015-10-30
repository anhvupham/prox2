myApp.directive('popupConfirm', function(Utils, Process) {
    return {
        restrict: 'E',
        templateUrl: 'app/components/popup/popup.html',
        scope: {
            process: '=',
            api: '=',
            success: '&onSuccess'
        },
        link: function(scope, el, attrs) {
            scope.title = attrs.title;
            scope.api = {
                open: function() {
                    Utils.toggleOverlay(true);
                    el.addClass('display');
                },
                close: function() {
                    Utils.toggleOverlay(false);
                    el.removeClass('display');
                }
            }
            scope.cancel = function() {
                scope.api.close();
            }
            scope.delete = function() {
            	new Process().deleteById(scope.process.id, function(data){
            		if (data.status) {
            			Utils.toggleNotification(true, 'Delete successfully', false);
            			scope.api.close();
            			scope.success();
            		} else {
            			Utils.toggleNotification(true, 'Delete not successfully', true);
            		}
            	});
            }
        }
    };
});
