angular
    .module('RegObs')
    .directive('kdvDropdown', function (Utility) {

        var link = function (scope) {
            Utility
                .getKdvRepositories()
                .then(function (KdvRepos) {
                    scope.kdvArray  = KdvRepos[scope.kdvKey];
                    scope.model = scope.model || scope.kdvArray[0].Id;
                    //vm.iceCoverObs.IceCoverTID = vm.iceCoverObs.IceCoverTID || vm.kdvArrays.iceCover[0].Id;
                });
        };

        return {
            scope: {
                title: '@',
                model: '=',
                kdvKey: '@'
            },
            link: link,
            templateUrl: 'app/directives/kdvDropdown.html'
        }

    });