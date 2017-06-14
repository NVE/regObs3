L.Control.InfoControl = L.Control.extend({
    options: {
        // topright, topleft, bottomleft, bottomright
        position: 'topleft'
    },
    initialize: function (options) {
        L.Util.setOptions(this, options);
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-info-container');
        var innerContainer = L.DomUtil.create('div', 'leaflet-info-container-wrapper', container);
        this._icon = L.DomUtil.create('i', 'icon ' + (this.options.icon || ''), innerContainer);
        if (!this.options.icon) {
            this._icon.style.display = 'none';
        }

        this._span = L.DomUtil.create('span', '', innerContainer);
        this._span.innerHTML = this.options.text || '';
        return container;
    },

    setText: function (text) {
        this._span.innerHTML = text;
    }

});

L.control.infoControl = function (id, options) {
    return new L.Control.InfoControl(id, options);
}