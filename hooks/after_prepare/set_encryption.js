#!/usr/bin/env node

var fs = require('fs');     // nodejs.org/api/fs.html
var plist = require('plist');  // www.npmjs.com/package/plist

var FILEPATH = 'platforms/ios/.../...-Info.plist';
//var FILEPATH = 'platforms/ios/***/***-Info.plist';

module.exports = function (context) {

	if (context.opts.platforms.indexOf('ios') < 0) {
		return;
	}

    var xml = fs.readFileSync(FILEPATH, 'utf8');
    var obj = plist.parse(xml);

    obj.ITSAppUsesNonExemptEncryption = false;
    obj.CFBundleShortVersionString = obj.CFBundleShortVersionString.replace(/\./g, '');

    xml = plist.build(obj);
    fs.writeFileSync(FILEPATH, xml, { encoding: 'utf8' });
};