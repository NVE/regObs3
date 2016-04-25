angular
    .module('RegObs')
    .directive('defaultNavBackButton',
    function defaultNavBackButton($ionicHistory, $state, $ionicConfig, $ionicViewSwitcher, $ionicPlatform) {
        'ngInject';
        return {
            link: link,
            restrict: 'EA'
        };

        function link(scope, element, attrs) {
            scope.backTitle = function() {
                var defaultBack = getDefaultBack();
                if ($ionicConfig.backButton.previousTitleText() && defaultBack) {
                    return $ionicHistory.backTitle() || defaultBack.title;
                }
            };
            scope.goBack = function() {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else {
                    goDefaultBack();
                }
            };
            scope.$on('$stateChangeSuccess', function() {
                element.toggleClass('hide', !getDefaultBack());
            });
            $ionicPlatform.registerBackButtonAction(function () {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else if(getDefaultBack()) {
                    goDefaultBack();
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