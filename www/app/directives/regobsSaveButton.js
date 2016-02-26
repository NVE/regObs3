(function(){
    'use strict';

    var regobsSaveButton = {
        bindings: {
            saveAction: '&'
        },
        require: {
            formCtrl: '?^form'
        },
        template: '<button class="button button-block button-calm" ng-click="$ctrl.save()">Lagre</button>',
        controller: function(RegobsPopup){
            var ctrl = this;

            ctrl.save = function(){
                console.log('formCtrl', ctrl.formCtrl);
                if(ctrl.formCtrl && ctrl.formCtrl.$invalid){
                    return RegobsPopup.delete(
                        'Skjema har mangler',
                        'Hvis du fortsetter, kan du miste verdier du har skrevet inn. Avbryt for å rette markerte felter.',
                        'OK'
                    ).then(function(confirmed){
                        if(confirmed){
                            ctrl.saveAction();
                        }
                    });
                }
                ctrl.saveAction();
            }
        }
    };

    angular
        .module('RegObs')
        .component('regobsSaveButton', regobsSaveButton);


})();
