/**
 * Created by storskel on 07.09.2015.
 */
angular
    .module('RegObs')
    .factory('HeaderColor', function HeaderColor(AppSettings) {
        var HeaderColor = this;

        var demoColor = 'bar-assertive';
        var prodColor = 'bar-dark';
        var cachedHeaderBar, activeHeaderBar, cachedNavBar, activeNavBar;

        var removeClass = function (newClass) {
            cachedHeaderBar.classList.remove(newClass);
            activeHeaderBar.classList.remove(newClass);
        };

        var addClass = function (newClass) {
            cachedHeaderBar.classList.add(newClass);
            activeHeaderBar.classList.add(newClass);
        };

        HeaderColor.init = function () {
            cachedNavBar = cachedNavBar || document.querySelector('.nav-bar-block[nav-bar="cached"]');
            if (cachedNavBar)
                cachedHeaderBar = cachedHeaderBar || cachedNavBar.querySelector('.bar-header');
            else return;

            activeNavBar = activeNavBar || document.querySelector('.nav-bar-block[nav-bar="active"]');
            if (activeNavBar)
                activeHeaderBar = activeHeaderBar || activeNavBar.querySelector('.bar-header');
            else return;

            if (AppSettings.data.env === 'demo') {
                removeClass(prodColor);
                addClass(demoColor);
            } else {
                removeClass(demoColor);
                addClass(prodColor);
            }
        };


        return HeaderColor;

    });
