'use strict';

var path = require('path'),
	S = require('string');

/**
 * Load the messages from a csv file
 * @param  {[type]}   grunt    [description]
 * @param  {[type]}   filepath [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.loadMessages = function(grunt, filepath) {
	var items = {};
	if (!grunt.file.exists(filepath)) {
		// if file doesn't exists, return an empty list
		return items;
	}

	var data = grunt.file.read(filepath);

	var rows = this.parseCSV(data);
	rows.forEach(function(item) {
		var key = item[0];
		if (key !== '') {
			items[item[0]] = item[1];
		}
	});
	return items;
};

/**
 * Save the messages in a csv file
 * @param  {[type]}   grunt    [description]
 * @param  {[type]}   filepath [description]
 * @param  {[type]}   messages [description]
 */
exports.saveMessages = function (grunt, filepath, messages) {
	// create array to be exported to csv
	var data = [];
	for (var key in messages) {
		var msg = messages[key];
		data.push([key, msg]);
	}

	var csvdata = this.convertToCSV(data);
	grunt.file.write(filepath, csvdata);
};

/**
 * Return the name of the messages file
 * @param  {[type]} options User options in the Gruntfile.js
 * @param  {[type]} locale  [description]
 * @return {[type]}         [description]
 */
exports.messagesFilename = function(options, locale) {
	// if it's the default locale, so there is no file
	if (locale === options.defaultLocale) {
		return;
	}
	return path.join(options.messagesPath, options.messagesFilePrefix + locale + '.csv');
};

/**
 * Replace all occurence of a given substring by a new substring
 * @param  {[type]} data     [description]
 * @param  {[type]} token    [description]
 * @param  {[type]} newtoken [description]
 * @return {[type]}          [description]
 */
exports.replaceAll = function(data, token, newtoken) {
	return S(data).replaceAll(token, newtoken);
};


/**
 * Parse a CSV string data to an array
 * @param  {string} data CSV data in string format
 * @return {array}      array of array of data
 */
exports.parseCSV = function(data) {
	return S(data).parseCSV(',', '"', '\\', '\n');
};

/**
 * Convert an array of arrays to a CSV file
 * @param  {array} lst Contain an array of array of data
 * @return {string}     CSV in string format
 */
exports.convertToCSV = function(lst) {
	var data = '';
	lst.forEach(function(item) {
		var line = S(item).toCSV().s;
		if (data.length > 0) {
			data += '\n';
		}
		data += line;
	});
	return data;
};


exports.escapeHTML = function(s) {
	return S(s).escapeHTML();
};