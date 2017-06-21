angular
    .module('RegObs')
    .directive('regobsAlbum', function ($ionicPlatform, $cordovaCamera, $state, Pictures, AppSettings) {
        'ngInject';
        return {
            link: link,
            scope: {},
            replace: true,
            template: [
                '<div>',
                    '<button type="button" class="button button-clear button-block button-dark icon-left ion-images" ng-click="click()" ng-hide="imgLoading">',
                        'Album',
                    '</button>',
                    '<ion-spinner class="spinner-dark" ng-if="imgLoading"></ion-spinner>',
                '</div>'
            ].join('')
        };

        function link(scope){
            scope.imgLoading = false;

            scope.click = window.Camera && function () {
                    $ionicPlatform.ready(function() {
                        scope.imgLoading = true;
                        //var options = {
                        //    quality: 40,
                        //    destinationType: Camera.DestinationType.FILE_URI,
                        //    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        //    allowEdit: false,
                        //    encodingType: Camera.EncodingType.JPEG,
                        //    targetWidth: AppSettings.imageSize,
                        //    targetHeight: AppSettings.imageSize,
                        //    popoverOptions: CameraPopoverOptions,
                        //    correctOrientation:true
                        //};

                        //$cordovaCamera.getPicture(options).then(function(uri){
                        //    Pictures.addPicture($state.current.data.registrationProp, uri);
                        //    //image.src = "data:image/jpeg;base64," + imageData;
                        //    scope.imgLoading = false;

                        //}, function(err) {
                        //    scope.imgLoading = false;
                        //    // error
                        //});

                        Pictures.getAlbumPicture($state.current.data.registrationProp).then(function () {
                            scope.imgLoading = false;
                        });

                    });
                }

        }



    });