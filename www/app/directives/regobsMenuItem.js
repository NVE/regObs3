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
            template: [
                '<ion-item class="item-icon-right" ui-sref="{{state}}">',
                    '{{title}}',
                    '<span ng-if="condition"><span class="badge badge-balanced regobs-menu-item-badge" ng-if="badgeText">{{badgeText}}</span><i ng-if="!badgeText" class="icon ion-checkmark-circled balanced regobs-menu-item-icon"></i></span>',
                    '<i class="icon icon-accessory ion-chevron-right"></i>',
                '</ion-item>'
            ].join('')
        }
    });