import fs from 'fs';
import XLSX from 'xlsx';
import cliProgress from 'cli-progress';
import {
	shopifyItemRESTApi,
	shopifyRESTApi,
	shopifyRESTApiSubItem,
	shopifyRESTApiSubList,
} from './shopify.js';
import { Readable } from 'stream';
import * as cpexcel from 'xlsx/dist/cpexcel.full.mjs';
XLSX.set_fs(fs);
XLSX.stream.set_readable(Readable);
XLSX.set_cptable(cpexcel);

export async function analyzeFile(fileName) {
	let fileContent;
	if (await fs.existsSync(fileName)) {
		const workbook = XLSX.readFile(fileName);
		const sheet_name_list = workbook.SheetNames;
		const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

		return xlData;
	} else {
		console.log();
		console.log('Please correct file path/name');
		throw 'Error';
	}
}

export async function getHeaderColumn(fileName) {
	if (await fs.existsSync(fileName)) {
		const workbook = XLSX.readFile(fileName);
		const sheet_name_list = workbook.SheetNames;
		const columnsArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
			header: 1,
		})[0];

		return columnsArray;
	} else {
		console.log();
		console.log('Please correct file path/name');
		throw 'Error';
	}
}

export const itemIDForMatrixify = (item, result) => {
	return item.ID && result.map(i => i.id).includes(item.ID)
		? item.ID
		: result.find(i => i.handle === item.Handle)?.id;
};

export const handleOrIDCheck = (item, result) => {
	return (
		(item.ID && result.map(i => i.id).includes(item.ID)) ||
		(item.Handle && result.map(i => i.handle).includes(item.Handle))
	);
};

export const customCollectionQuery = (item, result, showId = false) => {
	return {
		custom_collection: {
			...(showId
				? {
						id: itemIDForMatrixify(item, result),
				  }
				: {}),
			handle: item.Handle,
			title: item.Title,
			body_html: item['Body HTML'],
			sort_order: item['Sort Order']?.toLowerCase(),
			published: item.Published,
			published_scope: item['Published Scope'],
			template_suffix: item['Template Suffix'],
			image: {
				src: item['Image Src'],
				alt: item['Image Alt Text'],
			},
		},
	};
};

export const pagesQuery = (item, result, showId = false) => {
	return {
		page: {
			...(showId
				? {
						id: itemIDForMatrixify(item, result),
				  }
				: {}),
			handle: item.Handle,
			title: item.Title,
			body_html: item['Body HTML'],
			published: item.Published,
			template_suffix: item['Template Suffix'],
		},
	};
};

export const articlesQuery = (item, result, showId = false) => {
	return {
		article: {
			...(showId
				? {
						id: itemIDForMatrixify(item, result),
				  }
				: {}),
			blog_id: item['Blog: ID'],
			handle: item.Handle,
			title: item.Title,
			body_html: item['Body HTML'],
			summary_html: item['Summary HTML'],
			published: item.Published,
			published_at: item['Published At'],
			template_suffix: item['Template Suffix'],
			image: {
				src: item['Image Src'],
				alt: item['Image Alt Text'],
			},
			tags: item.Tags,
		},
	};
};

export const groupSmartCollection = inputJson => {
	if (!inputJson || !inputJson.length) return [];

	const firstKey = Object.keys(inputJson[0])[0];

	const output = [];
	const items = {};

	for (const row of inputJson) {
		const itemObj = items[row[firstKey]] || {
			ID: row['ID'],
			Handle: row['Handle'],
			Command: row.Command,
			title: row['Title'],
			body_html: row['Body HTML'],
			sort_order: row['Sort Order']?.toLowerCase()?.replace(' ', '-'),
			template_suffix: row['Template Suffix'],
			disjunctive: row['Must Match'] === 'any condition',
			published: row['Published'],
			published_scope: row['Published Scope'],
			image: {
				alt: row['Image Alt Text'],
				src: row['Image Src'],
			},
			rules: [],
		};
		itemObj.rules.push({
			column: row['Rule: Product Column']?.toLowerCase()?.replace(' ', '_'),
			relation: row['Rule: Relation']?.toLowerCase()?.replace(' ', '_'),
			condition: row['Rule: Condition'],
		});
		if (!items[row[firstKey]]) {
			items[row[firstKey]] = itemObj;
			output.push(itemObj);
		}
	}

	return output;
};

