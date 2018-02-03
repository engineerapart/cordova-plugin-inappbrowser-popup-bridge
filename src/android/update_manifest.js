#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    util = require('util');
var inspect = function (obj) { return util.inspect(obj, false, Infinity, false); }

module.exports = function (context) {
    console.log(inspect(context));
    var deferral = context.requireCordovaModule('q').defer();

    var toolsAttribute = "xmlns:tools=\"http://schemas.android.com/tools\"";
    var manifestOpen = "<manifest";

    var overrideAttribute = "tools:overrideLibrary=\"com.braintreepayments.popupbridge\"";
    var usesSdkOpen = "<uses-sdk";

    var projectRoot = context.opts.projectRoot;
    var platformRoot = path.join(projectRoot, 'platforms/android');
    var manifestPath = path.join(platformRoot, 'AndroidManifest.xml');
    console.log("manifestPath: " + manifestPath);

    fs.readFile(manifestPath, function(err, manifest) {
        if(err || !manifest){
            deferral.reject("Failed to read AndroidManifest.xml: " + err);
        }

        manifest = manifest.toString();

        var shouldWrite = false;
        if(manifest.indexOf(overrideAttribute) == -1) {
            manifest = manifest.replace(usesSdkOpen, usesSdkOpen + " " + overrideAttribute + " ");
            shouldWrite = true;
        }

        if(manifest.indexOf(toolsAttribute) == -1) {
            manifest = manifest.replace(manifestOpen, manifestOpen + " " + toolsAttribute + " ");
            shouldWrite = true;
        }

        if(shouldWrite){
            fs.writeFile(manifestPath, manifest, 'utf8', function (err) {
                if (err) {
                    deferral.reject("Failed to write AndroidManifest.xml: " + err);
                }
                console.log("wrote");
                deferral.resolve();
            });
        }else{
            console.log("no write required");
            deferral.resolve();
        }

    });
    return deferral.promise;
};