/**
 * Update the message files based on the keys from the templates
 *
 * @author Ricardo Memoria
 */
'use strict';

var path = require('path'),
	commons = require('./commons');

/**
 * Entry point for the runner
 * @param  {object}   grunt   The grunt object
 * @param  {object}   options The options set in the Gruntfile.js
 * @param  {[type]}   files   Files defined in the Gruntfile.js
 */
exports.run = function(grunt, options, files) {

	// group all relevant data in a single object
	var context = {keys: [],
		options: options,
		brokenlst: [],
		emptylst: [],
		emptyMsgFile: path.join(options.messagesPath, 'empty_messages.log'),
		brokenMsgFile: path.join(options.messagesPath, 'broken_messages.log')
	};

	// remove the log file with not translated messages
	if (grunt.file.exists(context.emptyMsgFile)) {
		grunt.file.delete(context.emptyMsgFile);
	}
	if (grunt.file.exists(context.brokenMsgFile)) {
		grunt.file.delete(context.brokenMsgFile);
	}

	// Iterate over all specified file groups.
	files.forEach(function(f) {
		// read keys from the template files
		readKeysFromTemplates(f.src, context.keys);
	});

	updateMessageFiles();
	saveEmptyMessagesFile(context);
	saveDefaultLocaleKeys(context);




	/**
	 * Read keys from the template files
	 * @return {[type]} [description]
	 */
	function readKeysFromTemplates(files, keys) {
		files.forEach(function(filepath) {
			// Warn on and remove invalid source files (if nonull was set).
			if (!grunt.file.exists(filepath)) {
				grunt.log.warn('Source file "' + filepath + '" not found.');
				return;
			}

			readKeysFromTemplateFile(filepath, keys);
		});

		return keys;
	}

	/**
	 * Read the keys from the template file
	 * @param  {[type]} filepath [description]
	 * @param  {[type]} keys     [description]
	 * @return {[type]}          [description]
	 */
	function readKeysFromTemplateFile(filepath, keys) {
		var template = grunt.file.read(filepath);

		var templkeys = template.match(/\[\[.+?\]\]/ig);

		if (templkeys) {
			templkeys.forEach(function(item) {
				item = item.substring(2, item.length-2);
				if (keys.indexOf(item) === -1) {
					keys.push(item);
				}
			});
		}
	}

	/**
	 * Update the messages files based on the keys read from the remplates
	 * @param  {[type]}   context [description]
	 * @param  {[type]}   index   [description]
	 * @param  {Function} done    [description]
	 * @return {[type]}           [description]
	 */
	function updateMessageFiles() {
		options.locales.forEach(function(locale) {
			var msgs;

			// is the default locate ?
			if (locale === options.defaultLocale) {
				return;
			}
			var messagefile = commons.messagesFilename(options, locale);
			if (!grunt.file.exists(messagefile)) {
				console.log('file will be created: ' + messagefile);
			}

			var keys = context.keys;
			msgs = commons.loadMessages(grunt, messagefile);

			if (updateMessagesKeys(messagefile, keys, msgs)) {
				grunt.log.writeln('Creating/Updating ' + messagefile);
				commons.saveMessages(grunt, messagefile, msgs);
			}

			generateJsonMessages(locale, msgs);
		});
	}

	/**
	 * Generate the messages in json format
	 * @param  {string} locale Contain the locale name
	 * @param  {string} keys   [description]
	 * @return {[type]}        [description]
	 */
	function generateJsonMessages(locale, msgs) {
		// json path was specified?
		if (typeof options.jsonPath !== 'string') {
			return;
		}

		var filepath = path.join(options.jsonPath, options.messagesFilePrefix + locale + '.json');
		grunt.log.writeln('Generating JSON file ' + filepath);
		if (grunt.file.exists(filepath)) {
			grunt.file.delete(filepath);
		}

		var data = {};
		context.keys.forEach(function(key) {
			var msg = msgs[key];
			data[key] = msg;
		});

		var s = JSON.stringify(data, null, 4);
		grunt.file.write(filepath, s);
	}

	/**
	 * update the keys in memory of the list of messages
	 */
	function updateMessagesKeys(messagefile, keys, msgs) {
		var emptylst = context.emptylst;

		var changed = false;
		keys.forEach(function(key) {
			var msg = msgs[key];
			if (msgs[key] === undefined) {
				msgs[key] = '';
				msg = '';
				changed = true;
			}

			if (msg === '') {
				emptylst.push({file: messagefile, key: key});
			}
		});

		if (options.removeEmptyKeys) {
			// remove empty messages that are not in the key
			var toRemove = [];
			for (var key in msgs) {
				if ((msgs[key] === '') && (keys.indexOf(key) === -1)) {
					toRemove.push(key);
				}
			}

			toRemove.forEach(function(key) {
				delete msgs[key];
			});

			// was changed ?
			if (toRemove.length > 0) {
				changed = true;
			}
		}

		return changed;
	}


	/**
	 * Save file with empty messages
	 * @param  {[type]} context [description]
	 * @return {[type]}         [description]
	 */
	function saveEmptyMessagesFile(context) {
		var fname = context.emptyMsgFile;
		if (grunt.file.exists(fname)) {
			grunt.file.delete(fname);
		}

		if (context.emptylst.length === 0) {
			return;
		}

		var content = 'LIST OF MESSAGE KEYS WITH NO TRANSATION\n' + 
			'This file is automatically generated by grunt\n' + 
			'Generated on ' + (new Date()).toString() + '\n';
		var file = '';
		context.emptylst.forEach(function(item) {
			if (item.file !== file) {
				content += '\n\n\n* FILE: ' + item.file + '\n\n';
				file = item.file;
			}
			content += item.key + '\n';
		});
		grunt.log.writeln('Generating list of empty messages');
		grunt.file.write(fname, content);	
	}


	/**
	 * Save the default keys in the keys.csv file
	 * @param  {[type]}   context [description]
	 * @param  {Function} done    [description]
	 * @return {[type]}           [description]
	 */
	function saveDefaultLocaleKeys(context) {
		var filepath = path.join(options.messagesPath, 'keys.csv');
		if (grunt.file.exists(filepath)) {
			grunt.file.delete(filepath);
		}

		if ((!options.defaultLocale) || (context.keys.length === 0)) {
			return;
		}

		var keys = context.keys;
		var data = [];

		keys.forEach(function(key) {
			data.push([key, '']);
		});

		// generate csv
		var content = commons.convertToCSV(data);
		grunt.file.write(filepath, content);
	}
};