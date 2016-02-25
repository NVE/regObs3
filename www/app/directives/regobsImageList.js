angular
    .module('RegObs')
    .directive('regobsImageList', function (Pictures,  $state) {
        return {
            link: link,
            scope: {},
            template:'\
            <div class="list card regobs-image" ng-repeat="pic in reg.getPictures(registrationProp)">\
                <button class="button button-assertive button-clear regobs-image-delete" ng-click="reg.deletePicture(pic)"><i class="icon ion-close"></i></button>\
                <div class="item item-image">\
                    <img ng-src="{{pic.PictureImageBase64}}">\
                </div>\
                <label class="item item-input item-input-inset">\
                    <textarea cols="30" rows="3" placeholder="Bildekommentar" ng-model="pic.PictureComment"></textarea>\
                </label>\
            </div>\
            <div class="padding"><regobs-save-button></regobs-save-button></div>'
        };

        function link(scope){
            scope.reg = Pictures;
            scope.registrationProp = $state.current.data.registrationProp;
        }

    });