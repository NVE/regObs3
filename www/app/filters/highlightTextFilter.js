angular.module('RegObs')
    .filter('regobsHighlightText', function ($sce) {
        return function (text, phrase) {
            if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                '<span class="text-bold">$1</span>')

            return $sce.trustAsHtml(text);
        };
    });