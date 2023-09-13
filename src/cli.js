import arg from 'arg';
import inquirer from 'inquirer';
import showHelp from './help.js';
import chalk from 'chalk';
import { generateFileName, jsonToSheet, sheetToCsv, validateApiKey, validateFileName, validateURL } from '../utils/index.js';
import { verifyApiKey } from './verify.js';
import ora from 'ora';
import { run } from './main.js';
import TreePrompt from './treePrompt.js';
import {
	automatedCollectionFields,
	customCollectionFields,
	customerFields,
	discountFields,
	getGroup,
	metaobjectEntriesFields,
	orderFields,
	productFields,
} from '../utils/fields.js';
import fs from 'fs';
import ini from 'ini';
// import appRootPath from 'app-root-path';
import versionCheck from './version-check.js';
import { analyzeFile, getHeaderColumn } from '../utils/import.js';
import { actionTree } from '../utils/actions.js';

import inquirerPrompt from 'inquirer-autocomplete-prompt';
import fuzzyPath from 'inquirer-fuzzy-path';
import { runImport, runImportCustomCollection, runImportSmartCollection } from './import.js';
import os from 'os';

const appRootPath = { path: os.homedir() };

inquirer.registerPrompt('tree', TreePrompt);
inquirer.registerPrompt('autocomplete', inquirerPrompt);
inquirer.registerPrompt('fuzzypath', fuzzyPath);

/**
 * Convert the raw arguments input to options object.
 *
 * @param {string} rawArgs raw args user inputed.
 * @return {object} option value (object).
 */
function parseArgumentsIntoOptions(rawArgs) {
	const args = arg(
		{
			'--help': Boolean,
			'-h': '--help',
			'--version': Boolean,
			'-v': '--version',

			'--type': String,
			'--url': String,
			'--format': String,
			'--fields': [String],
			'--group': [String],

			'--fileName': String,

			'-t': '--type',
			'-u': '--url',
			'-f': '--format',
			'-i': '--fields',
			'-g': '--group',

			'--apiKey': String,
			'--apiPass': String,

			'--idColumn': String,
			'--actionColumn': String,
			'--action': String,
		},
		{
			argv: rawArgs.slice(2),
		},
	);
	return {
		help: args['--help'] || false,
		version: args['--version'] || false,

		method: args._[0],
		type: args['--type'] || args._[1] || '',
		url: args['--url'] || args._[2] || '',
		format: args['--format'] || args._[3] || '',
		fields: args['--fields'] || [],
		group: args['--group'] || [],
		apiKey: args['--apiKey'] || '',
		apiPass: args['--apiPass'] || '',

		fileName: args['--fileName'] || args._[4] || '',

		idColumn: args['--idColumn'] || '',
		action: args['--action'] || '',
		actionColumn: args['--actionColumn'] || '',
	};
}

/**
 * Initialize the method to one of ["init", "export", "import"]
 *
 * @param {object} options options object.
 * @return {object} options object that has method.
 */
export async function initMethod(options) {
	const defaultTemplate = 'export';
	if (options.method && !['export', 'import', 'init'].includes(options.method)) {
		throw 'error';
	}
	const questions = [];
	if (!options.method) {
		questions.push({
			type: 'list',
			name: 'method',
			message: 'Please choose what you will do',
			choices: ['init', 'export', 'import'],
			default: defaultTemplate,
		});
	}
	const answers = await inquirer.prompt(questions);
	return {
		...options,
		method: options.method || answers.method,
	};
}

/**
 * Fulfill the missing options.
 *
 * @param {object} options options object.
 * @return {object} options object that has all options (type, url, format, fields).
 */
