'use strict';

describe('myApp.new module', function() {

  beforeEach(module('myApp.new'));

  describe('new controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var newCtrl = $controller('NewCtrl');
      expect(newCtrl).toBeDefined();
    }));

  });
});