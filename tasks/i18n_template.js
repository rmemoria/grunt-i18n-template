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
			// prefix 
			messagesFilePrefix: 'messages_',
			// force the generation of all templates regardless of the file timestamp
			forceRefresh: false,
			// don't check for key changes in keys.csv
			skipKeyRunner: false,
			// don't generate the csv and json messages
			skipMessagesRunner: false,
			// don't generate templates
			skipTemplateRunner: false,
			// the path that will be striped off from the template folder
			basePath: undefined,
			// specify the folder where json files will be generated from csv messages
			jsonPath: undefined,
			// if true, remove empty keys found in CSV and not found in template files
     removeEmptyKeys: true,
     // if false, don't escape HTML in messages
     htmlEscape: true
		});

		var files = this.files;

		if (!options.skipKeyRunner) {
			keysRunner.run(grunt, options, files);
		}

		if (!options.skipMessagesRunner) {
			messagesRunner.run(grunt, options, files);
		}

		if (!options.skipTemplateRunner) {
			templateRunner.run(grunt, options, files);
		}
	});

};
