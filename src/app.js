// var envySlider = angular.module('envySlider', ['famous.angular']);


angular.module('famous.angular').controller('MainCtrl', function($scope, $famous, $timeout){
  'use strict';
  this.brightness = 50;

  var _this = this;

  this.brightnessSet = function(e,d) {
    console.log('brightnessSet', e, d);
    _this.brightness = e;
  };
});


