angular
    .module('RegObs')
    .directive('regobsImageList', function (Registration, Pictures, $state) {
        return {
            link: link,
            scope: {},
            template:[
            '<div class="list card regobs-image" ng-repeat="pic in pictureService.getPictures(registrationProp)">',
                '<button type="button" class="button button-assertive button-clear regobs-image-delete" ng-click="pictureService.deletePicture(pic)"><i class="icon ion-close"></i></button>',
                '<div class="item item-image">',
                    '<img ng-src="{{pic.PictureImageBase64}}">',
                '</div>',
                '<label class="item item-input item-input-inset">',
                    '<textarea cols="30" rows="3" placeholder="Bildekommentar" ng-model="pic.PictureComment"></textarea>',
                '</label>',
            '</div>'
            ].join('')
        };

        function link(scope){
            scope.pictureService = Pictures;
            scope.registrationProp = $state.current.data.registrationProp;
        }

    });