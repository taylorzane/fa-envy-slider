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
            var Modifier = $famous['famous/core/Modifier'];
            var Draggable = $famous['famous/modifiers/Draggable'];
            var EventHandler = $famous['famous/core/EventHandler'];

            // scope.$watch(
            //   function(){
            //     return isolate.getProperties();
            //   },
            //   function(){
            //     if(isolate.surfaceThumb) {
            //       isolate.surfaceThumb.setProperties(isolate.getProperties());
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

            // attrs.$observe('faSize',function () {
            //   isolate.surfaceThumb.setSize(scope.$eval(attrs.faSize));
            //   _sizeAnimateTimeStamps.push(new Date());

            //   if(_sizeAnimateTimeStamps.length > 5) {
            //     if((_sizeAnimateTimeStamps[4]-_sizeAnimateTimeStamps[0]) <= 1000 ){
            //       console.warn("Using fa-size on fa-surface to animate is significantly non-performant, prefer to use fa-size on an fa-modifier surrounding a fa-surface");
            //     }
            //     _sizeAnimateTimeStamps.shift();
            //   }
            // });

            /* --- START CUSTOM MAGIC --- */
            /* --- START CUSTOM MAGIC --- */

            // isolate.thumbEvent = new EventHandler();

            // debugger;

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
                // scope.main.faDraggableStart({arg1: 'some_value'});
              } else {
                // scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              }

             // if (!$rootScope.$$phase) $rootScope.$digest(); // jshint ignore:line
            });

            isolate.draggable.on('update', function(e) {
              /* START CALLBACK FUNCTIONALITY */

              // if (scope.draggableCallbacks.update) {
              scope.main.faDraggableUpdate({arg1: (e.position[0]/faDrag[dragDirection])*100});
              // if (!$rootScope.$$phase) $rootScope.$digest();
              // } else {
              // scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              // }
              /* END CALLBACK FUNCTIONALITY */
              scope.envyEvents.trigger('thumbUpdate', {pos: (e.position[0]/faDrag[dragDirection])*100});

              scope.$applyAsync();
              // if(!scope.$$phase && !$rootScope.$$phase) scope.$digest();


            });

            isolate.draggable.on('end', function(e) {
              isDragging = false;

              // if (scope.draggableCallbacks.end) {
              //   scope.main.faDraggableEnd({arg1: (e.position[0]/faDrag[dragDirection])*100});
              // } else {
              //   scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              // }

              // if (!$rootScope.$$phase) $rootScope.$digest();
             // if (!$rootScope.$$phase) $rootScope.$digest(); // jshint ignore:line
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
              // scope.$parent.isolate[scope.$parent.$id]
              scope.isolate[scope.$id].renderNode.add(isolate.draggable).add(isolate.modifier).add(isolate.surfaceThumb);
            } else {
              scope.isolate[scope.$id].renderNode.add(isolate.draggable).add(isolate.surfaceThumb);
            }

            scope.$watch('main.ngModel',
              function(){
                if(scope.main.ngModel !== undefined){
                  // console.log('scope.main.ngModel: ', scope.main.ngModel);
                  var new_pos = function() {
                    if ((parseInt(scope.main.ngModel)/100) > 1) {
                      return faDrag[dragDirection];
                    } else if ((parseInt(scope.main.ngModel)/100) < 0) {
                      return 0;
                    } else {
                      return (parseInt(scope.main.ngModel)/100) * faDrag[dragDirection];
                    }
                  };

                  // if update-when-dragging is false and user is not dragging OR update-when-dragging is true
                  if ((!scope.main.faUpdateWhenDragging && !isDragging) || scope.main.faUpdateWhenDragging || scope.main.faUpdateWhenDragging === undefined) {
                    isolate.draggable.setPosition([new_pos(), 0]);
                    // scope.envyEvents.trigger('thumbUpdate', {pos: new_pos()});
                  }
                }
              },
              true
            );

            /* --- END CUSTOM MAGIC --- */
            /* --- END CUSTOM MAGIC --- */

            if (attrs.class) {
              isolate.surfaceThumb.setClasses(attrs['class'].split(' '));
            }
            if(attrs.faDeploy){
              isolate.surfaceThumb.on("deploy",function(){
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
