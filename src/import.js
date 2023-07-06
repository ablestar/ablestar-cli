import { customCollectionQuery, groupSmartCollection, runMatrixify, smartCollectionQuery } from '../utils/import.js';
import { shopifyRESTApi, shopifyRESTApiSingle } from '../utils/shopify.js';
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
	await runMatrixify(options, fileData, customCollectionQuery);
}

export async function runImportSmartCollection(options, fileData) {
	const groupData = groupSmartCollection(fileData);
	await runMatrixify(options, groupData, smartCollectionQuery);
}
