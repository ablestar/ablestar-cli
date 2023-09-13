import { createRequire } from 'module';
export const require = createRequire(import.meta.url);
import fs from 'fs';
import ini from 'ini';
import chalk from 'chalk';
// import appRootPath from 'app-root-path';
import XLSX from 'xlsx';
import { capitalize, fieldNames } from './fields.js';
import { matrixifyStyles, summaryHeader } from './style.js';
import Excel from 'exceljs';
import os from 'os';

const appRootPath = { path: os.homedir() };

/**
 * Validate the store URL format(***.myshopify.com)
 *
 * @param {string} input string user inputed.
 * @return {boolean || string} validation result
 */
export function validateURL(input) {
	if (!input) {
		return 'Please input store URL';
	}
	const splites = input.split('.');
	if (splites[0].length && splites[1] === 'myshopify' && splites[2] === 'com') return true;
	return 'Please input correct URL';
}

export function validateApiKey(input) {
	// TODO: apikey validation
	return !!input;
}

export function validateFileName(input) {
	// TODO: file path/name validation
	return !!input;
}

/**
 * Create or Update the config.ini file for new store.
 *
 * @param {object} options options for new store.
 */
export function writeIni(options) {
	let config = {};
	if (fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
		config = ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));
	} else {
		if (!fs.existsSync(appRootPath.path + '/.ablestar')) {
			fs.mkdirSync(appRootPath.path + '/.ablestar');
		}
		config.core = config.core || {};
		config.core.default_format = 'CSV';
	}

	config[options.url] = config[options.url] || {};
	config[options.url].shopify_domain = options.url;
	config[options.url].api_key = options.apiKey;
	config[options.url].api_password = options.apiPass;

	fs.writeFileSync(appRootPath.path + '/.ablestar/cli.ini', ini.stringify(config));
}

/**
 * Get api password from store url (saved in config.ini)
 *
 * @param {string} url store url.
 * @return {string} api password.
 */
export async function getToken(url) {
	let config = {};
	if (await fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
		config = await ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));
	} else {
		console.log();
		console.log('Please init the store by %s', chalk.cyan('ablestar-cli init'));
		throw 'Error';
	}

	if (config[url]?.api_password) {
		return config[url]?.api_password;
	} else {
		console.log();
		console.log('Please init the store by %s', chalk.cyan('ablestar-cli init'));
		throw 'Error';
	}
}

/**
 * Get api key and password from store url (saved in config.ini)
 *
 * @param {string} url store url.
 * @return {object} api key and password.
 */
export async function getKeyToken(url) {
	let config = {};
	if (await fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
		config = await ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));
	} else {
		console.log();
		console.log('Please init the store by %s', chalk.cyan('ablestar-cli init'));
		throw 'Error';
	}

	if (config[url]?.api_password && config[url]?.api_key) {
		return { apikey: config[url]?.api_key, token: config[url]?.api_password };
	} else {
		console.log();
		console.log('Please init the store by %s', chalk.cyan('ablestar-cli init'));
		throw 'Error';
	}
}

/**
 * Get keys and header arrays from user input to make the sheet header.
 *
 * @param {object} json item object.
 * @param {string} type export type (products, ordes, ...)
 * @param {array} fields fields user inputed to export.
 * @return {object} keys and headers
 */
