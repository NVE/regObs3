angular
    .module('RegObs')
    .directive('navBarClass', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                // We need to be able to add a class the cached nav-bar
                // Which provides the background color

                var demoColor = 'bar-assertive';
                var prodColor = 'bar-dark';

                var cachedNavBar;
                var cachedHeaderBar;
                // And also the active nav-bar
                // which provides the right class for the title
                var activeNavBar;
                var activeHeaderBar;
                var removeClass = function (newClass) {
                    cachedHeaderBar.classList.remove(newClass);
                    activeHeaderBar.classList.remove(newClass);
                };

                var addClass = function (newClass) {
                    cachedHeaderBar.classList.add(newClass);
                    activeHeaderBar.classList.add(newClass);
                };

                scope.$watch('appVm.settings.data', function (newVal) {

                    cachedNavBar = cachedNavBar || document.querySelector('.nav-bar-block[nav-bar="cached"]');
                    if (cachedNavBar)
                        cachedHeaderBar = cachedHeaderBar || cachedNavBar.querySelector('.bar-header');
                    else return;

                    activeNavBar = activeNavBar || document.querySelector('.nav-bar-block[nav-bar="active"]');
                    if (activeNavBar)
                        activeHeaderBar = activeHeaderBar || activeNavBar.querySelector('.bar-header');
                    else return;

                    if (newVal.env === 'demo') {
                        removeClass(prodColor);
                        addClass(demoColor);
                    } else {
                        removeClass(demoColor);
                        addClass(prodColor);
                    }
                });

            }

        };
    });