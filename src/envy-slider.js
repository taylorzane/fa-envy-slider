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
  .directive('envySlider', ["$famous", "$famousDecorator", function ($famous, $famousDecorator) {
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
              // debugger;
              // scope.main.ngModel = e.pos/2;
              scope.main.faDraggableUpdate({arg1: (e.pos/2)});
              // if(!scope.$$phase && !$rootScope.$$phase) $rootScope.$apply();
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
