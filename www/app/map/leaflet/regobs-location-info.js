/**
* Map location info control
*/
(function () {
    L.ObsLocationInfo = L.Control.extend({
        options: {
            cssClass: 'map-observation-info',
            icon: 'ion-flag',
            showIcon: true
        },


        onAdd: function () {
            this._div = L.DomUtil.create('div', this.options.cssClass);
            this.setText('');
            return this._div;
        },

        setText: function (distanceText) {
            var flag = '<i class="icon ' + this.options.icon + '"></i> ';
            this._div.innerHTML = (this.options.showIcon ? flag : '') + distanceText;
        }
    });

    L.obsLocationInfo = function (options) {
        return new L.ObsLocationInfo(options);
    };
})();