describe("MapSelectableItemTests", function () {

    beforeEach(function () {
        module('RegObs');
    });


    it("Default header is empty", inject(function (MapSelectableItem) {
        var latlng = new L.LatLng(10.123, 60.1234);
        var obj = new MapSelectableItem(latlng);
        expect(obj.getHeader()).toEqual('');
    }));

    it("setting header as options, sets header", inject(function (MapSelectableItem) {
        var latlng = new L.LatLng(10.123, 60.1234);
        var obj = new MapSelectableItem(latlng, {header: 'test'});
        expect(obj.getHeader()).toEqual('test');
    }));
});