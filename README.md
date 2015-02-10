# grunt-i18n-template

> Automate the generation of translated HTML files from templates

##Goal
Translation task for grunt - Parse template files (usually .html files) creating a copy of them for each configured language, replacing the messages by messages stored in CSV files.

In a nutshell, suppose you have the following template files:

```js
templates/**/*.html
```
and you have the following CSV files containing the translated messages

```js
messages_en.csv
messages_pt_BR.csv
messages_ru.csv
```

The output will be:

```js
en/**/*.html
pt_BR/**/*.html
ru/**/*.html
```
with the messages inside the template being replaced by the messages found in the CSV files.

## Why another i18n task?

I'm starting an Angular project that must be translated to several languages. These are my requirements:

 - I want to automate as much as possible the translation process;
 - I don't like run-time replacement, but I want to generate the translated files during build time, making it faster during execution; 
 - I don't want translation to become a pain during development;

I search all over the npm repository for a solution (or solutions) that could meet these requirements. Unfortunately I didn't find any, so I developed my own ;)

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-i18n-template --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-i18n-template');
```

## The "i18n_template" task

### Overview
In your project's Gruntfile, add a section named `i18n_template` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  i18n_template: {
    options: {
      // Task-specific options go here.
    },
    files: {
      // Target-specific file lists and/or options go here.
      'dest_folder': ['template_files']
    },
  },
});
```

In the `files` section, you define the destination folder and the list of template files.

### Quick Steps
####1. Create template files using your natural language
Create your template files, and inside them write messages using your preferred language (for example, English). Enclose the messages to be translated inside double brackets. For example:

```html
<div class='title'>[[Application title]]</div>
```

In grunt options, define the language you're using in the template files:
```js
options: {
  ..
  defaultLocale: 'en'
  ..
}
```
 and the task will generate a copy of the templates with no brackets around the messages:
```html
<div class='title'>Application title</div>
```

####2. Configure the target languages
In the task options, set the list of languages that your application will support and the folder where you'll store the message files. Example:
```js
options: {
  ..
  defaultLocale: ['en', 'fr', 'pt_BR', 'ru'],
  messagesPath: 'resources/messages'
  ..
}
```
When you run grunt, the task will get all messages found in the template files and will create a CSV file for each configured locale (or update them, if the file already exists)
```js
resources/messages/messages_en.csv
resources/messages/messages_fr.csv
resources/messages/messages_pt_BR.csv
resources/messages/messages_ru.csv
```


####3. Translate the messages
Send the messages to be translated. CSV files can be easily edited. Each CSV file will contain 2 columns - The messages in the default language found in the templates and the target language (that will be initially blank).

Just the second column must be translated to the original language. The first column (with the language found in the template) shall not be changed.

For example, in messages_pt_BR.csv:
```csv
"Application title","Título da aplicação"
```

####4. Update the message files
When the CSV files are returned from translation, just replace them and run grunt again. The task will generate new files from the templates and the translated messages. That's all!

###Execution steps
The execution is done in 3 steps:

1. **Key runner** - Check the file `keys.csv` for changes in the message keys used in templates and CSV files. If so, update both template and CSV files with the new key;
2. **Messages runner** - Parse all template files and generate (or update, if it exists) the CSV files. It's created/update one CSV file for each supported locale in the system, except for the default language (the one used in templates). For the default language, a new keys.csv containing its key is generated. Old messages, i.e, messages not found in templates, are removed from CSV files only if there is no translated message (useful during development, when you constantly change the messages in template);
3.  **Template runner** - This is the last step. The target files are generated from the template files and its messages stored in CSV files. A new folder with the name of  the `language` is created in the destination folder for each supported language, and it's generated one file for each template found.

### Options

#### options.locales
Type: `Array of String`
Default value: `['en']`

The list of locales that you want your application to support.

#### options.defaultLocale
Type: `String`
Default value: `'en'`

The default language used in your template files. When setting a default language, the task will not generate the CSV file like all other messages, but will generate a file called keys.csv (that will be explained later).

#### options.messagesFilePrefix
Type: `String`
Default value: `'messages_'`

Specify the prefix used in the CSV files containing the messages to be translated. The file name will have the format:
{messagesFilePrefix}{locale}.csv

#### options.basePath
Type: `String`
Default value: `undefined`

This is the base path used in template files path that will be cut off when creating the destination path.

For example, suppose your template files are stored in `resources/templates/views/`, and when creating the files, you just want to consider the structure from the folder `views/` . So define the basePath as `'resources/templates'` and the destination structure will start in the `views` folder.

#### options.forceRefresh
Type: `Boolean`
Default value: `false`

If `false`, just files older than the template or the message files will be created (useful when developing and you have a lot of template files). If `true`, all destination files will be recreated (useful during build time).

#### options.skipKeyRunner
Type: `Boolean`
Default value: `false`

If `true`, skip the step of analyzing the keys.csv file. The keys.csv file contains the messages in the default language that you might want to review and change. When a change is detected, the messages in templates and csv files are updated.

It's a good practice during build time or when the messages in default language are reviewed, but may be a waste of time during development.

#### options.skipMessagesRunner
Type: `Boolean`
Default value: `false`

By default, every time you run the task, it checks the templates searching for new messages. If new messages are found, the the CSV files will be updated. If you are in development time, you may skip this step, making the generation of the destination files faster.

