angular
    .module('RegObs')
    .directive('kdvDropdown', function (Utility, AppLogging) {
        'ngInject';

        var link = function (scope) {
            AppLogging.log(scope.showAsRadio);
            Utility
                .getKdvArray(scope.kdvKey, scope.showZero)
                .then(function (kdvRepo) {
                    var i;
                    var endIndex = -1;
                    var startIndex = -1;
                    if(scope.before){
                        startIndex = 0;
                        for(i=0; i<kdvRepo.length; i++){
                            if(kdvRepo[i].Id >= scope.before){
                                endIndex = i;
                                break;
                            }
                        }
                    } else if (scope.after){
                        endIndex = kdvRepo.length;
                        for(i=endIndex; --i;){
                            if(kdvRepo[i].Id < scope.after){
                                startIndex = i+1;
                                break;
                            }

                        }
                    }
                    if(startIndex > -1 && endIndex > -1){
                        scope.kdvArray = kdvRepo.slice(startIndex, endIndex);
                    } else {
                        scope.kdvArray  = kdvRepo;
                    }

                });

            scope.log = function () {
                AppLogging.log(scope.model);
            }
        };

        return {
            scope: {
                title: '@',
                model: '=',
                kdvKey: '@',
                after: '=',
                before: '=',
                showZero: '<',
                showAsRadio: '='
            },
            link: link,
            templateUrl: function (elem, attrs) {
                return attrs.showAsRadio == 'true' ? 'app/directives/kdvdropdown/kdvRadio.html' : 'app/directives/kdvdropdown/kdvDropdown.html';
            },
            replace: true
        }

    });