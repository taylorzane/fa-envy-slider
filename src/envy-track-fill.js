/**
* Custom Track Fill element for Control Envy.
* Used with envy-slider, -thumb, and -track.
*
* Requirements:
* Must two-way bind to a load (brightness).
* Must synchronize with thumb (implicitly by model-binding).
* Must accept any markup for Surface content.
*
*/

angular.module('famous.angular')
  .directive('envyTrackFill', ['$famous', '$famousDecorator', '$interpolate', '$controller', '$compile', function ($famous, $famousDecorator, $interpolate, $controller, $compile) {
    'use strict';
    return {
      scope: false,
      transclude: true,
      template: '<div class="fa-surface"></div>',
      restrict: 'EA',
      compile: function(tElement, tAttrs){
        return {
          pre: function(scope, element, attrs){

            var isolate = $famousDecorator.ensureIsolate(scope);

            var Surface = $famous['famous/core/Surface'];
            var Transform = $famous['famous/core/Transform'];
            var Modifier = $famous['famous/core/Modifier'];

            scope.$watch(
              function(){
                return isolate.getProperties();
              },
              function(){
                if(isolate.surfaceNode) {
                  isolate.surfaceNode.setProperties(isolate.getProperties());
                }
              },
              true
            );

            var _propToFaProp = function(prop){
              return "fa" + prop.charAt(0).toUpperCase() + prop.slice(1);
            };

            isolate.getProperties = function(){
              var baseProperties = scope.$eval(attrs.faProperties) || {};
              var properties = [
                "backgroundColor",
                "margin",
                "padding",
                "color",
                "pointerEvents",
                "zIndex"
              ];
              for(var i = 0; i < properties.length; i++){
                var prop = properties[i];
                var faProp = _propToFaProp(prop);
                if(attrs[faProp]) {
                  baseProperties[prop] = scope.$eval(attrs[faProp]);
                }
              }
              return baseProperties;
            };
            var _sizeAnimateTimeStamps = [];

            attrs.$observe('faSize',function () {
              isolate.surfaceNode.setSize(scope.$eval(attrs.faSize));
              _sizeAnimateTimeStamps.push(new Date());

              if(_sizeAnimateTimeStamps.length > 5) {
                if((_sizeAnimateTimeStamps[4]-_sizeAnimateTimeStamps[0]) <= 1000 ){
                  console.warn("Using fa-size on fa-surface to animate is significantly non-performant, prefer to use fa-size on an fa-modifier surrounding a fa-surface");
                }
                _sizeAnimateTimeStamps.shift();
              }
            });

            /* --- START CUSTOM MAGIC --- */
            /* --- START CUSTOM MAGIC --- */

            isolate.surfaceNode = new Surface({
              size: scope.$eval(attrs.faSize),
              properties: isolate.getProperties()
            });

            if (attrs.faTranslate) {
              isolate.modifier = new Modifier({
                transform: Transform.translate.apply(this, JSON.parse(attrs.faTranslate))
              });
              scope.isolate[scope.$id].renderNode.add(isolate.modifier).add(isolate.surfaceNode);
            } else {
              scope.isolate[scope.$id].renderNode.add(isolate.surfaceNode);
            }

            scope.$watch('main.ngModel',
              function(){
                if(scope.main.ngModel !== undefined){
                  var original_size = JSON.parse(attrs.faSize);
                  var new_size = function(o) {
                    if ((parseInt(scope.main.ngModel)/100) > 1) {
                      return o[0];
                    } else if ((parseInt(scope.main.ngModel)/100) < 0) {
                      return 0;
                    } else {
                      return (parseInt(scope.main.ngModel)/100) * o[0];
                    }
                  };
                  isolate.surfaceNode.setSize([new_size(original_size), original_size[1]]);
                }
              },
              true
            );

            // FIXME: This shouldn't be necessary.
            // cont.: This should also be for vertical and horizontal.
            // Bootstrap the track.
            isolate.surfaceNode.setSize([0, scope.$eval(attrs.faSize)[1]]);

            /* --- END CUSTOM MAGIC --- */
            /* --- END CUSTOM MAGIC --- */

            if (attrs.class) {
              isolate.surfaceNode.setClasses(attrs['class'].split(' '));
            }
            if(attrs.faDeploy){
              isolate.surfaceNode.on("deploy",function(){
                var fn = scope[attrs.faDeploy];
                if(typeof fn === 'function') {
                  fn(attrs.faDeploy)();
                }
              });
            }
            // Throw an exception if anyother famous scene graph element is added on fa-surface.
            $famousDecorator.sequenceWith(scope, function(data) {
              throw new Error('Surfaces are leaf nodes of the Famo.us render tree and cannot accept rendernode children.  To include additional Famo.us content inside of a fa-surface, that content must be enclosed in an additional fa-app.');
            });
          },
          post: function(scope, element, attrs, ctrl, transclude){
            var isolate = $famousDecorator.ensureIsolate(scope);

            var updateContent = function() {
              isolate.surfaceNode.setContent(element[0].querySelector('div.fa-surface'));
            };

            updateContent();

            transclude(scope, function(clone) {
              angular.element(element[0].querySelectorAll('div.fa-surface')).append(clone);
            });
          }
        };
      }
    };
  }]);
