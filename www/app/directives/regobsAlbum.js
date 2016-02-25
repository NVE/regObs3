angular
    .module('RegObs')
    .directive('regobsAlbum', function ($ionicPlatform, $cordovaCamera, $state, Pictures) {
        return {
            link: link,
            scope: {},
            replace: true,
            template: '<div><button class="button button-clear button-block" ng-click="click()" ng-hide="imgLoading">\
            <i class="icon calm ion-images"></i> Album\
            </button>\
            <ion-spinner class="spinner-light" ng-if="imgLoading"></ion-spinner></div>'
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
                            resizeImage(1200, uri, function(imageData) {
                                Pictures.addPicture($state.current.data.registrationProp, imageData);
                                //image.src = "data:image/jpeg;base64," + imageData;
                                scope.imgLoading = false;
                                scope.$apply();

                            });
                        }, function(err) {
                            scope.imgLoading = false;
                            // error
                        });
                    });
                }

        }

        function resizeImage(longSideMax, url, callback) {
            var tempImg = new Image();
            tempImg.src = url;
            tempImg.onload = function() {
                // Get image size and aspect ratio.
                var targetWidth = tempImg.width;
                var targetHeight = tempImg.height;
                var aspect = tempImg.width / tempImg.height;

                // Calculate shorter side length, keeping aspect ratio on image.
                // If source image size is less than given longSideMax, then it need to be
                // considered instead.
                if (tempImg.width > tempImg.height) {
                    longSideMax = Math.min(tempImg.width, longSideMax);
                    targetWidth = longSideMax;
                    targetHeight = longSideMax / aspect;
                }
                else {
                    longSideMax = Math.min(tempImg.height, longSideMax);
                    targetHeight = longSideMax;
                    targetWidth = longSideMax * aspect;
                }

                // Create canvas of required size.
                var canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                var ctx = canvas.getContext("2d");
                // Take image from top left corner to bottom right corner and draw the image
                // on canvas to completely fill into.
                ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, targetWidth, targetHeight);

                callback(canvas.toDataURL("image/jpeg", 0.4));
            };
        }

    });