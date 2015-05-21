
var envySlider = angular.module('envySlider', ['famous.angular', 'digestHud']).config(function(digestHudProvider) {
  'use strict';
  digestHudProvider.enable();
  // Optional configuration settings:
  digestHudProvider.numTopWatches = 20;  // number of items to display in detailed table
  digestHudProvider.numDigestStats = 25;  // number of most recent digests to use for min/med/max stats
});


angular.module('envySlider').controller('MainCtrl', function($scope, $famous, $timeout){
  'use strict';
  var _this = this;

  this.brightness = 10;
  this.power = false;
  this.t = 0;

  setInterval(function() {
    _this.t =  Date.now();
  }, 5000);

  this.brightnessSet = function(e,d) {
    // console.log('brightnessSet', e, d);
    _this.brightness = e;
  };

  this.powerSet = function(e,d) {
    // console.log('powerSet', e, d);
    _this.power = e;
  };
});


// angular.module('envySlider', ['digestHud']).config(function(digestHudProvider) {
//   digestHudProvider.enable();
//   // Optional configuration settings:
//   digestHudProvider.numTopWatches = 20;  // number of items to display in detailed table
//   digestHudProvider.numDigestStats = 25;  // number of most recent digests to use for min/med/max stats
// });


// +var envySlider = angular.module('envySlider', ['famous.angular']);
// +
// +
// +angular.module('envySlider').controller('MainCtrl', function($scope, $famous, $timeout){
// +  'use strict';
// +  $scope.load = {
// +    brightness: 50
// +  };
// +
// +});
// +
// +
