Raven
    .config('https://2e07df8503a34dc9973eedd05e7a0f49@sentry.io/170000', {
        shouldSendCallback: function (data) {
            return false; //Do not report errors until environment is set up
        }
    })
    .addPlugin(Raven.Plugins.Angular)
    .install();