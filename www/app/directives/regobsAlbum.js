angular
    .module('RegObs')
    .directive('regobsAlbum', function ($ionicPlatform, $cordovaCamera, $state, Pictures) {
        'ngInject';
        return {
            link: link,
            scope: {},
            replace: true,
            template: [
                '<div>',
                    '<button type="button" class="button button-clear button-block" ng-click="click()" ng-hide="imgLoading">',
                        '<i class="icon stable ion-images"></i> Album',
                    '</button>',
                    '<ion-spinner class="spinner-light" ng-if="imgLoading"></ion-spinner>',
                '</div>'
            ].join('')
        };

        function link(scope){
            scope.imgLoading = false;

            scope.click = window.Camera && function () {
                    $ionicPlatform.ready(function() {
                        scope.imgLoading = true;
                        var options = {
                            quality: 40,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            allowEdit: false,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 1200,
                            targetHeight: 1200,
                            popoverOptions: CameraPopoverOptions,
                            correctOrientation:true
                        };

                        $cordovaCamera.getPicture(options).then(function(uri){
                            Pictures.addPicture($state.current.data.registrationProp, uri);
                            //image.src = "data:image/jpeg;base64," + imageData;
                            scope.imgLoading = false;

                        }, function(err) {
                            scope.imgLoading = false;
                            // error
                        });
                    });
                }

        }



    });