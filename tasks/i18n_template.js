/*
 * grunt-i18n-template
 * https://github.com/ricardo/i18n-template
 *
 * Copyright (c) 2014 Ricardo Memoria
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path'),
	templateRunner = require('./template_runner'),
	messagesRunner = require('./messages_runner'),
	keysRunner = require('./keys_runner');


module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('i18n_template', 'Automate generation of translated HTML files from templates', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			locales: ['en'],
			defaultLocale: 'en',
			messagesFilePrefix: 'messages_',
			forceRefresh: false,
			skipKeyRunner: false,
			skipMessagesRunner: false,
			basePath: undefined
		});

		var files = this.files;

		if (!options.skipKeyRunner) {
			keysRunner.run(grunt, options, files);
		}

		if (!options.skipMessagesRunner) {
			messagesRunner.run(grunt, options, files);
		}

		templateRunner.run(grunt, options, files);
	});

};