export async function promptForMissingOptions(options) {
	const defaultType = 'products';

	const questions = [
		{
			type: 'list',
			name: 'type',
			message: `Please choose what you try to ${options.method}`,
			choices: [
				{ name: 'Products', value: 'products' },
				{ name: 'Orders', value: 'orders' },
				{ name: 'Customers', value: 'customers' },
				{ name: 'Manual Collection', value: 'custom_collections' },
				{ name: 'Automated Collection', value: 'smart_collections' },
				{ name: 'Metaobject Definitions', value: 'metaobject_definitions' },
				{ name: 'Metaobject Entries', value: 'metaobject_entries' },
				{ name: 'Discounts', value: 'price_rules' },
			],
			default: defaultType,
			when: () => !options.type,
		},
		{
			type: 'list',
			name: 'url',
			message: () => {
				let config = {};
				if (fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
					config = ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));
				}

				return Object.keys(config).filter(key => key !== 'core').length
					? 'Please choose store'
					: "We couldn't find any initialized store, please initialize the store first";
			},
			choices: () => {
				let config = {};
				if (fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
					config = ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));
				}
				return Object.keys(config).filter(key => key !== 'core');
			},
			when: () => !options.url,
		},
		{
			type: 'list',
			name: 'format',
			message: `Please choose which format file you will ${options.method}.`,
			choices: ['CSV', 'Excel', 'Matrixify'],
			default: 'CSV',
			when: () => !options.format,
		},
		{
			type: 'input',
			name: 'fileName',
			message: `Please input file name.`,
			default: answers => {
				return generateFileName(answers.type || options.type);
			},
			when: () => !options.fileName,
		},
		{
			type: 'tree',
			name: 'fields',
			message: `Please choose fields you'd ${options.method}`,
			pageSize: 20,
			tree: answers => {
				if (answers.type === 'products' || options.type === 'products')
					return productFields;
				if (answers.type === 'orders' || options.type === 'orders') return orderFields;
				if (answers.type === 'customers' || options.type === 'customers')
					return customerFields;
				if (answers.type === 'custom_collections' || options.type === 'custom_collections')
					return customCollectionFields;
				if (answers.type === 'smart_collections' || options.type === 'smart_collections')
					return automatedCollectionFields;
				if (answers.type === 'metaobject_entries' || options.type === 'metaobject_entries')
					return metaobjectEntriesFields;
				if (answers.type === 'price_rules' || options.type === 'price_rules')
					return discountFields;
			},
			multiple: true,
			when: (answers) => !options.fields?.length && !options.group?.length && (!answers.type?.includes('metaobject_definitions') && !options.type?.includes('metaobject_definitions')),
		},
	];

	const answers = await inquirer.prompt(questions);
	return {
		...options,
		type: options.type || answers.type,
		url: options.url || answers.url,
		format: options.format || answers.format,
		fileName: options.fileName || answers.fileName,
		fields: options.fields.length ? options.fields : answers.fields,
	};
}

/**
 * Fulfill the url option when init the store.
 *
 * @param {object} options options object.
 * @return {object} options object that has url option.
 */
async function initStore(options) {
	const questions = [];
	if (!options.url) {
		questions.push({
			type: 'input',
			name: 'url',
			message: 'Please enter the myshopify.com domain for your store',
			validate: validateURL,
		});
	}
	const answers = await inquirer.prompt(questions);
	return {
		...options,
		url: options.url || answers.url,
	};
}

/**
 * Fulfill the apiKey and apiPass options when init the store.
 *
 * @param {object} options options object.
 * @return {object} options object that has apiKey and apiPass options.
 */
async function initApi(options) {
	const questions = [];
	if (!options.apiKey) {
		questions.push({
			type: 'input',
			name: 'apiKey',
			message: 'API Key:',
			validate: validateApiKey,
		});
	}
	questions.push({
		type: 'password',
		name: 'apiPass',
		message: 'Password:',
	});
	const answers = await inquirer.prompt(questions);
	return {
		...options,
		apiKey: options.apiKey || answers.apiKey,
		apiPass: answers.apiPass,
	};
}

async function importFile(options) {
	const questions = [
		{
			type: 'fuzzypath',
			name: 'fileName',
			message: 'Please enter file path/name: ',
			validate: validateFileName,
			when: () => !options.fileName,

			excludePath: nodePath =>
				nodePath.startsWith('node_modules') ||
				nodePath.includes('git'),
			// excludePath :: (String) -> Bool
			// excludePath to exclude some paths from the file-system scan
			excludeFilter: nodePath => nodePath == '.',
			// excludeFilter :: (String) -> Bool
			// excludeFilter to exclude some paths from the final list, e.g. '.'
			itemType: 'file',
			// itemType :: 'any' | 'directory' | 'file'
			// specify the type of nodes to display
			// default value: 'any'
			// example: itemType: 'file' - hides directories from the item list
			rootPath: './',
			// rootPath :: String
			// Root search directory
			suggestOnly: true,
			// suggestOnly :: Bool
			// Restrict prompt answer to available choices or use them as suggestions
			depthLimit: 2,
		},
	];
	const answers = await inquirer.prompt(questions);
	return {
		...options,
		fileName: options.fileName || answers.fileName,
	};
}

