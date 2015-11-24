angular
    .module('RegObs')
    .factory('RegobsPopup', function ($ionicPopup) {
        var RegobsPopup = this;

        RegobsPopup.delete = function (title, text, confirmText) {
            return $ionicPopup.confirm({
                title: title,
                template: text,
                buttons: [
                    {text: 'Avbryt'},
                    {
                        text: confirmText || 'Slett',
                        type: 'button-assertive',
                        onTap: function (e) {
                            // Returning a value will cause the promise to resolve with the given value.
                            return true;
                        }
                    }
                ]
            });
        };

        RegobsPopup.confirm = function (title, text, confirmText, cancelText) {
            return $ionicPopup.confirm({
                title: title,
                template: text,
                buttons: [
                    {text: cancelText || 'Avbryt'},
                    {
                        text: confirmText || 'OK',
                        type: 'button-positive',
                        onTap: function (e) {
                            // Returning a value will cause the promise to resolve with the given value.
                            return true;
                        }
                    }
                ]
            });
        };

        RegobsPopup.alert = function(title, text) {
            return $ionicPopup.alert({
                title: title,
                template: text
            });
        };

        return RegobsPopup;
    });