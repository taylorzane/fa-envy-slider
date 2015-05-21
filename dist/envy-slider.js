/**
* Custom Slider element for Control Envy.
* Used with envy-thumb, -track, and -track-fill.
*
* Requirements:
* Must bind to a load
* Thumb must be draggable
* Track must fill with thumb
* Track and thumb must reflect load brightness
*
*/

angular.module('famous.angular')
  .directive('envySlider', ["$famous", "$famousDecorator", "$rootScope", function ($famous, $famousDecorator, $rootScope) {
    'use strict';
    return {
      bindToController: true,
      controllerAs: 'main',
      controller: angular.noop,
      template: '<div></div>',
      restrict: 'E',
      transclude: true,
      scope: {
        ngModel: '=',
        faUpdateWhenDragging: '=',
        faDraggableStart: '&',
        faDraggableUpdate: '&',
        faDraggableEnd: '&'
      },
      compile: function(tElement, tAttrs){
        return  {
          pre: function(scope, element, attrs){
            var isolate = $famousDecorator.ensureIsolate(scope);

            var ContainerSurface = $famous["famous/surfaces/ContainerSurface"];
            var EventHandler = $famous['famous/core/EventHandler'];

            var options = scope.$eval(attrs.faOptions) || {};
            isolate.renderNode = new ContainerSurface(options);
            $famousDecorator.addRole('renderable',isolate);
            isolate.show();

            $famousDecorator.sequenceWith(
              scope,
              function(data) {
                isolate.renderNode.add(data.renderGate);
              }
            );

            //  FIXME: This shouldn't be necessary to init the binding.
            if (scope.main.ngModel === undefined) scope.main.ngModel = 0; // jshint ignore:line

            scope.draggableCallbacks = function(){
              var callbacks = { start: false, update: false, end: false };
              if (attrs.faDraggableStart) {
                callbacks.start = true;
              }
              if (attrs.faDraggableUpdate) {
                callbacks.update = true;
              }
              if (attrs.faDraggableEnd) {
                callbacks.end = true;
              }

              return callbacks;
            }();

            scope.envyEvents = new EventHandler();

            scope.envyEvents.on('thumbUpdate', function(e) {
              // scope.main.ngModel = e.pos;
              scope.main.faDraggableUpdate({arg1: e.pos});
              // scope.main.faDraggableUpdate({arg1: (e.pos/2)});
              // if(!scope.$$phase && !$rootScope.$$phase) $rootScope.$apply();
              if(!scope.$$phase && !$rootScope.$$phase) {
                scope.$apply();
              }
            });

            console.log('envy-slider loaded.');
          },
          post: function(scope, element, attrs, ctrl, transclude){
            var isolate = $famousDecorator.ensureIsolate(scope);

            transclude(scope, function(clone) {
              element.find('div').append(clone);
            });

            $famousDecorator.registerChild(scope, element, isolate);
          }
        };
      }
    };
  }]);

/**
* Custom Switch element for Control Envy.
* Used with envy-slider, -track, and -track-fill.
*
* Requirements:
* Must two-way bind to a load (power).
* Must be draggable (but snap to 0% or 100%).
* Must accept any markup for Surface content.
*
*/