export function getHeader(json, type, fields) {
	let keys = [],
		header = [];

	if (type.includes('metaobject_definitions')) {
		return {keys: Object.keys(json[0]), header: Object.keys(json[0])}
	}
	
	for (const key in fieldNames[type]) {
		for (const field in fieldNames[type][key]) {
			if (fields.includes(`${field}-${key}`) || (key === 'basic' && fields.includes(field))) {
				if (!field.includes('___')) {
					keys.push(`${key === 'basic' ? '' : `${key}__`}${field}`);
					header.push(`${fieldNames[type][key][field]}`);
				} else {
					const funcName = field.split('___')[0];
					if (
						!funcName.startsWith('n_') &&
						!funcName.startsWith('o_') &&
						!funcName.startsWith('h_')
					) {
						keys.push(`${field}`);
						header.push(`${fieldNames[type][key][field]}`);
					} else if (funcName.startsWith('n_')) {
						let maxLength = Math.max(
							...json.map(
								el =>
									el[
										`${key === 'basic' ? '' : `${key}__`}${
											field.split('___')[1]
										}`
									]?.length || 0,
							),
						);
						const arr = fields.filter(
							i => i.split('___')[0].split('__')[0] === funcName.split('__')[0],
						);

						for (let i = 0; i < maxLength; i++) {
							arr.map(item => {
								const keyName = item.split('___')[0].slice(2);

								if (keys.indexOf(`${keyName}__${i}`) === -1)
									keys.push(`${keyName}__${i}`);
								if (
									header.indexOf(
										`${fieldNames[type][key][item.split('-')[0]]}`.replace(
											'{n}',
											i + 1,
										),
									) === -1
								)
									header.push(
										`${fieldNames[type][key][item.split('-')[0]]}`.replace(
											'{n}',
											i + 1,
										),
									);
							});
						}
					} else if (funcName.startsWith('o_')) {
						json.map(el =>
							el[`${key === 'basic' ? '' : `${key}__`}${field.split('___')[1]}`].map(
								item => {
									if (!keys.includes(item.name)) {
										keys.push(item.name);
										header.push(item.name);
									}
								},
							),
						);
					} else if (funcName.startsWith('h_')) {
						const prefix = funcName === 'h_product' ? '' : 'variants__';

						json.map(el =>
							el[`${prefix}${field.split('___')[1]}`]?.map(item => {
								if (!keys.includes(`${prefix}${field.split('___')[0]}__${item.key}`)) {
									keys.push(`${prefix}${field.split('___')[0]}__${item.key}`);
									header.push(
										`${fieldNames[type]['metafields'][field]}: ${item.key} [${item.type}]`,
									);
								}
							}),
						);
					}
				}
			}
		}
	}

	if (type === "price_rules") {
		keys = ArrayMove(keys, keys.findIndex(i => i === 'discount_codes__code'), header.findIndex(i => i === 'Command') + 1);
		header = ArrayMove(header, header.findIndex(i => i === 'Code'), header.findIndex(i => i === 'Command') + 1);

		keys = ArrayMove(keys, keys.findIndex(i => i === 'discount_codes__usage_count'), header.findIndex(i => i === 'Command') + 2);
		header = ArrayMove(header, header.findIndex(i => i === 'Used Count'), header.findIndex(i => i === 'Command') + 2);
	}

	return { keys, header };
}

/**
 * Create or Update worksheet from JSON object.
 *
 * @param {object} json item object.
 * @param {number} since_id since_id of shopify api. If since_id is 0, then create new worksheet.
 * @param {XLSX.WorkSheet} worksheet worksheet to update.
 * @param {string} type export type (products, ordes, ...)
 * @param {array} keys keys for sheet.
 * @param {array} header header array for sheet.
 * @return {XLSX.WorkSheet}
 */
export function jsonToSheet(json, since_id, worksheet, type, keys, header) {
	if (since_id === 0) {
		const ws = XLSX.utils.json_to_sheet(json, {
			header: keys,
		});

		XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });

		return ws;
	} else {
		let ws = worksheet;
		XLSX.utils.sheet_add_json(ws, json, { skipHeader: true, origin: -1 });
		return ws;
	}
}

/**
 * Write excel file from sheet.
 *
 * @param {XLSX.WorkSheet} sheet worksheet.
 * @param {string} sheetName worksheet name on excel file.
 * @param {string} fileName excel file name.
 */
