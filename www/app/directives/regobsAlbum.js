angular
    .module('RegObs')
    .directive('regobsAlbum', function () {
        return {
            link: link,
            scope: {},
            replace: true,
            template: '<button class="button button-clear button-block">\
            <i class="icon calm ion-images"></i> Album\
            </button>'
        };

        function link(scope){

        }

    });