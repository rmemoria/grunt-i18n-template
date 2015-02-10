/**
 * Generate the destination files based on the templates and messages files
 *
 * @author Ricardo Memoria
 */
'use strict';

var path = require('path'),
	fs = require('fs'),
	commons = require('./commons');

/**
 * Entry point for the runner
 * @param  {object}   grunt   The grunt object
 * @param  {object}   options The options set in the Gruntfile.js
 * @param  {[type]}   files   Files defined in the Gruntfile.js
 */
exports.run = function(grunt, options, files) {

	var msgs;
	var messagesfile;
	var msgstat;

	options.locales.forEach(function(locale) {
		generateTemplatesLocale(files, locale);
	});


	/**
	 * Run the template for each locale
	 * @param  {object} files  List of files and its destinations
	 * @param  {string} locale the locale string
	 */
	function generateTemplatesLocale(files, locale) {
		// get messages file name
		messagesfile = commons.messagesFilename(options, locale);
		msgs = undefined;
		msgstat = messagesfile? fs.statSync(messagesfile) : undefined;

		// load messages
//		var msgs = commons.loadMessages(grunt, filepath);
		parseTemplates(files, locale, msgs);
	}


	/**
	 * Parse the template files for a given locale
	 * @param  {[type]} files
	 * @param  {[type]} locale
	 * @param  {[type]} msgs
	 * @return {[type]}
	 */
	function parseTemplates(files, locale, msgs) {
		files.forEach(function (file) {
			var destpath = file.dest;

			file.src.forEach(function(filepath) {

				// calculate destination file
				var destfile = getDestinationFile(filepath, locale, destpath);
/*				// has base path ?
				if (options.basePath && filepath.indexOf(options.basePath) === 0) {
					destfile = filepath.substring(options.basePath.length + 1, filepath.length);
				}
				else {
					destfile = filepath;
				}
				destfile = path.join(destpath, locale, destfile);
*/
				if (isNecessaryToRun(filepath, destfile)) {
					parseTemplateFile(filepath, destfile);
				}
			});
		});
	}

	function getDestinationFile(filepath, locale, destpath) {
		var destfile;
		// has base path ?
		if (options.basePath && filepath.indexOf(options.basePath) === 0) {
			destfile = filepath.substring(options.basePath.length + 1, filepath.length);
		}
		else {
			destfile = filepath;
		}
		destfile = path.join(destpath, locale, destfile);

		if (options.transformDestFile) {
			if (typeof options.transformDestFile !== 'function') {
				throw "options.transformDestFile must be a function";
			}

			destfile = options.transformDestFile(destfile);
		}

		return destfile;
	}

	/**
	 * Return the messages of the current locale
	 * @return {object} List of messages
	 */
	function getMessages() {
		if (!msgs && messagesfile) {
			msgs = commons.loadMessages(grunt, messagesfile);
		}
		return msgs;
	}

	/**
	 * Parse the template file and generate the localized files
	 * @param  {string} filepath the file to parse 
	 * @param  {object} msgs list of messages
	 * @param  {string} locale the locale to run the template
	 * @param  {string} destpath the destination folder
	 */
	function parseTemplateFile(filepath, destfile) {
		var msgs = getMessages();

		// read template file
		var template = grunt.file.read(filepath);
		// read keys from template
		var keys = template.match(/\[\[.+?\]\]/ig);

		if (keys) {
			keys.forEach(function(key) {
				key = key.substring(2, key.length-2);
				var msg;
				if (msgs)  {
					msg = msgs[key];
				}
				if ((msg === undefined) || (msg === '')) {
					msg = key;
				}
       msg = options.htmlEscape ? commons.escapeHTML(msg) : msg;
				template = template.split('[[' + key + ']]').join(msg);
			});
		}

		grunt.log.writeln('Generating ' + destfile);
		grunt.file.mkdir(path.dirname(destfile));
		grunt.file.write(destfile, template);
	}

	/**
	 * Check if must run for this file based on its creation time and 
	 * the flag 'forceRefresh'
	 * @param  {[type]}  templatefile [description]
	 * @param  {[type]}  destfile     [description]
	 * @return {Boolean}              true if it's necessary to run the template
	 */
	function isNecessaryToRun(templatefile, destfile) {
		if (options.forceRefresh) {
			return true;
		}

		if (!grunt.file.exists(destfile)) {
			return true;
		}

		// check if messages file is older than destination file
		var deststat = fs.statSync(destfile);
//		if (msgstat) {
//			console.log(msgstat.mtime + " ... " + deststat.mtime + " ... " + (msgstat.mtime > deststat.mtime));
//		}
		if (msgstat && msgstat.mtime > deststat.mtime) {
			return true;
		}

		var oristat = fs.statSync(templatefile);
		if (oristat.mtime > deststat.mtime) {
			return true;
		}

		return false;
	}
};
