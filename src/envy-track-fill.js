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

            /* --- START CUSTOM MAGIC --- */
            /* --- START CUSTOM MAGIC --- */

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

            var setTrackFillSize = function(model) {
              var original_size = JSON.parse(attrs.faSize);
              var new_size = function(o) {
                if ((parseInt(model)/100) >= 1) {
                  if (isolate.surfaceTrackFillModifier.getOpacity() !== 1) {
                    isolate.surfaceTrackFillModifier.setOpacity(1);
                  }
                  return o[0];
                } else if ((parseInt(model)/100) <= 0) {
                  if (isolate.surfaceTrackFillModifier.getOpacity() !== 0) {
                    isolate.surfaceTrackFillModifier.setOpacity(0);
                  }
                  return 0;
                } else {
                  if (isolate.surfaceTrackFillModifier.getOpacity() !== 1) {
                    isolate.surfaceTrackFillModifier.setOpacity(1);
                  }
                  return (parseInt(model)/100) * o[0];
                }
              };

              isolate.surfaceTrackFill.setSize([new_size(original_size), original_size[1]]);
            };

            // FIXME: This shouldn't be necessary.
            // cont.: This should also be for vertical and horizontal.
            // Bootstrap the track.
            if (typeof(scope.main.ngModel) === 'number') {
              isolate.surfaceTrackFill.setSize([0, scope.$eval(attrs.faSize)[1]]);
            } else if (typeof(scope.main.ngModel) === 'boolean') {
              isolate.surfaceTrackFillModifier.setOpacity(0);
            }

            scope.envyEvents.on('ngModelUpdate', function(data) {
              if (typeof(data.ngModel) === 'number') {
                setTrackFillSize(data.ngModel);
              } else if (typeof(data.ngModel) === 'boolean') {
                isolate.surfaceTrackFillModifier.setOpacity(data.ngModel ? 1 : 0, {curve: 'easeOut', duration : 200});
              }
            });

            /* --- END CUSTOM MAGIC --- */
            /* --- END CUSTOM MAGIC --- */

            if (attrs.class) {
              isolate.surfaceTrackFill.setClasses(attrs['class'].split(' '));
            }
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
