/**
 * Update the keys in template and message files. This is useful when you
 * send the keys (the main language used in the templates) to be revised
 * and changes might occur
 *
 * @author Ricardo Memoria
 */
'use strict';

var commons = require('./commons'),
	path = require('path');


/**
 * Entry point for the runner
 * @param  {object}   grunt   The grunt object
 * @param  {object}   options The options set in the Gruntfile.js
 * @param  {[type]}   files   Files defined in the Gruntfile.js
 * @param  {Function} done    Called when operation is done
 */
exports.run = function(grunt, options, files, done) {

	var diffs = loadDiffKeys();

	if (!diffs) {
		return;
	}

	grunt.log.writeln('changes detected in keys:');
	for (var key in diffs) {
		grunt.log.writeln(' * ' + key + ' ==> ' + diffs[key]);
	}

	updateAllTemplates(diffs);
	updateAllMessages(diffs);


	/**
	 * load keys that must be updated
	 * @param  {Function} done Callback function called when different keys are loaded done(keys)
	 */
	function loadDiffKeys() {
		var fname =  path.join(options.messagesPath, 'keys.csv');

		// keys file exists
		if (!grunt.file.exists(fname)) {
			return;
		}

		// loead messages from keys.csv
		var keys = commons.loadMessages(grunt, fname);

		var diff = {};
		var found = false;
		for (var key in keys) {
			var msg = keys[key];
			if (msg !== '' && msg !== key) {
				diff[key] = msg;
				found = true;
			}
		}

		if (found) {
			return diff;
		}
	}

	/**
	 * Update all template files based on the new keys
	 * @param  {[type]} diffs [description]
	 * @return {[type]}       [description]
	 */
	function updateAllTemplates(diffs) {
		files.forEach(function(f) {
			f.src.forEach(function(filepath) {
				updateTemplateFile(filepath, diffs);
			});
		});
	}

	/**
	 * Update the template file based on the different keys
	 * @param  {string} filepath The file to change
	 * @param  {object} diffs    Object containing keys as properties
	 */
	function updateTemplateFile(filepath, diffs) {
		var template = grunt.file.read(filepath);
		var changed = false;
		for (var key in diffs) {
			var actualkey = '[[' + key + ']]';
			// check if the key is in the template
			if (template.indexOf(actualkey) >= 0) {
				// update the key in the template
				var newkey = '[[' + diffs[key] + ']]';
				template = commons.replaceAll(template, actualkey, newkey);
				changed = true;
			}
		}

		// any key was changed ?
		if (changed) {
			// because saving a file is a costing operation, 
			// just do that if the template was changed
			grunt.log.writeln('Updating keys in ' + filepath);
			grunt.file.write(filepath, template);
		}
	}


	function updateAllMessages(diffs) {
		options.locales.forEach(function(locale) {
			if (locale === options.defaultLocale) {
				return;
			}

			var filepath = commons.messagesFilename(options, locale);

			updateMessageFile(filepath, diffs);
		});
	}


	function updateMessageFile(filepath, diffs) {
		var msgs = commons.loadMessages(grunt, filepath);

		if (!msgs) {
			return;
		}

		var changed = false;
		for (var key in diffs) {
			if (msgs[key]) {
				var newkey = diffs[key];
				var msg = msgs[key];
				delete msgs[key];
				msgs[newkey] = msg;
				changed = true;
			}
		}

		if (changed) {
			grunt.log.writeln('Updating keys in ' + filepath);
			commons.saveMessages(grunt, filepath, msgs);
		}
	}
};