export const smartCollectionQuery = (item, result, showId = false) => {
	const { ID, Handle, Command, ...newItem } = item;
	return {
		smart_collection: showId
			? {
					...newItem,
					id: itemIDForMatrixify(item, result),
					handle: Handle,
			  }
			: {
					...newItem,
					handle: Handle,
			  },
	};
};

export const runMatrixify = async (
	options,
	fileData,
	queryBuilder = customCollectionQuery,
	isSubType = false,
) => {
	const bar1 = new cliProgress.SingleBar(
		{
			format: `[{bar}] {percentage}% | DUR: {duration}s | ETA: {eta}s | {value}/{total}`,
		},
		cliProgress.Presets.shades_classic,
	);
	try {
		console.log();
		bar1.start(fileData.length, 0);

		let since_id = 0;
		const limit = 250;
		let result = [];

		let failed = 0,
			skip = 0,
			success = 0;

		// result output array
		let output = {};

		while (true) {
			const query = {
				params: {
					fields: ['id', 'handle'].join(','),
					since_id,
					limit,
				},
			};

			const data = await shopifyRESTApi(options.url, options.type, 'get', query);

			if (data[options.type].length === 0) break;

			result = [...result, ...data[options.type]];

			if (data[options.type].length !== limit) break;
			since_id = data[options.type][data[options.type].length - 1].id;
		}

		for (const [itemIndex, item] of fileData.entries()) {
			// values for isSubType = true;
			let mainId = null;
			let subId = null;
			let mainType = null;
			let subType = null;

			if (isSubType) {
				if (options.type === 'articles') {
					mainId = item['Blog: ID'];
					subId = itemIDForMatrixify(item, result);
					mainType = 'blogs';
					subType = 'articles';
				}
			}

			// key for result output
			const itemKey = item.ID || item.Handle || itemIndex;
			output[itemKey] = {
				itemKey,
				'ID (ref)': itemIDForMatrixify(item, result),
				'Handle (ref)': item.Handle,
				'Import Result': 'OK',
				'Import Comment': '',
			};

			switch (item.Command) {
				case 'NEW':
					output[itemKey]['Import Comment'] = 'New';

					if (handleOrIDCheck(item, result)) {
						output[itemKey]['Import Result'] = 'Failed';
						output[itemKey]['Import Comment'] = 'ID or Handle is already exist.';
						failed += 1;
						break;
					}

					const query = queryBuilder(item, result);

					try {
						if (isSubType)
							await shopifyRESTApiSubList(
								options.url,
								mainType,
								mainId,
								subType,
								'post',
								query,
							);
						else await shopifyRESTApi(options.url, options.type, 'post', query);
						output[itemKey]['Import Result'] = 'OK';
						success += 1;
					} catch (error) {
						output[itemKey]['Import Result'] = 'Failed';
						output[itemKey]['Import Comment'] = 'Error when tring to create new item.';
						failed += 1;
					}

					break;

				case 'MERGE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] =
								'Should had ID or Handle to update item.';
							failed += 1;
							break;
						}
						const query1 = queryBuilder(item, result, true);
						try {
							if (isSubType)
								await shopifyRESTApiSubItem(
									options.url,
									mainType,
									mainId,
									subType,
									subId,
									'put',
									query1,
								);
							else
								await shopifyItemRESTApi(
									options.url,
									options.type,
									itemIDForMatrixify(item, result),
									'put',
									query1,
								);
							output[itemKey]['Import Result'] = 'OK';
							success += 1;
						} catch (error) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] = 'Error when tring to update item.';
							failed += 1;
						}
						break;
					}

					const query1 = queryBuilder(item, result);
					try {
						if (isSubType)
							await shopifyRESTApiSubList(
								options.url,
								mainType,
								mainId,
								subType,
								'post',
								query1,
							);
						else await shopifyRESTApi(options.url, options.type, 'post', query1);
						output[itemKey]['Import Result'] = 'OK';
						success += 1;
					} catch (error) {
						output[itemKey]['Import Result'] = 'Failed';
						output[itemKey]['Import Comment'] = 'Error when tring to create new item.';
						failed += 1;
					}

					break;

				case 'UPDATE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] =
								'Should had ID or Handle to update item.';
							failed += 1;
							break;
						}
						const query1 = queryBuilder(item, result, true);
						try {
							if (isSubType)
								await shopifyRESTApiSubItem(
									options.url,
									mainType,
									mainId,
									subType,
									subId,
									'put',
									query1,
								);
							else
								await shopifyItemRESTApi(
									options.url,
									options.type,
									itemIDForMatrixify(item, result),
									'put',
									query1,
								);
							output[itemKey]['Import Result'] = 'OK';
							success += 1;
						} catch (error) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] = 'Error when tring to update item.';
							failed += 1;
						}
						break;
					}
					output[itemKey]['Import Result'] = 'Failed';
					output[itemKey]['Import Comment'] = 'Cannot find the ID or Handle matched.';
					failed += 1;
					break;

				case 'REPLACE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] =
								'Should had ID or Handle to update item.';
							failed += 1;
							break;
						}
						try {
							if (isSubType)
								await shopifyRESTApiSubItem(
									options.url,
									mainType,
									mainId,
									subType,
									subId,
									'delete',
								);
							else
								await shopifyItemRESTApi(
									options.url,
									options.type,
									itemIDForMatrixify(item, result),
									'delete',
								);
						} catch (error) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] = 'Error when tring to delete item.';
							failed += 1;
							break;
						}
					}

					const query2 = queryBuilder(item, result);
					try {
						if (isSubType)
							await shopifyRESTApiSubList(
								options.url,
								mainType,
								mainId,
								subType,
								'post',
								query2,
							);
						else await shopifyRESTApi(options.url, options.type, 'post', query2);
						output[itemKey]['Import Result'] = 'OK';
						success += 1;
					} catch (error) {
						output[itemKey]['Import Result'] = 'Failed';
						output[itemKey]['Import Comment'] = 'Error when tring to update item.';
						failed += 1;
					}

					break;

				case 'DELETE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] =
								'Should had ID or Handle to update item.';
							failed += 1;
							break;
						}
						try {
							if (isSubType)
								await shopifyRESTApiSubItem(
									options.url,
									mainType,
									mainId,
									subType,
									subId,
									'delete',
								);
							else
								await shopifyItemRESTApi(
									options.url,
									options.type,
									itemIDForMatrixify(item, result),
									'delete',
								);
							output[itemKey]['Import Result'] = 'OK';
							success += 1;
							break;
						} catch (error) {
							output[itemKey]['Import Result'] = 'Failed';
							output[itemKey]['Import Comment'] = 'Error when tring to delete item.';
							failed += 1;
							break;
						}
					}
					output[itemKey]['Import Result'] = 'Failed';
					output[itemKey]['Import Comment'] = 'Cannot find the ID or Handle matched.';
					failed += 1;
					break;

				case 'IGNORE':
					skip += 1;
					output[itemKey]['Import Result'] = 'Ignored';
					output[itemKey]['Import Comment'] = '';
					break;

				default:
					output[itemKey]['Import Result'] = 'Failed';
					output[itemKey]['Import Comment'] = 'No matched commands find.';
					failed += 1;
					break;
			}
			bar1.increment(1);
		}

		bar1.stop();
		console.log();
		console.log(`${success} items success, ${skip} items skip, and ${failed} items failed`);
		console.log();
		console.log();
		return output;
	} catch (error) {
		bar1.stop();
		throw error;
	}
};
