angular
    .module('RegObs')
    .directive('regobsTime', function(){
        function link(scope){

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



            if(scope.regObject)
                scope.DtObsTime = new Date(scope.regObject[scope.regProp]);

        }

        return {
            scope: {
                regObject: '=',
                regProp: '@',
                text: '@'
            },
            link: link,
            template: '<label class="item item-input item-stacked-label">\
                <span class="input-label" ng-bind="::getText()"></span>\
                <input type="datetime-local" ng-change="timeChanged(DtObsTime)"\ ng-model="DtObsTime">\
            </label>'
        };
    });
