angular
    .module('RegObs')
    .directive('regobsAlbum', function () {
        return {
            link: link,
            scope: {},
            replace: true,
            template: '<button class="button button-large button-clear">\
            <i class="icon ion-images"></i>\
            </button>'
        };

        function link(scope){

        }

    });