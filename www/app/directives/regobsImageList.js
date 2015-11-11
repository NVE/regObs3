angular
    .module('RegObs')
    .directive('regobsImageList', function (Registration, $state) {
        return {
            link: link,
            scope: {},
            template:'<div class="list card" ng-repeat="pic in reg.registration.Picture | filter:{RegistrationTID:reg.getRegistrationTID(registrationProp)}">\
                <div class="item item-image"><img ng-src="{{pic.PictureImageBase64}}"></div>\
                <label class="item item-input item-input-inset"><textarea cols="30" rows="3" placeholder="Bildekommentar" ng-model="pic.PictureComment"></textarea></label>\
            </div>'
        };

        function link(scope){
            scope.reg = Registration;
            scope.registrationProp = $state.current.data.registrationType;
        }

    });