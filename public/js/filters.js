'use strict';

/* Filters */

angular.module('roApp.filters', [])
    .filter('lenLimit100', [ function () {
        return function (text) {
            return String(text).substring(0, 100)+"...";
        }
    }])
    .filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }]);