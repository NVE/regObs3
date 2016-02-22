angular
    .module('RegObs')
    .directive('kdvDropdown', function (Utility) {

        var link = function (scope) {
            Utility
                .getKdvRepositories()
                .then(function (KdvRepos) {
                    var kdvRepo = KdvRepos[scope.kdvKey];
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
        };

        return {
            scope: {
                title: '@',
                model: '=',
                kdvKey: '@',
                after: '=',
                before: '='
            },
            link: link,
            templateUrl: 'app/directives/kdvdropdown/kdvDropdown.html',
            replace: true
        }

    });