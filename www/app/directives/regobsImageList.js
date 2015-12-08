angular
    .module('RegObs')
    .directive('regobsImageList', function (Registration, Utility, $state) {
        return {
            link: link,
            scope: {},
            template:'<div class="list card" ng-repeat="pic in reg.data.Picture | filter:{RegistrationTID:util.registrationTid(registrationProp)}">\
                <div class="item item-image"><img ng-src="{{pic.PictureImageBase64}}"></div>\
                <label class="item item-input item-input-inset"><textarea cols="30" rows="3" placeholder="Bildekommentar" ng-model="pic.PictureComment"></textarea></label>\
            </div><div class="padding"><regobs-save-button></regobs-save-button></div>'
        };

        function link(scope){
            scope.reg = Registration;
            scope.util = Utility;
            scope.registrationProp = $state.current.data.registrationProp;
        }

    });