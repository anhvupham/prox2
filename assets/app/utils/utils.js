'use strict';

myApp.factory('Utils', [function() {
    return {
        toggleNotification: function(show, text, failed) {
            var notif = $('.notification');
            notif.addClass(failed ? 'alert-danger' : 'alert-success');
            notif.text(text);
            if (show) {
                notif.addClass('open');
                this.toggleNotification(false, text, failed);
            } else {
                setTimeout(function() {
                    notif.removeClass('open');
                    notif.removeClass('alert-success alert-danger');
                }, 2000);
            }
        },
        toggleOverlay: function(display) {
            var overlay = $('.overlay');
            if (display) {
                overlay.addClass('display');
            } else {
                overlay.removeClass('display');
            }
        }
    };
}]);