#### options.skipTemplateRunner
Type: `Boolean`
Default value: `false`

Skip the generation of the destination files from its template and CSV files.

#### options.transformDestFile
Type: `function`
Default value: `undefined`

Allows you to change the destination file name. By default, the destination file is the destination path + (template file path - the base path). The example below transforms a file name in the format `path\file.template.ext` to `path\file.ext`:

    transformDestFile: function(filepath) {
      return filepath.replace('.template.', '.');
    }

#### options.jsonPath
Type: `string`
Default value: `undefined`

If a folder is specified, a JSON files will be generated for each CSV file. The JSON file name will be the same used in the CSV file names, but with the JSON extension. If jsonPath is not informed, the JSON files won't be generated. These JSON files are useful when integrating with other tools or using the messages in the server side of a web app. The main structure of the JSON file is a root object containing the key messages as properties and the translated message as the string value of the property. Example of the file `messages_pt-BR.json`:

    {
        "Invalid e-mail and/or password": "e-mail e/ou senha incorretos",
        "Not implemented": "Não implementado"
    }


#### options.removeEmptyKeys
Type: `boolean`
Default value: `true`

If true (default value), empty keys that are found in the CSV files and not found in the templates, are removed from the CSV files.

#### options.htmlEscape
Type: `boolean`
Default value: `true`

If true (default value), all messages are HTML escaped when replaced.

### Usage Examples

####Development and production mode
I recommend that you create two options group: one for development and another for the build phase.

During development, I consider you're using `grunt-contrib-watch` and you're writing the templates in your natural language. So you want to have the output files generated as quick as possible. So, a good set of options are:
```js
grunt.initConfig({
  i18n_template: {
    dev: {
      options: {
        defaultLocale: 'en',
        skipKeyRunner: true,
        skipMessagesRunner: true,
        messagesPath: 'resources/messages',
        basePath: 'resources/templates'
      },
      files: {
        'app/client': ['resources/templates/**/*.html'],
      }
    },
    build: {
      options: {
        defaultLocale: 'en',
        locales: ['en', 'pt_BR', 'fr', 'ru'],
        messagesPath: 'resources/messages',
        basePath: 'resources/templates',
        forceRefresh: true
      },
      files: {
        'app/client': ['resources/templates/**/*.html'],
      },
    }
  },
});
```
The `i18n_template:dev` must run every time you change a template file (using `grunt-watch-contrib` task).

The `i18n_template:build` must run when you want to generate all files for each language your application supports.

## Advanced tips
### Messages not translated yet
Whenever we include a new message in a template file, it'll be necessary to translate it to all languages we support. In order to help you on that, the task will create a file called `empty_messages.log`, with the list of messages not yet translated to one of the supported languages.

When you update the CSV files with the translation, the empty_messages.log file will be updated or removed if no missing message is found. Below is an example of this file:

```js
LIST OF MESSAGE KEYS WITH NO TRANSATION
This file is automatically generated by grunt
Generated on Sun Sep 07 2014 20:11:24 GMT-0300 (BRT)

* FILE: test/messages/messages_pt_BR.csv

Ok
Save
User login
Please enter your user login and password
```

### It's good to write the templates in a natural language instead of using message keys, but what if they change?
Compared to other methods where you use a key in your template files (for example, use "form.cancel" to represent the word 'Cancel'), using a real language is easier.

But there are moments these messages are reviewed. If they change, you have to update the template and CSV files.

Ok, you can use "Search | Replace" commands in your IDE, but it may become unproductive when you have a lot of messages to replace.

That's when the file `keys.csv` get into action. This is a two-column CSV file generated by the task, containing all messages declared in the template files. The first column contains the messages and the second is empty. All you have to do is to review this file and update the 2nd column with the correct message. When grunt runs again, all keys will be updated in both template and CSV files.

For example. Suppose you want to change all occurrences of the message "Hello world" to "Hi world".

Go to the `keys.csv` file and search the sentence 'Hello world" there.
```js
"Hello world",""
```
and replace the 2nd column by the new message
```js
"Hello world","Hi world"
```
Next time you run the task, all occurrences of "Hello world" in the template and CSV files will be replaced by "Hi world". **The keys.csv file will be automatically updated as well.**

## TO DO LIST
I'm still working on these bullets, and advises are welcome:

 - Testing coverage not implemented yet; Consider the needs of
 - Integration with server side (Preferable during development and build time);

## Contributing
Just want to express my gratitude to the authors and contributors of the String.js library (http://stringjs.com/), that helped me a lot on synchronous CSV parsing and HTML escaping.

## Release History

####version 0.1.7
* [Feature] New option 'removeEmptyKeys' - Remove keys in CSV file that are empty and not found in the templates;

####version 0.1.6
* Fixing small bugs

####version 0.1.5
* [Feature] New option `jsonPath` - Generation of JSON message files from CSV files;
* [Feature] New option `skipTemplateRunner` - Don't run the step to generate the files from template;
* [Improvement] Erasing empty messages from CSV files if messages are not found in templates (Useful during development, when key messages change constantly);

####version 0.1.4
* [Bug] Error when template has no message;
* [Feature] New option `transforDestFile` - Function to change the destination file name and path;
