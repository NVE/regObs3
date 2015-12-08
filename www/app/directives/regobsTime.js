angular
    .module('RegObs')
    .directive('regobsTime', function(Registration){
        function link(scope){

            scope.timeChanged = function (time) {
                console.log('time changed');
                var now = new Date();
                var newTime = new Date(time);
                if(newTime < now) {
                    Registration.data.DtObsTime = newTime.toISOString();
                } else {
                    Registration.data.DtObsTime = now.toISOString();
                    scope.DtObsTime = now;
                }
            };

            scope.DtObsTime = new Date(Registration.data.DtObsTime);

        }

        return {
            scope: {},
            link: link,
            template: '<label class="item item-input item-stacked-label">\
                <span class="input-label">Observasjonstidspunkt</span>\
                <input type="datetime-local" ng-change="timeChanged(DtObsTime)"\ ng-model="DtObsTime">\
            </label>'
        };
    });
