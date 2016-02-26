angular
    .module('RegObs')
    .directive('regobsMenuItem', function () {

        var link = function (scope) {

        };

        return {
            scope:{
                title: '@',
                condition: '=',
                state: '@',
                badgeText: '='
            },
            link: link,
            template: '<ion-item class="item-icon-right"\
                            ui-sref="{{state}}">\
                            {{title}}\
                            <span class="badge badge-balanced" ng-if="condition">{{badgeText || \'1\'}}</span>\
                            <i class="icon icon-accessory ion-chevron-right"></i>\
                       </ion-item>'
        }
    });