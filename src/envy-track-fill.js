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
      scope: true,
      transclude: true,
      template: '<div class="fa-surface"></div>',
      restrict: 'EA',
      link: function(scope, element, attrs, ctrl, transclude) {

        transclude(scope, function(clone, scope) {
          element.append(clone);
        });
      },
      compile: function(tElement, tAttrs){
        return {
          pre: function(scope, element, attrs){

            var isolate = $famousDecorator.ensureIsolate(scope);

            var Surface = $famous['famous/core/Surface'];
            var Transform = $famous['famous/core/Transform'];
            var EventHandler = $famous['famous/core/EventHandler'];

            scope.$watch(
              function(){
                return isolate.getProperties();
              },
              function(){
                if(isolate.renderNode) {
                  isolate.renderNode.setProperties(isolate.getProperties());
                }
              },
              true
            );

            scope.$watch(
              function() {
                return scope.ngModel;
              },
              function() {
                if(scope.ngModel) {
                  var original_size = JSON.parse(attrs.faSize);
                  var new_size = function(o) {
                    if ((Number(scope.ngModel)/100) > 1) {
                      return o[0];
                    } else if ((Number(scope.ngModel)/100) < 0) {
                      return 0;
                    } else {
                      return (Number(scope.ngModel)/100) * o[0];
                    }
                  };
                  isolate.renderNode.setSize([new_size(original_size), original_size[1]]);
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
                if(attrs[faProp]) baseProperties[prop] = scope.$eval(attrs[faProp]);
              }
              return baseProperties;
            };
            var _sizeAnimateTimeStamps = [];

            attrs.$observe('faSize',function () {
              isolate.renderNode.setSize(scope.$eval(attrs.faSize));
              _sizeAnimateTimeStamps.push(new Date());

              if(_sizeAnimateTimeStamps.length > 5) {
                if((_sizeAnimateTimeStamps[4]-_sizeAnimateTimeStamps[0]) <= 1000 ){
                  console.warn("Using fa-size on fa-surface to animate is significantly non-performant, prefer to use fa-size on an fa-modifier surrounding a fa-surface");
                }
                _sizeAnimateTimeStamps.shift();
              }
            });

            isolate.renderNode = new Surface({
              size: scope.$eval(attrs.faSize),
              properties: isolate.getProperties()
            });
            $famousDecorator.addRole('renderable',isolate);
            isolate.show();

            if (attrs.class) {
              isolate.renderNode.setClasses(attrs['class'].split(' '));
            }
            if(attrs.faDeploy){
              isolate.renderNode.on("deploy",function(){
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
              isolate.renderNode.setContent(element[0].querySelector('div.fa-surface'));
            };

            updateContent();

            transclude(scope, function(clone) {
              angular.element(element[0].querySelectorAll('div.fa-surface')).append(clone);
            });

            $famousDecorator.registerChild(scope, element, isolate, function() {
            });


          }
        };
      }
    };
  }]);
