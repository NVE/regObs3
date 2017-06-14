(function (L) {
    L.RegobsMarker = L.DivIcon.extend({
        options: {
            iconSize: [44, 44],
            iconAnchor: [19, 44],
            className: 'regobs-svg-marker',
            iconColor: '#fff',
            markerColor: '#D0011B',
            showCircle: false
        },
        initialize: function (options) {
            options = L.Util.setOptions(this, options);

            options.html = this._createHtml();
        },
        _createHtml: function () { 
            var style = "width:" + this.options.iconSize.x + "; height:" + this.options.iconSize.y + ";"
            var svg = '<svg style="' + style + '" x="0px" y="0px" viewBox="0 0 512 512"><style type="text/css">.marker{fill:' + this.options.markerColor + ';}.circle{fill:' + this.options.iconColor + ';}</style>';
            svg += this._createPath();
            if (this.options.showCircle) {
                svg += this._createCircle();
            }
            svg += '</svg>';
            if (this.options.icon) {
                svg += this._createIcon();
            };
            
            return svg;
        },
        _createPath: function () {
            return '<path class="marker" d="M 401.745 195.902 C 401.745 232.702 389.545 271.402 371.445 308.602 C 303.045 414.802 216.645 512.102 216.645 512.102 C 216.645 512.102 117.245 418.102 53.645 306.602 C 37.745 271.802 27.345 235.002 27.345 198.102 C 27.245 94.602 111.045 4.602 214.445 4.602 C 317.945 4.602 401.745 92.302 401.745 195.902 Z"/>';
        },
        _createCircle: function () {
            return '<ellipse class="circle" cx="211.821" cy="186.095" rx="95" ry="95"/>';
        },
        _createIcon: function () {
            var style = 'color:' + this.options.iconColor;
            return '<i class="regobs-svg-marker-icon ' + (this.options.iconClass ? this.options.iconClass : '')  +' ' + this.options.icon +'" style="' +style +'"></i>';
        }
    });

    L.regobsMarker = function (options) {
        return new L.RegobsMarker(options);
    }
})(window.L);