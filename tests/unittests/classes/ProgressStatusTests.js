describe("ProgressStatusTests", function () {
    it("Total not set in constructor returns total=0", function () {
        var progress = new RegObs.ProggressStatus();
        expect(progress.getTotal()).toEqual(0);
    });

    it("Total 5 set in constructor returns total=5", function () {
        var progress = new RegObs.ProggressStatus(5);
        expect(progress.getTotal()).toEqual(5);
    });

    it("Total not set returns 0 in percent progress", function () {
        var progress = new RegObs.ProggressStatus();
        expect(progress.getPercent()).toEqual(0);
    });

    it("Nothing is done returns 0 in percent progress", function () {
        var progress = new RegObs.ProggressStatus(10);
        expect(progress.getPercent()).toEqual(0);
    });

    it("1 of 10 total returns 0.1 percent complete", function () {
        var progress = new RegObs.ProggressStatus(10);
        progress.addComplete();
        expect(progress.getPercent()).toEqual(0.1);
    });

    it("1 complete and 1 error returns returns 0.2 percent complete", function () {
        var progress = new RegObs.ProggressStatus(10);
        progress.addComplete();
        progress.addError(new Error('failed'));
        expect(progress.getPercent()).toEqual(0.2);
    });

    it("add error adds to errors", function () {
        var progress = new RegObs.ProggressStatus(2);
        var error = new Error('failed');
        var error2 = new Error('failed2');
        progress.addError(error);
        progress.addError(error2);

        var errors = progress.getErrors();
        expect(errors.length).toEqual(2);
        expect(errors[0]).toEqual(error);
        expect(errors[1]).toEqual(error2);
    });

    it("complete can never go more than total", function () {
        var progress = new RegObs.ProggressStatus(2);
        progress.addComplete();
        progress.addComplete();
        progress.addComplete();

        expect(progress.getPercent()).toEqual(1.0);
        expect(progress.getDone()).toEqual(2);
    });
});