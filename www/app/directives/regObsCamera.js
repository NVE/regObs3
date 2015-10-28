angular
    .module('RegObs')
    .directive('regobsCamera', function ($ionicPlatform, $cordovaCamera, Registration) {

        return {
            link: link,
            scope: {
                registrationType: '@'
            },
            template: '<button ng-click="click()">Kamera test</button><img id="myImage">'
        };

        function link(scope){

            scope.click = window.Camera && function () {
                $ionicPlatform.ready(function() {
                    var options = {
                        quality: 50,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 100,
                        targetHeight: 100,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false,
                        correctOrientation:true
                    };

                    $cordovaCamera.getPicture(options).then(function(imageData) {
                        var image = document.getElementById('myImage');
                        image.src = "data:image/jpeg;base64," + imageData;
                    }, function(err) {
                        // error
                    });
                });
            }


        }


    });