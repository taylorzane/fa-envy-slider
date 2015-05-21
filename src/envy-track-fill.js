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
  .directive('envyTrackFill', ['$famous', '$famousDecorator', '$interpolate', '$controller', '$compile', '$rootScope', function ($famous, $famousDecorator, $interpolate, $controller, $compile, $rootScope) {
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
            var Modifier = $famous['famous/modifiers/StateModifier'];
            var EventHandler = $famous['famous/core/EventHandler'];

            // scope.$watch(
            //   function(){
            //     return isolate.getProperties();
            //   },
            //   function(){
            //     if(isolate.surfaceTrackFill) {
            //       isolate.surfaceTrackFill.setProperties(isolate.getProperties());
            //     }
            //   },
            //   true
            // );

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
              isolate.surfaceTrackFill.setSize(scope.$eval(attrs.faSize));
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

            isolate.trackEvent = new EventHandler();

            isolate.surfaceTrackFill = new Surface({
              size: scope.$eval(attrs.faSize),
              properties: isolate.getProperties()
            });

            // FIXME: Since we need set opacity, move the modifier
            // cont.: outside of the faTranslate check.
            if (attrs.faTranslate) {
              isolate.surfaceTrackFillModifier = new Modifier({
                transform: Transform.translate.apply(this, JSON.parse(attrs.faTranslate))
              });
              scope.isolate[scope.$id].renderNode.add(isolate.surfaceTrackFillModifier).add(isolate.surfaceTrackFill);
            } else {
              scope.isolate[scope.$id].renderNode.add(isolate.surfaceTrackFill);
            }

            var setTrackFillSize = function() {
              var original_size = JSON.parse(attrs.faSize);
              var new_size = function(o) {
                if ((parseInt(scope.main.ngModel)/100) >= 1) {
                  if (isolate.surfaceTrackFillModifier.getOpacity() !== 1) {
                    isolate.surfaceTrackFillModifier.setOpacity(1);
                  }
                  return o[0];
                } else if ((parseInt(scope.main.ngModel)/100) <= 0) {
                  if (isolate.surfaceTrackFillModifier.getOpacity() !== 0) {
                    isolate.surfaceTrackFillModifier.setOpacity(0);
                  }
                  return 0;
                } else {
                  if (isolate.surfaceTrackFillModifier.getOpacity() !== 1) {
                    isolate.surfaceTrackFillModifier.setOpacity(1);
                  }
                  return (parseInt(scope.main.ngModel)/100) * o[0];
                }
              };

              isolate.surfaceTrackFill.setSize([new_size(original_size), original_size[1]]);
            };

            // scope.$watch('main.ngModel',
            //   function(){
            //     if(scope.main.ngModel !== undefined){
            //       var original_size = JSON.parse(attrs.faSize);
            //       if (typeof(scope.main.ngModel) === 'number') {
            //         setTrackFillSize();
            //       } else if (typeof(scope.main.ngModel) === 'boolean') {
            //         isolate.surfaceTrackFillModifier.setOpacity(scope.main.ngModel ? 1 : 0, {curve: 'easeOut', duration : 200});
            //       }
            //     }
            //   },
            //   true
            // );

            scope.envyEvents.on('thumbUpdate', function(e) {
              isolate.surfaceTrackFill.setSize([e.pos, JSON.parse(attrs.faSize)[1]]);
            });

            // FIXME: This shouldn't be necessary.
            // cont.: This should also be for vertical and horizontal.
            // Bootstrap the track.
            // isolate.surfaceTrackFillModifier.setOpacity(0); // FIXME: Should we be doing this?

            if (typeof(scope.main.ngModel) === 'number') {
              isolate.surfaceTrackFill.setSize([0, scope.$eval(attrs.faSize)[1]]);
            } else if (typeof(scope.main.ngModel) === 'boolean') {
              isolate.surfaceTrackFillModifier.setOpacity(0);
            }

            /* --- END CUSTOM MAGIC --- */
            /* --- END CUSTOM MAGIC --- */

            if (attrs.class) {
              isolate.surfaceTrackFill.setClasses(attrs['class'].split(' '));
            }
            if(attrs.faDeploy){
              isolate.surfaceTrackFill.on("deploy",function(){
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
              isolate.surfaceTrackFill.setContent(element[0].querySelector('div.fa-surface'));
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
