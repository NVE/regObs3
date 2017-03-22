//Fix for back button due to issue with missing back button from map menu
//read more: https://github.com/driftyco/ionic/issues/1647
angular.module('RegObs').directive('defaultNavBackButton',
    function defaultNavBackButton($ionicHistory, $state, $ionicConfig, $ionicViewSwitcher, $ionicPlatform, AppLogging) {
        'ngInject';
        return {
            link: link,
            restrict: 'EA'
        };

        function link(scope, element, attrs) {
            scope.backTitle = function () {
                var defaultBack = getDefaultBack();
                if ($ionicConfig.backButton.previousTitleText() && defaultBack) { //previous title text is turned off in app.js config
                    return $ionicHistory.backTitle() || defaultBack.title || 'BACK';
                }
            };
            scope.goBack = function () {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else {
                    goDefaultBack();
                }
            };
            scope.$on('$stateChangeSuccess', function () {
                element.toggleClass('hide', (!getDefaultBack() && !$ionicHistory.backView()));
                //if (!$ionicHistory.backView() && getDefaultBack()){
                //    $ionicViewSwitcher.nextDirection('back');
                //    $ionicHistory.nextViewOptions({
                //        disableBack: true,
                //        historyRoot: true
                //    });
                //}

            });

            $ionicPlatform.registerBackButtonAction(function () {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else if (getDefaultBack()) {
                    goDefaultBack();
                } else {
                    navigator.app.exitApp();
                }
            }, 100);
        }

        function getDefaultBack() {
            var defaultBack = ($state.current.data || {}).defaultBack;
            if (!defaultBack && $state.current.name !== 'start') {
                defaultBack = { state: 'start', title: 'MAP' }
            }
            return defaultBack;
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