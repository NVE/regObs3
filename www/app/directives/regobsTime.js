angular
    .module('RegObs')
    .directive('regobsTime', function(){
        function link(scope, elem, attrs, formCtrl){
            scope.formCtrl = formCtrl;

            scope.timeChanged = function (time) {
                console.log('time changed');

                var now = new Date();
                var newTime = new Date(time);
                if(newTime < now) {
                    //Registration.data.DtObsTime = newTime.toISOString();
                    scope.regObject[scope.regProp] = newTime.toISOString();
                } else {
                    //Registration.data.DtObsTime = now.toISOString();
                    scope.regObject[scope.regProp] = now.toISOString();
                    scope.DtObsTime = now;
                }
            };

            scope.getText = function () {
                return scope.text || 'Observasjonstidspunkt';
            };

            scope.$watch('regObject', function(newVal){
                if(scope.regObject){
                    scope.DtObsTime = new Date(scope.regObject[scope.regProp]);
                }
            });

            /*scope.formCtrl = formCtrl;

            scope.timeChanged = function (time) {
                console.log('time changed');

                var now = new Date();
                var newTime = new Date(time);
                if(newTime < now) {
                    //Registration.data.DtObsTime = newTime.toISOString();
                    scope.regObject = newTime.toISOString();
                } else {
                    //Registration.data.DtObsTime = now.toISOString();
                    scope.regObject = now.toISOString();
                    scope.DtObsTime = now;
                }
            };

            scope.getText = function () {
                return scope.text || 'Observasjonstidspunkt';
            };

            scope.$watch('regObject', function(newVal){
                if(scope.regObject){
                    scope.DtObsTime = new Date(scope.regObject);
                }
            });*/

        }

        return {
            require: '?^form',
            scope: {
                regObject: '=',
                regProp: '@',
                text: '@'
            },
            link: link,
            template: '<label class="item item-input item-stacked-label">\
                <span class="input-label" ng-bind="::getText()" ng-class="{assertive:formCtrl[regProp].$invalid}"></span>\
                <input name="{{regProp}}" type="datetime-local" ng-change="timeChanged(DtObsTime)" ng-model="DtObsTime" required>\
            </label>'
        };
    });
