/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .directive('regobsMap', function (Map) {
        'ngInject';
        function link(scope, elem) {
            Map.createMap(elem[0]);
        }

        return {
            restrict: 'A',
            link: link,
            scope: {
                
            }
        };

    });
