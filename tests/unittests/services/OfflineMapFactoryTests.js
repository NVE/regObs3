describe("OfflineMapFactoryTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    beforeEach(module('RegObs'));

    beforeEach(inject(function ($httpBackend) {
        $httpBackend.whenGET(/.*/).respond('');
    }));


    it("getOfflineAreas: empty file returns empty result", function (done) {
        inject(function (OfflineMap, PresistentStorage, $q, $rootScope) {
            spyOn(PresistentStorage, 'readAsText')
                .and.callFake(function () {
                    return $q(function (resolve) { resolve('[]'); });
                });

            OfflineMap.getOfflineAreas()
                .then(function (result) {
                    expect(result).toEqual([]);
                    done();
                });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        });
    });

    it("downloadArea: saves correct meta", function (done) {
        inject(function (OfflineMap, PresistentStorage, Map, RegObsClasses, $q, $rootScope) {

            var cancel = $q.defer();

            spyOn(PresistentStorage, 'readAsText')
                .and.callFake(function () {
                    return $q(function (resolve) { resolve('[]'); });
                });

            spyOn(PresistentStorage, 'createDirectory')
                .and.callFake(function () {
                    return $q(function (resolve) { resolve(); });
                });

            spyOn(PresistentStorage, 'checkIfFileExsists')
               .and.callFake(function () {
                   return $q(function (resolve, reject) { reject({ code: 1, message: 'File not found' }); });
               });

            spyOn(PresistentStorage, 'getFileSize')
               .and.callFake(function () {
                   return $q(function (resolve) { resolve(500); });
               });

            spyOn(Map, 'getTileByName')
              .and.callFake(function () {
                  return new RegObsClasses.RegObsTileLayer('http://dummy/tile/{z}/{y}/{x}', { reuseTiles: false, folder: 'testfolder', name: 'topo', embeddedUrl: '', embeddedMaxZoom: 17, debugFunc: null });;
              });

            var downloadedTiles = [];

            spyOn(PresistentStorage, 'downloadUrl').and.callFake(function (sourceurl, filename) {
                return $q(function (resolve) {
                    downloadedTiles.push({ sourceurl: sourceurl, filename: filename });
                    resolve();
                });
            });

            var savedMeta = [];

            spyOn(OfflineMap, 'saveOfflineAreas').and.callFake(function (meta) {
                return $q(function (resolve) {
                    savedMeta.push(meta);
                    resolve();
                });
            });

            var progress = [];

            var progressFunc = function (status) {
                progress.push(status);
            };

            OfflineMap.downloadMapFromXyzList('testarea', L.latLngBounds([68.43151284537514, 15.435791015625002], [68.48118500901752, 15.612258911132814]),
                [{ "x": 1, "y": 0, "z": 1 }, { "x": 2, "y": 0, "z": 1 }], 1, 1, ["topo"], progressFunc, cancel)
                       .then(function () {
                           expect(downloadedTiles.length).toEqual(2);
                           var last = savedMeta[savedMeta.length-1][0];
                           expect(last.name).toEqual('testarea');
                           expect(last.size).toEqual(1000);
                           expect(last.tiles).toEqual(2);
                           expect(last.errors.length).toEqual(0);
                           expect(last.complete.length).toEqual(2);
                           expect(last.zoom).toEqual(1);
                           expect(last.cancelled).toEqual(false);
                           expect(last.hasError).toEqual(false);
                           done();
                       });
            $rootScope.$apply(); //needs to be called to trigger $q promise
        });
    });
});