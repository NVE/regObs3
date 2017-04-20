var regobsMenuItemController = function (Property, Registration, ObservationType, Utility, $scope, $rootScope) {
    var ctrl = this;

    var update = function () {
        if (ctrl.property) {
            ctrl.isSet = Property.exists(ctrl.property);
            ctrl.obsType = ObservationType.fromRegistration(Registration, ctrl.property);
        }
    };

    ctrl.$onInit = function () {
        update();
    };

    $rootScope.$on('$ionicView.beforeEnter', function () {
        update();
    });

    $rootScope.$on('$regObs:registrationSaved', function () {
        update();
    });
};

angular
    .module('RegObs')
    .component('regobsMenuItem', {
        bindings: {
            title: '@',
            property: '@',
            state: '@',
            showSummary: '='
        },
        controller: regobsMenuItemController,
        template: [
            '<ion-item class="item-icon-right" ui-sref="{{$ctrl.state}}">',
            '<h2>{{$ctrl.title}}</h2>',
            '<p ng-if="$ctrl.showSummary"><observation-type-generic show-header="false" show-bullets="false" registration="$ctrl.obsType"></observation-type-generic>',
            '<regobs-image-thumbs class="registration-image-thumbs" registration-prop="{{$ctrl.property}}"></regobs-image-thumbs>',
            '</p>',
            '<i ng-if="$ctrl.isSet" class="icon ion-checkmark-circled balanced regobs-menu-item-icon"></i>',
            '<i class="icon icon-accessory ion-chevron-right"></i>',
            '</ion-item>'
        ].join('')

    });