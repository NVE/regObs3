var RegObs = RegObs || {};

RegObs.ProggressStatus = (function () {
    var progress = function (total) {
        var self = this;
        var _total = total || 0;
        var _complete = 0;
        var _errors = [];
        self._cancelled = false;

        self.addComplete = function () {
            if (self.isDone())
                return;

            _complete++;
        };

        self.setComplete = function(complete) {
            _complete = complete;
        };

        self.setErrors = function(errors) {
            _errors = errors;
        };

        self.setTotal = function(total) {
            _total = total;
        };

        self.setCancelled = function (cancelled) {
            self._cancelled = cancelled;
        };

        self.isDone = function() {
            return self.getDone() >= _total || self._cancelled;
        };

        self.getTotal = function () {
            return _total;
        };

        self.addError = function (error) {
            if (self.isDone())
                return;

            _errors.push(error);
        };

        self.getErrors = function() {
            return _errors;
        };

        self.hasError = function() {
            return _errors.length > 0;
        };

        self.getDone = function() {
            return (_complete + _errors.length);
        };

        self.getPercent = function () {
            if (_total <= 0)
                return 0;

            return self.getDone() / _total;
        };

        self.getPercentFormated = function() {
            return (self.getPercent() * 100).toFixed(0) +'%';
        };

        self.statusText = function() {
            return self.getDone() + '/' + _total + ' (' + self.getPercentFormated() + ')';
        };
    };
    return progress;
})();