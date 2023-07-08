import fs from 'fs';
import XLSX from 'xlsx';
import cliProgress from 'cli-progress';
import { shopifyItemRESTApi, shopifyRESTApi } from './shopify.js';

export async function analyzeFile(fileName) {
	let fileContent;
	if (await fs.existsSync(fileName)) {
		var workbook = XLSX.readFile(fileName);
		var sheet_name_list = workbook.SheetNames;
		var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

		return xlData;
	} else {
		console.log();
		console.log('Please correct file path/name');
		throw 'Error';
	}
}

export const itemIDForMatrixify = (item, result) => {
	return item.ID && result.map(i => i.id).includes(item.ID)
		? item.ID
		: result.find(i => i.handle === item.Handle).id;
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

export const runMatrixify = async (options, fileData, queryBuilder = customCollectionQuery) => {
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

		while (true) {
			const query = {
				params: {
					fields: ['id', 'handle'],
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

		for (const item of fileData) {
			switch (item.Command) {
				case 'NEW':
					if (handleOrIDCheck(item, result)) {
						failed += 1;
						break;
					}

					const query = queryBuilder(item, result);

					try {
						await shopifyRESTApi(options.url, options.type, 'post', query);
						success += 1;
					} catch (error) {
						failed += 1;
					}

					break;

				case 'MERGE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							failed += 1;
							break;
						}
						const query1 = queryBuilder(item, result, true);
						try {
							await shopifyItemRESTApi(
								options.url,
								options.type,
								itemIDForMatrixify(item, result),
								'put',
								query1,
							);
							success += 1;
						} catch (error) {
							failed += 1;
						}
						break;
					}

					const query1 = queryBuilder(item, result);
					try {
						await shopifyRESTApi(options.url, options.type, 'post', query1);
						success += 1;
					} catch (error) {
						failed += 1;
					}

					break;

				case 'UPDATE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							failed += 1;
							break;
						}
						const query1 = queryBuilder(item, result, true);
						try {
							await shopifyItemRESTApi(
								options.url,
								options.type,
								itemIDForMatrixify(item, result),
								'put',
								query1,
							);
							success += 1;
						} catch (error) {
							failed += 1;
						}
						break;
					}

					failed += 1;
					break;

				case 'REPLACE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							failed += 1;
							break;
						}
						try {
							await shopifyItemRESTApi(
								options.url,
								options.type,
								itemIDForMatrixify(item, result),
								'delete',
							);
						} catch (error) {
							failed += 1;
							break;
						}
					}

					const query2 = queryBuilder(item, result);
					try {
						await shopifyRESTApi(options.url, options.type, 'post', query2);
						success += 1;
					} catch (error) {
						failed += 1;
					}

					break;

				case 'DELETE':
					if (handleOrIDCheck(item, result)) {
						if (!item.ID && !item.Handle) {
							failed += 1;
							break;
						}
						try {
							await shopifyItemRESTApi(
								options.url,
								options.type,
								itemIDForMatrixify(item, result),
								'delete',
							);
							success += 1;
							break;
						} catch (error) {
							failed += 1;
							break;
						}
					}

					failed += 1;
					break;

				case 'IGNORE':
					skip += 1;
					break;

				default:
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
	} catch (error) {
		bar1.stop();
		throw error;
	}
}
