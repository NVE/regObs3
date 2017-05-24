angular
    .module('RegObs')
    .factory('RegobsPopup', function ($ionicPopup, $rootScope, $q, $pbService, $timeout, AppLogging, Translate, $translate, moment, $interval) {
        var RegobsPopup = this;

        RegobsPopup.delete = function (title, text, confirmText) {
            return $translate(['CANCEL', 'DELETE', title, text, confirmText]).then(function (translations) {
                return $ionicPopup.confirm({
                    title: translations[title] || title,
                    template: translations[text] || text,
                    buttons: [
                        { text: translations['CANCEL'] },
                        {
                            text: translations[confirmText] || confirmText || translations['DELETE'],
                            type: 'button-assertive',
                            onTap: function (e) {
                                // Returning a value will cause the promise to resolve with the given value.
                                return true;
                            }
                        }
                    ]
                });
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
            return Translate.translateWithFallback(title)
                .then(function (translatedHeader) {
                    return $q(function (resolve, reject) {
                        var scope = $rootScope.$new(); //Create new scope for popup
                        scope.progressName = Math.random().toString(36); //create unique name for DOM element
                        var defaultOptions = {
                            closeOnComplete: true, //Close popup automatically on completed, else ok button is shown.
                            closeOnError: false, //Close popup automatically when there is some errors.
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
                                step: function (state, circle) {
                                    circle.path.setAttribute('stroke', state.color);
                                    circle.path.setAttribute('stroke-width', state.width);
                                    var text =
                                        '<i class="icon ion-ios-cloud-download"></i><div class="downloadprogress-percent">' +
                                        scope.downloadStatus.getPercentFormated() +
                                        '</div><div class="downloadprogress-value">(' +
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

                        var lastProgress = moment();
                        scope.showLongDownloadMessage = false;

                        var checkProgress = null;
                        if (result.longTimoutMessageDelay > 0) {
                            checkProgress = $interval(function () {
                                var diff = moment().diff(lastProgress, 'seconds');
                                AppLogging.log('progressdiff: ' + diff);
                                scope.showLongDownloadMessage = diff > result.longTimoutMessageDelay;
                            }, 1000);
                        }

                        scope.progressOptions = result.progressOptions;
                        scope.cancelDownload = function () {
                            cancelUpdatePromise.resolve();
                        };
                        scope.complete = false;

                        scope.isRunning = function () {
                            return !scope.complete || scope.isProcessing();
                        };
                        scope.isProcessing = function () {
                            return !scope.complete && (scope.downloadStatus && scope.downloadStatus.isDone());
                        };

                        var popup = $ionicPopup.show({
                            templateUrl: 'app/common/downloadprogress.html',
                            title: translatedHeader,
                            scope: scope
                        });

                        scope.closePopup = function () {
                            if (checkProgress) {
                                $interval.cancel(checkProgress);
                            }
                            popup.close();
                            if (scope.error) {
                                reject(scope.error); //Cancelled
                            } else {
                                resolve(); //All done
                            }
                        };

                        var progressFunc = function (status) {
                            if (!(status instanceof RegObs.ProggressStatus))
                                throw new Error('Progress function must return type RegObs.ProggressStatus');

                            $timeout(function () {
                                lastProgress = moment();
                                scope.downloadStatus = status;
                                $pbService.animate(scope.progressName, status.getPercent());
                            });
                        };

                        var onComplete = function () {
                            if (checkProgress) {
                                $interval.cancel(checkProgress);
                            }
                            scope.complete = true;
                            if (result.closeOnComplete &&
                                !(scope.downloadStatus && (scope.downloadStatus.hasError() && !result.closeOnError))) {
                                scope.closePopup();
                            }
                        };

                        var onError = function (error) {
                            scope.error = error;
                            onComplete();
                        };

                        workFunction(progressFunc, cancelUpdatePromise).then(onComplete).catch(onError);
                    });
                });
        };

        return RegobsPopup;
    });