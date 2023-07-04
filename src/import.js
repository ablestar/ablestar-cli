import { customCollectionQuery, groupSmartCollection, handleOrIDCheck, itemIDForMatrixify, smartCollectionQuery } from '../utils/import.js';
import { shopifyItemRESTApi, shopifyRESTApi, shopifyRESTApiSingle } from '../utils/shopify.js';
import cliProgress from 'cli-progress';

export async function runImport(options, fileData) {
	const bar1 = new cliProgress.SingleBar(
		{
			format: `[{bar}] {percentage}% | DUR: {duration}s | ETA: {eta}s | {value}/{total}`,
		},
		cliProgress.Presets.shades_classic,
	);
	try {
		console.log();
		bar1.start(fileData.length, 0);
		if (
			options.type === 'customers' &&
			['add-tags', 'set-tags', 'remove-tags'].includes(options.action)
		) {
			let since_id = 0;
			const limit = 250;
			let result = [];
			while (true) {
				const query = {
					params: {
						fields: ['id', 'email', 'tags'],
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

			const filterCol = options.idColumn === 'email' ? 'email' : 'id';
			const ids = fileData.map(item => ({
				...item,
				id: result.find(i => i[filterCol] === item[options.idColumn])?.id || null,
			}));
			const updateResult = await Promise.all(
				ids.map(async item => {
					if (!item.id) return null;
					const tags =
						options.action === 'set-tags'
							? item[options.actionColumn]
							: options.action === 'add-tags'
							? `${result.find(i => i.id === item.id)?.tags || ''}, ${
									item[options.actionColumn]
							  }`
							: result
									.find(i => i.id === item.id)
									?.tags.split(', ')
									.filter(
										el => !item[options.actionColumn].split(', ').includes(el),
									);
					const response = await shopifyRESTApiSingle(
						options.url,
						options.type,
						item.id,
						'put',
						{ customer: { id: item.id, tags } },
					);
					bar1.increment(1);
					return response.customer;
				}),
			);
			bar1.stop();
			console.log(updateResult);
		}
	} catch (error) {
		bar1.stop();
		throw error;
	}
}

export async function runImportCustomCollection(options, fileData) {
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

					const query = customCollectionQuery(item, result);

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
						const query1 = customCollectionQuery(item, result, true);
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

					const query1 = customCollectionQuery(item, result);
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
						const query1 = customCollectionQuery(item, result, true);
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

					const query2 = customCollectionQuery(item, result);
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

export async function runImportSmartCollection(options, fileData) {
	const bar1 = new cliProgress.SingleBar(
		{
			format: `[{bar}] {percentage}% | DUR: {duration}s | ETA: {eta}s | {value}/{total}`,
		},
		cliProgress.Presets.shades_classic,
	);
	const groupData = groupSmartCollection(fileData);

	try {
		console.log();
		bar1.start(groupData.length, 0);

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

		for (const item of groupData) {

			switch (item.Command) {
				case 'NEW':
					if (handleOrIDCheck(item, result)) {
						failed += 1;
						break;
					}

					const query = smartCollectionQuery(item, result);

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
						const query1 = smartCollectionQuery(item, result, true);
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

					const query1 = smartCollectionQuery(item, result);
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
						const query1 = smartCollectionQuery(item, result, true);
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

					const query2 = smartCollectionQuery(item, result);
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