async function importOptions(options, fileData) {
	const defaultType = 'customers';

	const questions = [
		{
			type: 'list',
			name: 'type',
			message: `Please choose which field you try to import/update: `,
			choices: [
				{ name: 'Products', value: 'products' },
				{ name: 'Orders', value: 'orders' },
				{ name: 'Customers', value: 'customers' },
				{ name: 'Manual Collection', value: 'custom_collections' },
				{ name: 'Automated Collection', value: 'smart_collections' },
			],
			default: defaultType,
			when: () => !options.type,
		},
		{
			type: 'list',
			name: 'url',
			message: () => {
				let config = {};
				if (fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
					config = ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));
				}

				return Object.keys(config).filter(key => key !== 'core').length
					? 'Please choose store'
					: "We couldn't find any initialized store, please initialize the store first";
			},
			choices: () => {
				let config = {};
				if (fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
					config = ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));
				}
				return Object.keys(config).filter(key => key !== 'core');
			},
			when: () => !options.url,
		},
		{
			type: 'list',
			name: 'format',
			message: `Please choose which format file you will ${options.method}.`,
			choices: ['CSV', 'Excel', 'Matrixify'],
			default: 'CSV',
			when: () => !options.format,
		},
		{
			type: 'list',
			name: 'idColumn',
			message: 'Which column do you want to use as Identify column?',
			choices: () => {
				return Object.keys(fileData[0]);
			},
			when: (answers) => !options.idColumn && (options.format !== 'Matrixify' && answers.format !== 'Matrixify'),
		},
		{
			type: 'list',
			name: 'action',
			message: `Please choose action you'd like to do: `,
			choices: answers => {
				return actionTree(answers.type || options.type);
			},
			when: (answers) => !options.action && (options.format !== 'Matrixify' && answers.format !== 'Matrixify'),
		},
		{
			type: 'list',
			name: 'actionColumn',
			message: 'Which column do you want to use as action column?',
			choices: () => {
				return Object.keys(fileData[0]);
			},
			when: (answers) => !options.actionColumn && (options.format !== 'Matrixify' && answers.format !== 'Matrixify'),
		},
	];

	const answers = await inquirer.prompt(questions);
	return {
		...options,
		type: options.type || answers.type,
		url: options.url || answers.url,
		format: options.format || answers.format,
		idColumn: options.idColumn || answers.idColumn,
		actionColumn: options.actionColumn || answers.actionColumn,
		action: options.action || answers.action,
	};
}

/**
 * Main function run by ablestar-cli command.
 *
 * @param {string} args raw args user inputed.
 */
async function cli(args) {
	versionCheck();
	try {
		let options = parseArgumentsIntoOptions(args);
		if (options.version) {
			return;
		}
		if (options.help) {
			showHelp();
			return;
		}
		options = await initMethod(options);
		if (options.method === 'init') {
			options = await initStore(options);
			console.log();
			console.log(
				`Go to https://${options.url}/admin/settings/apps/development and create a new private app`,
			);
			console.log();
			options = await initApi(options);
			const spinner = ora('Testing credentials').start();
			await verifyApiKey(options);
			spinner.stop();
			console.log();
		} else if (options.method === 'export') {
			options = await promptForMissingOptions(options);
			options.fields = options.fields || [];
			await run(options);

			console.log(chalk.bgCyan.black(' == Alternative Command == '));
			console.log(
				chalk.cyan(
					`ablestar-cli ${options.method} ${options.type} ${options.url} --format=${options.format
					} --fileName=${options.fileName}${getGroup(options.type, options.fields)}`,
				),
			);
		} else if (options.method === 'import') {
			options = await importFile(options);
			const fileData = await analyzeFile(options.fileName);
			options = await importOptions(options, fileData);

			if (options.format === 'Matrixify') {
				let outputData = {};
				if (options.type === 'custom_collections') outputData = await runImportCustomCollection(options, fileData);
				if (options.type === 'smart_collections') outputData = await runImportSmartCollection(options, fileData);

				const outputJson = fileData.map((item, itemIndex) => {
					const { itemKey, ...rest } = Object.values(outputData).find(i => i.itemKey === item.ID || i.itemKey === item.Handle || i.itemKey === itemIndex);
					
					return { ...item, ...rest }
				})

				const outputHeader = [await getHeaderColumn(options.fileName), ['ID (ref)', 'Handle (ref)', 'Import Result', 'Import Comment']].flat();

				let worksheet;
				const outputSheet = jsonToSheet(outputJson, 0, worksheet, 'output', outputHeader, outputHeader);
				sheetToCsv(outputSheet, `${options.fileName}_Results.csv`);

				console.log("Result Saved to ", chalk.greenBright(`${options.fileName}_Results.csv \n`));
			}

			else await runImport(options, fileData);

			console.log(chalk.bgCyan.black(' == Alternative Command == '));
			console.log(
				chalk.cyan(
					`ablestar-cli ${options.method} ${options.type} ${options.url} --fileName=${options.fileName} --format=${options.format} ${options.type === 'customers' ? `--idColumn=${options.idColumn} --action=${options.action} --actionColumn=${options.actionColumn}` : ``}`,
				),
			);
		}
	} catch (error) {
		console.log(error);
		console.log(chalk.bgRed.black(' Error '), 'Incorrect use of command, please check help');

		// showHelp();
	}

	return 'run successfully';
}

export default cli;