angular.module('famous.angular')
  .directive('envySwitch', ['$famous', '$famousDecorator', '$interpolate', '$controller', '$compile', '$rootScope', function ($famous, $famousDecorator, $interpolate, $controller, $compile, $rootScope) {
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

            scope.$watch(
              function(){
                return isolate.getProperties();
              },
              function(){
                if(isolate.surfaceSwitch) {
                  isolate.surfaceSwitch.setProperties(isolate.getProperties());
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
              isolate.surfaceSwitch.setSize(scope.$eval(attrs.faSize));
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

            var initialDragPosition;

            isolate.draggable.on('start', function(e) {
              initialDragPosition = e.position[0];

              // if (scope.draggableCallbacks.start) {
              //   scope.main.faDraggableStart({arg1: 'some_value'});
              // } else {
              //   scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              // }

             if (!$rootScope.$$phase) $rootScope.$digest(); // jshint ignore:line
            });


            /* DRAGGABLE UPDATE
            isolate.draggable.on('update', function(e) {
              if (scope.draggableCallbacks.update) {
                // scope.main.faDraggableUpdate({arg1: (e.position[0]/faDrag[dragDirection])*100});
              } else {
                // scope.main.ngModel = (e.position[0]/faDrag[dragDirection])*100;
              }

              if (!$rootScope.$$phase) $rootScope.$digest(); // jshint ignore:line
            });
            */

            isolate.draggable.on('end', function(e) {
              if (scope.draggableCallbacks.end) {
                if (e.position[0] === 0 && initialDragPosition === e.position[0]) {
                  scope.main.faDraggableEnd({arg1: true});
                } else if (e.position[0] === faDrag[dragDirection] && initialDragPosition === e.position[0]) {
                  scope.main.faDraggableEnd({arg1: false});
                } else if (e.position[0] <= initialDragPosition) {
                  if (e.position[0] <= faDrag[dragDirection]*.5) {
                    scope.main.faDraggableEnd({arg1: false});
                    isolate.draggable.setPosition([0,0]);
                  } else {
                    isolate.draggable.setPosition(faDrag);
                  }
                } else if (e.position[0] > initialDragPosition) {
                  if (e.position[0] > faDrag[dragDirection]*.5) {
                    scope.main.faDraggableEnd({arg1: true});
                    isolate.draggable.setPosition(faDrag);
                  } else {
                    isolate.draggable.setPosition([0,0]);
                  }
                } else {
                  console.log('phooey', e.position[0]);
                }
              } else {
                if (e.position[0] === 0 && initialDragPosition === e.position[0]) {
                  scope.main.ngModel = true;
                } else if (e.position[0] === faDrag[dragDirection] && initialDragPosition === e.position[0]) {
                  scope.main.ngModel = false;
                } else if (e.position[0] <= initialDragPosition) {
                  if (e.position[0] <= faDrag[dragDirection]*.5) {
                    scope.main.ngModel = false;
                    isolate.draggable.setPosition([0,0]);
                  } else {
                    isolate.draggable.setPosition(faDrag);
                  }
                } else if (e.position[0] > initialDragPosition) {
                  if (e.position[0] > faDrag[dragDirection]*.5) {
                    scope.main.ngModel = true;
                    isolate.draggable.setPosition(faDrag);
                  } else {
                    isolate.draggable.setPosition([0,0]);
                  }
                } else {
                  console.log('phooey', e.position[0]);
                }
              }

             if (!$rootScope.$$phase) $rootScope.$digest(); // jshint ignore:line
            });

            isolate.surfaceSwitch = new Surface({
              size: scope.$eval(attrs.faSize),
              properties: isolate.getProperties()
            });

            isolate.draggable.subscribe(isolate.surfaceSwitch);

            if (attrs.faTranslate) {
              isolate.modifier = new Modifier({
                transform: Transform.translate.apply(this, JSON.parse(attrs.faTranslate))
              });
              scope.isolate[scope.$id].renderNode.add(isolate.draggable).add(isolate.modifier).add(isolate.surfaceSwitch);
            } else {
              scope.isolate[scope.$id].renderNode.add(isolate.draggable).add(isolate.surfaceSwitch);
            }

            scope.$watch('main.ngModel',
              function(){
                if(scope.main.ngModel !== undefined){
                  var new_pos = function() {
                    if (scope.main.ngModel) {
                      return faDrag[dragDirection];
                    } else {
                      return 0;
                    }
                  };
                  isolate.draggable.setPosition([new_pos(), 0]);
                }
              },
              true
            );

            /* --- END CUSTOM MAGIC --- */
            /* --- END CUSTOM MAGIC --- */

            if (attrs.class) {
              isolate.surfaceSwitch.setClasses(attrs['class'].split(' '));
            }
            if(attrs.faDeploy){
              isolate.surfaceSwitch.on("deploy",function(){
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
              isolate.surfaceSwitch.setContent(element[0].querySelector('div.fa-surface'));
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

            scope.$watch(
              function(){
                return isolate.getProperties();
              },
              function(){
                if(isolate.surfaceThumb) {
                  isolate.surfaceThumb.setProperties(isolate.getProperties());
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
              isolate.surfaceThumb.setSize(scope.$eval(attrs.faSize));
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

            // isolate.thumbEvent = new EventHandler();

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


              // if(!scope.$$phase && !$rootScope.$$phase) $rootScope.$apply();

              scope.envyEvents.trigger('thumbUpdate', {pos: (e.position[0]/faDrag[dragDirection])*100});
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

            scope.$watch(
              function(){
                return isolate.getProperties();
              },
              function(){
                if(isolate.surfaceTrackFill) {
                  isolate.surfaceTrackFill.setProperties(isolate.getProperties());
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

            scope.$watch('main.ngModel',
              function(){
                if(scope.main.ngModel !== undefined){
                  var original_size = JSON.parse(attrs.faSize);
                  if (typeof(scope.main.ngModel) === 'number') {
                    setTrackFillSize();
                  } else if (typeof(scope.main.ngModel) === 'boolean') {
                    isolate.surfaceTrackFillModifier.setOpacity(scope.main.ngModel ? 1 : 0, {curve: 'easeOut', duration : 200});
                  }
                }
              },
              true
            );

            scope.envyEvents.on('thumbUpdate', function(e) {
              isolate.surfaceTrackFill.setSize([e.pos, JSON.parse(attrs.faSize)[1]]);
            });

            // FIXME: This shouldn't be necessary.
            // cont.: This should also be for vertical and horizontal.
            // Bootstrap the track.
            isolate.surfaceTrackFillModifier.setOpacity(0); // FIXME: Should we be doing this?

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

/**
* Custom Track element for Control Envy.
* Used with envy-slider, -thumb, and -track-fill.
*
* Requirements:
* Must accept any markup for Surface content.
*
*
*
*/

angular.module('famous.angular')
  .directive('envyTrack', ['$famous', '$famousDecorator', '$interpolate', '$controller', '$compile', function ($famous, $famousDecorator, $interpolate, $controller, $compile) {
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
                if(isolate.renderNode) {
                  isolate.surfaceTrack.setProperties(isolate.getProperties());
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
              isolate.surfaceTrack.setSize(scope.$eval(attrs.faSize));
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

            isolate.surfaceTrack = new Surface({
              size: scope.$eval(attrs.faSize),
              properties: isolate.getProperties()
            });

            if (attrs.faTranslate) {
              isolate.modifier = new Modifier({
                transform: Transform.translate.apply(this, JSON.parse(attrs.faTranslate))
              });
              scope.isolate[scope.$id].renderNode.add(isolate.modifier).add(isolate.surfaceTrack);
            } else {
              scope.isolate[scope.$id].renderNode.add(isolate.surfaceTrack);
            }

            /* --- END CUSTOM MAGIC --- */
            /* --- END CUSTOM MAGIC --- */

            if (attrs.class) {
              isolate.surfaceTrack.setClasses(attrs['class'].split(' '));
            }
            if(attrs.faDeploy){
              isolate.surfaceTrack.on("deploy",function(){
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
              isolate.surfaceTrack.setContent(element[0].querySelector('div.fa-surface'));
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
