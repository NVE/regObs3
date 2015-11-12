angular
    .module('RegObs')
    .directive('regobsCamera', function ($ionicPlatform, $cordovaCamera, $state, Registration) {

        return {
            link: link,
            replace: true,
            scope: {},
            template: '<button class="button button-clear button-block" ng-click="click()"><i class="icon calm ion-camera"></i> Bilde</button>'
        };

        function link(scope){

            scope.click = window.Camera && function () {
                $ionicPlatform.ready(function() {
                    var options = {
                        quality: 40,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: false,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 1200,
                        targetHeight: 1200,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: true,
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