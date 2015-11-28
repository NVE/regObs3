angular
    .module('RegObs')
    .directive('regobsAlbum', function ($ionicPlatform, $cordovaCamera, $state, Registration) {
        return {
            link: link,
            scope: {},
            replace: true,
            template: '<button class="button button-clear button-block" ng-click="click()">\
            <i class="icon calm ion-images"></i> Album\
            </button>'
        };

        function link(scope){

            scope.click = window.Camera && function () {
                    $ionicPlatform.ready(function() {
                        var options = {
                            quality: 40,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            allowEdit: false,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 1200,
                            targetHeight: 1200,
                            popoverOptions: CameraPopoverOptions,
                            correctOrientation:true
                        };

                        $cordovaCamera.getPicture(options).then(function(imageData) {
                            Registration.addPicture($state.current.data.registrationProp, 'data:image/jpeg;base64,' + imageData);
                            //image.src = "data:image/jpeg;base64," + imageData;
                        }, function(err) {
                            // error
                        });
                    });
                }

        }

    });