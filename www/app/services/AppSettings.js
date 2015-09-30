angular
    .module('RegObs')
    .provider('AppSettings', function AppSettingsProvider(){

        var settings = {};
        var locale = {
            value: undefined,
            available: [
                {key: 'nb', name: 'Norsk'},
                {key: 'en', name:'English'}
            ],
            storageKey: 'regobsLocale'
        };


        settings.hazardRatingStyles = {
            '0': {
                weight: 3,
                color: '#C8C8C8',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'stable'
            },
            '1': {
                weight: 3,
                color: '#75B100',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'calm'
            },
            '2': {
                weight: 3,
                color: '#FFCC33',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'balanced'
            },
            '3': {
                weight: 3,
                color: '#E46900',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'energized'
            },
            '4': {
                weight: 3,
                color: '#D21523',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'assertive'
            },
            '5': {
                weight: 3,
                color: '#3E060B',
                dashArray: '',
                fillOpacity: 0.5,
                opacity: 0.4,
                className: 'royal'
            },
            clicked: {

                fillOpacity: 0.8,
                opacity: 0.9
            }
        };

        this.setHazardRatingStyles = function(newStyle){
            settings.hazardRatingStyles = newStyle;
        };


        this.$get = function AppSettingsFactory(LocalStorage){
            settings.getLocale = function(){
                if(!locale.value)
                    locale.value = LocalStorage.get(locale.storageKey, locale.available[0].key);
                return locale;
            };

            settings.setLocale = function (newLocale) {
                locale.value = LocalStorage.set(locale.storageKey, newLocale);
            };

            return settings;
        };
    });