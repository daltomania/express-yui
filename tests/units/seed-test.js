/*
* Copyright (c) 2013, Yahoo! Inc. All rights reserved.
* Copyrights licensed under the New BSD License.
* See the accompanying LICENSE file for terms.
*/

/*jslint node:true, nomen:true*/

"use strict";

var YUITest = require('yuitest'),
    A = YUITest.Assert,
    OA = YUITest.ObjectAssert,
    suite,
    seed = require('../../lib/seed.js');

suite = new YUITest.TestSuite("seed-test suite");

suite.add(new YUITest.TestCase({
    name: "seed-test",

    setUp: function () {
        seed._clientModules = {};
    },
    tearDown: function () {
        delete seed.config;
        delete seed._clientModules;
    },

    "test getDefaultSeed": function () {
        A.isFunction(seed.getDefaultSeed);

        var out;
        out = seed.getDefaultSeed();

        A.areEqual(1, out.length, 'wrong number of seed');
        A.areEqual('yui', out[0], 'wrong default seed');
    },

    "test addModuleToSeed": function () {
        A.isFunction(seed.addModuleToSeed);

        var yui_config,
            mid;

        yui_config = { };
        seed.config = function () {
            return yui_config;
        };

        mid = seed.addModuleToSeed('newModuleName');

        A.areSame(seed, mid, 'seed.addModuleToSeed() should be chainable');
        A.areEqual(1, yui_config.extendedCore.length, 'wrong extendedCore length');
        A.areEqual('newModuleName',
                   yui_config.extendedCore[0],
                   'wrong extendedCore module');
    },

    "test seed": function () {
        A.isFunction(seed.seed);

        var mid,
            yui_config;


        yui_config = {
            seed: ['yui', 'foo', 'bar']
        };
        seed.config = function () {
            return yui_config;
        };

        mid = seed.seed(['baz']);

        A.areSame(seed, mid, 'seed.addModuleToSeed() should be chainable');
        A.areEqual(1, yui_config.seed.length, 'yui_config should have 1 seed only');

    },

    "test getSeedUrls() with combine": function () {
        var yui_config;

        yui_config = {
            seed: ['yui', 'test'],
            // filter: '-raw',
            base: 'static/',
            combine: true,
            root: '/app/',
            comboBase: 'http://foo.bar/combo?',
            comboSep: '~',
            groups: {
                app: {
                    base: '/app-base/',
                    root: '/app-root/'
                }
            }
        };
        seed.config = function () {
            return yui_config;
        };
        seed._clientModules = {
            test: {
                group: 'app',
                requires: []
            }
        };

        var urls = seed.getSeedUrls();

        // [ 'http://foo.bar/combo?/app/yui/yui-min.js',
        //      '/app-base/test/test-min.js' ]
        // console.log(urls);
        //A.areEqual(2, urls.length, 'only 2 seed expected');
        A.areEqual('http://foo.bar/combo?/app/yui/yui-min.js',
                    urls[0],
                    'urls[0] does not match');
        A.areEqual('/app-base/test/test-min.js',
                    urls[1],
                    'urls[1] does not match');
    },

    "test getSeedUrls()": function () {
        var yui_config;

        yui_config = {
            // no seed, force getDefaultSeed to be called
            filter: 'debug',
            base: '/static/'
        };

        seed.config = function () {
            return yui_config;
        };

        var urls = seed.getSeedUrls();

        // [ '/static/yui/yui-debug.js' ]
        A.areEqual(1, urls.length, 'only 1 seed expected');
        A.areEqual('/static/yui/yui-debug.js',
                    urls[0],
                    'urls[0] does not match');
    },

    "test getSeedUrls({ filter: 'min', combine: false })": function () {
        var yui_config;

        yui_config = {
            // no seed, force getDefaultSeed to be called
            filter: 'min',
            base: '/static/',
            combine: true
        };

        seed.config = function () {
            return yui_config;
        };

        // forcing `raw` version of modules, and no-combine
        var urls = seed.getSeedUrls({
            filter: 'raw',
            combine: false
        });

        // [ '/static/yui/yui.js' ]
        A.areEqual(1, urls.length, 'only 1 seed expected');
        A.areEqual('/static/yui/yui.js',
                    urls[0],
                    'urls[0] does not match');
    },

    "test builJSUrls()": function () {
        var yui_config;

        yui_config = {
            base: '/app/',
            groups: {
                app: {
                    base: '/app-base/'
                }
            }
        };
        seed.config = function () {
            return yui_config;
        };
        seed._clientModules = {
            foo: {
                group: 'app',
                requires: []
            }
        };

        var urls = seed.buildJSUrls('dom', 'foo');

        // console.log(urls);
        A.areEqual(2, urls.length, '2 js expected');
        A.areEqual('/app/dom/dom-min.js',
                    urls[0],
                    'urls[0] does not match');
        A.areEqual('/app-base/foo/foo-min.js',
                    urls[1],
                    'urls[1] does not match');
    },


    "test builCSSUrls()": function () {
        var yui_config;

        yui_config = {
            base: '/app/',
            groups: {
                app: {
                    base: '/app-base/'
                }
            }
        };
        seed.config = function () {
            return yui_config;
        };
        seed._clientModules = {
            cssfoo: {
                group: 'app',
                requires: []
            }
        };

        var urls = seed.buildCSSUrls('cssbase', 'cssfoo');

        // console.log(urls);
        A.areEqual(2, urls.length, '2 css expected');
        A.areEqual('/app/cssbase/cssbase-min.css',
                    urls[0],
                    'urls[0] does not match');
        A.areEqual('/app-base/cssfoo/cssfoo-min.css',
                    urls[1],
                    'urls[1] does not match');
    }

}));

YUITest.TestRunner.add(suite);
