// var envySlider = angular.module('envySlider', ['famous.angular']);


angular.module('famous.angular').controller('MainCtrl', function($scope, $famous, $timeout){
  'use strict';
  this.brightness = 0;
  this.power = false;

  var _this = this;

  this.brightnessSet = function(e,d) {
    console.log('brightnessSet', e, d);
    _this.brightness = e;
  };

  this.powerSet = function(e,d) {
    console.log('powerSet', e, d);
    _this.power = e;
  };
});