export async function writeExcel(sheet, sheetName = 'Products', fileName = 'file.xlsx') {
	if (fs.existsSync(fileName)) {
		const workbook = XLSX.readFile(fileName);
		XLSX.utils.book_append_sheet(workbook, sheet, sheetName, true);
		const newName = workbook.SheetNames[workbook.SheetNames.length - 1];
		workbook.SheetNames = workbook.SheetNames.sort(function (x, y) {
			return x == newName ? -1 : y == newName ? 1 : 0;
		});
		XLSX.writeFile(workbook, fileName);
	} else {
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
		XLSX.writeFile(workbook, fileName);
	}

	// compress the file
	const workbook = new Excel.Workbook();
	await workbook.xlsx.readFile(fileName);
	await workbook.xlsx.writeFile(fileName);
}

/**
 * Write matrixify excel file from sheet.
 *
 * @param {XLSX.WorkSheet} sheet worksheet.
 * @param {string} sheetName worksheet name on excel file.
 * @param {string} fileName excel file name.
 * @param {array} header header array.
 * @param {object} summaryData summary data for summary sheet.
 */
export async function writeMatrixify(
	sheet,
	sheetName = 'Products',
	fileName = 'matrixify.xlsx',
	header,
	summaryData,
) {
	const workbook1 = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook1, sheet, sheetName);
	XLSX.writeFile(workbook1, fileName);

	const workbook = new Excel.Workbook();
	await workbook.xlsx.readFile(fileName);

	const worksheet = workbook.getWorksheet(sheetName);
	const xSpliteValue = header.findIndex(i => i === 'ID') < 0 ? 1 : 2;
	worksheet.views = [
		{ state: 'frozen', xSplit: xSpliteValue, ySplit: 1, topLeftCell: 'C2', activeCell: 'A1' },
	];
	worksheet.properties.defaultRowHeight = 16;

	header.map((item, index) => {
		worksheet.getColumn(index + 1).width = matrixifyStyles[sheetName]?.[item]?.width || 20;
		if (item.includes('Metafield')) worksheet.getColumn(index + 1).width = 40;
		worksheet.getColumn(index + 1).font = { name: 'Arial', size: 11, bold: false };
		worksheet.getColumn(index + 1).numFmt =
			matrixifyStyles[sheetName]?.[item]?.numFmt || undefined;
	});

	worksheet.getRow(1).eachCell(function (cell) {
		cell.font = { name: 'Arial', size: 11, bold: true };
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: matrixifyStyles[sheetName]?.[cell.value]?.fill || 'eeeeee' },
		};
		if (cell.value.includes('Metafield'))
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'b4c6e7' },
			};
	});

	const summarySheet = workbook.addWorksheet('Export Summary', {
		views: [{ state: 'frozen', xSplit: undefined, ySplit: 1 }],
	});
	summarySheet.columns = summaryHeader;
	summarySheet.getRow(1).eachCell(function (cell) {
		cell.style = summaryHeader.find(i => i.header === cell.value).style_1;
	});
	summarySheet.addRow(summaryData);

	await workbook.xlsx.writeFile(fileName);
}

/**
 * Convert worksheet to csv file.
 *
 * @param {XLSX.WorkSheet} sheet worksheet.
 */
export function sheetToCsv(sheet, fileName) {
	const output_file_name = fileName;
	const stream = XLSX.stream.to_csv(sheet, { rawNumbers: true });
	stream.pipe(fs.createWriteStream(output_file_name));
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function orderMultiFields() {
	return ['line_items', 'refunds', 'transactions', 'risks', 'fulfillments'];
}

export function generateFileName(type) {
	const date = new Date();

	return `${capitalize(type)}_${date.getFullYear()}-${minTwoDigits(
		date.getMonth() + 1,
	)}-${minTwoDigits(date.getDate())}_${minTwoDigits(date.getHours())}-${minTwoDigits(
		date.getMinutes(),
	)}-${minTwoDigits(date.getSeconds())}`;
}

export function minTwoDigits(n) {
	return (n < 10 ? '0' : '') + n;
}

export function numFromID (str) {
	const match = str.match(/\d+$/);
	return match ? match[0] : null;
}

function ArrayMove(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
};
