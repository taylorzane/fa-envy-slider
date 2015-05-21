/**
* Custom Thumb element for Control Envy.
* Used with envy-slider, -track, and -track-fill.
*
* Requirements:
* Must two-way bind to a load (brightness).
* Must be draggable.
* Must accept any markup for Surface content.
*
*/

angular.module('famous.angular')
  .directive('envyThumb', ['$famous', '$famousDecorator', '$interpolate', '$controller', '$compile', '$rootScope', function ($famous, $famousDecorator, $interpolate, $controller, $compile, $rootScope) {
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
            var Draggable = $famous['famous/modifiers/Draggable'];

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

            var draggableRange = {
              xRange: [0, 0],
              yRange: [0, 0]
            };

            // TODO: Implement (optional) snapping.
            var faDrag = JSON.parse(attrs.faDrag);
            var dragDirection = function() {
              if (faDrag[0] > faDrag[1]) {
                return 0;
              } else if (faDrag[0] < faDrag[1]) {
                return 1;
              } else {
                return -1;
              }
            }();

            draggableRange.xRange = [0, faDrag[0]];
            draggableRange.yRange = [0, faDrag[1]];

            isolate.draggable = new Draggable(draggableRange);

            // Value for fa-update-when-dragging.
            var isDragging = false;

            isolate.draggable.on('start', function(e) {
              isDragging = true;

              if (scope.draggableCallbacks.start) {
                scope.main.faDraggableStart({arg1: 'some_value'});
              } else {
                scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              }
            });

            isolate.draggable.on('update', function(e) {
              /* START CALLBACK FUNCTIONALITY */

              if (scope.draggableCallbacks.update) {
                scope.main.faDraggableUpdate({arg1: (e.position[0]/faDrag[dragDirection])*100});
              } else {
                scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              }
              /* END CALLBACK FUNCTIONALITY */

              if(!scope.$$phase && !$rootScope.$$phase) {
                scope.$applyAsync();
              }
            });

            isolate.draggable.on('end', function(e) {
              isDragging = false;

              if (scope.draggableCallbacks.end) {
                scope.main.faDraggableEnd({arg1: (e.position[0]/faDrag[dragDirection])*100});
              } else {
                scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              }
            });

            isolate.surfaceThumb = new Surface({
              size: scope.$eval(attrs.faSize),
              properties: isolate.getProperties()
            });

            isolate.draggable.subscribe(isolate.surfaceThumb);

            if (attrs.faTranslate) {
              isolate.modifier = new Modifier({
                transform: Transform.translate.apply(this, JSON.parse(attrs.faTranslate))
              });
              scope.isolate[scope.$id].renderNode.add(isolate.draggable).add(isolate.modifier).add(isolate.surfaceThumb);
            } else {
              scope.isolate[scope.$id].renderNode.add(isolate.draggable).add(isolate.surfaceThumb);
            }

            scope.envyEvents.on('ngModelUpdate', function(data) {
              var new_pos = function() {
                if ((parseInt(data.ngModel)/100) > 1) {
                  return faDrag[dragDirection];
                } else if ((parseInt(data.ngModel)/100) < 0) {
                  return 0;
                } else {
                  return (parseInt(data.ngModel)/100) * faDrag[dragDirection];
                }
              };

              // if update-when-dragging is false and user is not dragging OR update-when-dragging is true
              if ((!scope.main.faUpdateWhenDragging && !isDragging) || scope.main.faUpdateWhenDragging || scope.main.faUpdateWhenDragging === undefined) {
                isolate.draggable.setPosition([new_pos(), 0]);
              }
            });

            /* --- END CUSTOM MAGIC --- */
            /* --- END CUSTOM MAGIC --- */

            if (attrs.class) {
              isolate.surfaceThumb.setClasses(attrs['class'].split(' '));
            }
          },
          post: function(scope, element, attrs, ctrl, transclude){
            var isolate = $famousDecorator.ensureIsolate(scope);

            var updateContent = function() {
              isolate.surfaceThumb.setContent(element[0].querySelector('div.fa-surface'));
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
