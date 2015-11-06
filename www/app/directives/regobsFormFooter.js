angular
    .module('RegObs')
    .directive('regobsFormFooter', function () {
        return {
            link: link,
            scope: {
                registrationProp: '='
            },
            template: '\
            <regobs-image-list registration-prop="registrationProp"></regobs-image-list>\
            <div class="row">\
                <div class="col text-center">\
                    <regobs-album registration-prop="registrationProp"></regobs-album>\
                </div>\
                <div class="col text-center">\
                    <regobs-camera registration-prop="registrationProp"></regobs-camera>\
                </div>\
            </div>\
            <regobs-save-button></regobs-save-button>'
        };

        function link(scope){
            console.log(scope.registrationProp);
        }

    });