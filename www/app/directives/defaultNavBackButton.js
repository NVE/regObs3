angular
    .module('RegObs')
    .directive('defaultNavBackButton',
    function defaultNavBackButton($ionicHistory, $state, $ionicConfig, $ionicViewSwitcher, $ionicPlatform, AppLogging) {
        'ngInject';
        return {
            link: link,
            restrict: 'EA'
        };

        function link(scope, element, attrs) {
            scope.backTitle = function () {
                var defaultBack = getDefaultBack();
                //if ($ionicConfig.backButton.previousTitleText() && defaultBack) {
                //    return $ionicHistory.backTitle() || defaultBack.title || 'BACK';
                //}

                if (defaultBack && defaultBack.title && (defaultBack.force || !$ionicHistory.backView())) {
                    return defaultBack.title;
                } else {
                    return 'BACK';
                }
            };
            scope.goBack = function () {
                var defaultBack = getDefaultBack();
                if (defaultBack && (defaultBack.force || !$ionicHistory.backView())){
                    goDefaultBack();
                } else if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                }else {
                    $state.go('start');
                }
            };
            scope.$on('$stateChangeSuccess', function () {
                element.toggleClass('hide', (!getDefaultBack() && !$ionicHistory.backView()));
            });

            $ionicPlatform.registerBackButtonAction(function () {
                var defaultBack = getDefaultBack();
                if (defaultBack && (defaultBack.force || !$ionicHistory.backView())) {
                    goDefaultBack();
                } else if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else {
                    navigator.app.exitApp();
                }
            }, 100);
        }

        function getDefaultBack() {
            return ($state.current.data || {}).defaultBack;
        }

        function goDefaultBack() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });
            $state.go(getDefaultBack().state);
        }
    });