angular
    .module('RegObs')
    .factory('RegobsPopup', function ($ionicPopup, $rootScope, $q, $pbService, $timeout, $translate) {
        var RegobsPopup = this;

        RegobsPopup.delete = function (title, text, confirmText) {
            return $ionicPopup.confirm({
                title: title,
                template: text,
                buttons: [
                    { text: 'Avbryt' },
                    {
                        text: confirmText || 'Slett',
                        type: 'button-assertive',
                        onTap: function (e) {
                            // Returning a value will cause the promise to resolve with the given value.
                            return true;
                        }
                    }
                ]
            });
        };

        RegobsPopup.confirm = function (title, text, confirmText, cancelText, cancelType) {
            return $ionicPopup.confirm({
                title: title,
                template: text,
                buttons: [
                    {
                        text: cancelText || 'Avbryt',
                        type: cancelType || ''
                    },
                    {
                        text: confirmText || 'OK',
                        type: 'button-positive',
                        onTap: function (e) {
                            // Returning a value will cause the promise to resolve with the given value.
                            return true;
                        }
                    }
                ]
            });
        };

        RegobsPopup.alert = function (title, text) {
            return $ionicPopup.alert({
                title: title,
                template: text
            });
        };

        RegobsPopup.downloadProgress = function (title, workFunction, options) {
            return $q(function(resolve, reject) {
                var scope = $rootScope.$new(); //Create new scope for popup
                scope.progressName = Math.random().toString(36); //create unique name for DOM element
                var defaultOptions = {
                    closeOnComplete: true, //Close popup automatically on completed, else ok button is shown.
                    longTimoutMessageDelay: 0, //Delay for timout message in seconds. 0 means never show.
                    progressOptions: {
                        color: '#333',
                        // This has to be the same size as the maximum width to
                        // prevent clipping
                        strokeWidth: 4,
                        trailWidth: 1,
                        easing: 'easeInOut',
                        duration: 10,
                        from: { color: '#aaa', width: 1 },
                        to: { color: '#333', width: 4 },
                        // Set default step function for all animate calls
                        step: function(state, circle) {
                            circle.path.setAttribute('stroke', state.color);
                            circle.path.setAttribute('stroke-width', state.width);
                            var text =
                                '<i class="icon ion-ios-cloud-download"></i><div class="downloadprogress-percent">' +
                                    scope.downloadStatus.getPercentFormated()
                                    +'</div><div class="downloadprogress-value">(' +
                                    scope.downloadStatus.getDone() +
                                    '/' +
                                    scope.downloadStatus.getTotal() +
                                    ')' +
                                    '</div>';
                            circle.setText(text);
                        }
                    }
                };
                var cancelUpdatePromise = $q.defer();

                var result = angular.extend({}, defaultOptions, options);

                scope.showLongDownloadMessage = false;
                var timeout;
                if (result.longTimoutMessageDelay > 0) {
                    timeout = $timeout(function() {
                        scope.showLongDownloadMessage = true;
                    }, result.longTimoutMessageDelay * 1000);
                }

                scope.progressOptions = result.progressOptions;
                scope.cancelDownload = function() {
                    cancelUpdatePromise.resolve();
                };
                scope.showOkButton = !result.closeOnComplete;
                scope.complete = false;

                var popup = $ionicPopup.show({
                    templateUrl: 'app/common/downloadprogress.html',
                    title: title,
                    scope: scope
                });

                scope.closePopup = function () {
                    popup.close();
                };

                var progressFunc = function (status) {
                    if (!(status instanceof RegObs.ProggressStatus))
                        throw new Error('Progress function must return type RegObs.ProggressStatus');

                    $timeout(function() {
                        scope.downloadStatus = status;
                        $pbService.animate(scope.progressName, status.getPercent());
                    });
                };

                var onComplete = function () {
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }

                    scope.complete = true;

                    if (result.closeOnComplete) {
                        popup.close();
                    }
                };

                workFunction(progressFunc, cancelUpdatePromise)
                    .then(function() {
                        onComplete();
                        resolve(); //All done
                    }).catch(function(error) {
                        onComplete();
                        reject(error); //Cancelled
                    });
            });
        };

        return RegobsPopup;
    });