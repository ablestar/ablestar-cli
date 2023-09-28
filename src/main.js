import chalk from 'chalk';
import {
	shopifyGraphMetaobject,
	shopifyGraphMetaobjectEntries,
	shopifyItemRESTApi,
	shopifyRESTApi,
	shopifyRESTApiCollectionProducts,
	shopifyRESTApiCount,
	shopifyRESTApiDomain,
	shopifyRESTApiProductMetafield,
	shopifyRESTApiSubList,
	shopifyRESTApiVariantMetafield,
} from '../utils/shopify.js';
import {
	getHeader,
	jsonToSheet,
	numFromID,
	orderMultiFields,
	sheetToCsv,
	writeExcel,
	writeMatrixify,
} from '../utils/index.js';
import cliProgress from 'cli-progress';
import _ from 'lodash';
import {
	addFields,
	addPrefix,
	addValues,
	capitalize,
	convertion,
	defaultFields,
	getFieldsFromGroup,
	isMain,
	isMulti,
} from '../utils/fields.js';

export async function run(options) {
	try {
		let since_id = 0;
		const limit = 250;

		let worksheet;

		console.log();
		// create a new progress bar instance and use shades_classic theme
		const bar1 = new cliProgress.SingleBar(
			{
				format: `[{bar}] {percentage}% | DUR: {duration}s | ETA: {eta}s | {value}/{total}`,
			},
			cliProgress.Presets.shades_classic,
		);

		let result = [];
		let filters = {}; // save non-basic fields
		let fields = defaultFields(options.type);

		const start_at = new Date();

		// Graphql api
		if (options.type.includes('metaobject')) {
			let endCursor = '';
			bar1.start(0, 0);

			while (true) {
				const data = await shopifyGraphMetaobject({store: options.url, endCursor});

				if (!data) {
					bar1.stop();

					console.log('\n No result \n');

					return;
				}
				bar1.setTotal( result.length + data.nodes.length );

				if (options.type === 'metaobject_definitions') {

					result = [...result, ...data.nodes.map(item => (item.fieldDefinitions.map(itemField => ({
						id: item.id,
						name: item.name,
						type: item.type,
						metaobjectsCount: item.metaobjectsCount,
						fieldDefinitionKey: itemField.key,
						fieldDefinitionName: itemField.name,
						fieldDefinitionType: itemField.type.name,
						fieldDefinitionRequired: itemField.required,
						fieldDefinitionDescription: itemField.description,
					})))).flat()];

					bar1.increment( data.nodes.length );
				} else if (options.type === 'metaobject_entries') {
					const entryData = await Promise.all(
						data.nodes.map(async (definition) => {
							let entryEndCursor = '';
							const entries = await shopifyGraphMetaobjectEntries({ store: options.url, type: definition.type, entryEndCursor});
							bar1.increment(1);
							if (options.fields.includes('fieldValue-field') || options.fields.includes('fieldKey-field'))
								result = [...result, ...entries ? entries.nodes.map(item => (item.fields.map((itemField, index) => ({
									id: numFromID(item.id),

									top_row_command : index === 0 ? 'TRUE' : null,
									definitionHandle: definition.type,
									definitionName: definition.name,
									status: 'Active',

									displayName: item.displayName,
									handle: item.handle,
									type: item.type,
									updatedAt: item.updatedAt,

									field__fieldKey: itemField.key,
									field__fieldValue: itemField.value,
								})))).flat() : [] ];
							else
								result = [...result, ...entries ? entries.nodes.map(item =>  ({
									id: numFromID(item.id),

									top_row_command : 'TRUE',
									definitionHandle: definition.type,
									definitionName: definition.name,
									status: 'Active',

									displayName: item.displayName,
									handle: item.handle,
									type: item.type,
									updatedAt: item.updatedAt,
								})).flat() : [] ];
						})
					)
				}
				

				
				if (!data.pageInfo.hasNextPage) break;
				endCursor = data.pageInfo.endCursor;
			}

		}

 else {
		// Get total items count
		const data = await shopifyRESTApiCount(options.url, options.type, 'get');
		
		if (!data) {
			console.log(`No ${chalk.greenBright(`${options.type}`)} exist on store`)
			console.log();
			return;
		}
		bar1.start(data.count, 0);

		const domainData = await shopifyRESTApiDomain(options.url, 'get');

		let functions = {}; // save the headers of sheet

		options.fields = getFieldsFromGroup(options);

		if (options.type === 'smart_collections') fields.push('disjunctive');

		for (const field of options.fields) {
			const split = field.split('-');

			if (split[1] === 'basic' || split[1] === 'metafields' || !split[1]) {
				const funcs = split[0].split('___');
				if (!funcs[1]) fields.push(funcs[0]);
				else {
					fields = [...fields, ...funcs[1].split('__')];
					functions['basic'] = functions['basic'] || [];
					functions['basic'].push(funcs[0]);
				}
			} else {
				fields.push(split[1]);

				filters[split[1]] = filters[split[1]] || [];

				const funcs = split[0].split('___');
				if (!funcs[1]) filters[split[1]].push(funcs[0]);
				else {
					filters[split[1]] = [...filters[split[1]], ...funcs[1].split('__')];
					functions[split[1]] = functions[split[1]] || [];
					functions[split[1]].push(funcs[0]);
				}
			}
		}

		for (const filter in filters) {
			filters[filter] = filters[filter].filter(function (item, pos, self) {
				return self.indexOf(item) === pos;
			});
		}
		// Sort filters array, format like {key:[value1, value2]}
		filters = Object.entries(filters)
			.sort(([a], [b]) =>
				isMain(options.type, a) || isMulti(options.type, a)
					? 1
					: isMain(options.type, b) || isMulti(options.type, b)
					? -1
					: 0,
			)
			.sort(([a], [b]) => (a == 'variants' ? -1 : b == 'variants' ? 1 : 0))
			.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

		if (options.type === 'price_rules') {
			filters['entitled_collection_ids'] = [];
			filters['entitled_product_ids'] = [];
			filters['entitled_variant_ids'] = [];

			filters['prerequisite_collection_ids'] = [];
			filters['prerequisite_product_ids'] = [];
			filters['prerequisite_variant_ids'] = [];
			filters['prerequisite_customer_ids'] = [];
		}
		// Loop till result length === 0
		while (true) {
			const query = {
				params: {
					fields: fields
						// remove the duplicated values
						.filter(function (item, pos, self) {
							return self.indexOf(item) === pos;
						})
						.join(','),
					since_id,
					limit,
				},
			};

			const data = await shopifyRESTApi(options.url, options.type, 'get', query);
			let filteredData = [];
			// If type is custom_collection and user selects products export, then should fetch collection products for every collection.
			if ((options.type === 'custom_collections' && filters.products?.length) || options.type === 'price_rules' || options.type === 'blogs') {
				filteredData = await Promise.all(
					data[options.type].map(async item => {
						let products_data = {};
						if (options.type === 'custom_collections' && filters.products?.length) {
							products_data = await shopifyRESTApiCollectionProducts(
								options.url,
								item.id,
								{ fields: ['id'] },
							);
						}

						if (options.type === 'price_rules' && filters.discount_codes?.length) {
							const value = await shopifyRESTApiSubList(
								options.url,
								'price_rules',
								item.id,
								'discount_codes'
							);

							products_data = { discount_codes: value?.discount_codes || [] };
						}
						if (options.type === 'blogs' && filters.articles?.length) {
							const value = await shopifyRESTApiSubList(
								options.url,
								'blogs',
								item.id,
								'articles'
							);

							products_data = { articles: value?.articles || [] };
						}
						let temp = { ...item, ...products_data, domain: domainData.shop.domain };
						bar1.increment(1);

						for (const filter in filters) {
							if (temp[filter]?.length || item[filter]?.length) {
								if (isMain(options.type, filter)) {
									if (!Array.isArray(temp))
										temp = temp[filter].map((subItem, item_index) => {
											return {
												..._.omit(temp, [filter]),
												...addPrefix(
													{
														..._.pick(subItem, filters[filter]),
														item_index,
													},
													filter,
												),
											};
										});
									else {
										const maxLength = Math.max(
											temp.length,
											item[filter].length,
										);
										for (let i = 0; i < maxLength; i++) {
											let itemHandle = null;
											let customerEmail = null;
											if (options.type === "price_rules" && ["string", "number"].includes(typeof item[filter][i]) && filter.includes("ids")) {
												if (filter.includes("product_ids")) {
													const itemValue = await shopifyItemRESTApi(options.url, 'products', item[filter][i], 'get');
													itemHandle = itemValue?.product?.handle;
												} else if (filter.includes("collection_ids")) {
													const itemValue = await shopifyItemRESTApi(options.url, 'collections', item[filter][i], 'get');
													itemHandle = itemValue?.collection?.handle;
												} else if (filter.includes("variant_ids")) {
													const itemValue = await shopifyItemRESTApi(options.url, 'variants', item[filter][i], 'get');
													itemHandle = itemValue?.variant?.handle;
												} else if (filter.includes("customer_ids")) {
													const itemValue = await shopifyItemRESTApi(options.url, 'customers', item[filter][i], 'get');
													customerEmail = itemValue?.customer?.email;
												}
											}
											temp[i] = {
												...(temp[i]
													? { ..._.omit(temp[i], [filter]) }
													: {
															..._.omit(
																item,
																Object.keys(filters).filter(key =>
																	isMain(options.type, key),
																),
															),
													  }),
												...addPrefix(
													(["string", "number"].includes(typeof item[filter][i])) ? { itemVal: itemHandle ?? item[filter][i], ...(customerEmail ? { customerEmail } : {}) } : _.pick(item[filter][i], filters[filter]) || {},
													filter,
												),
											};
										}
									}

									if (functions[filter]?.length) {
										for (const func of functions[filter]) {
											const funcName = func.split('__')[0];
											const param = func.split('__')[1];

											if (param) {
												temp = temp.map(item =>
													convertion[options.type][filter][funcName](
														item,
														param,
													),
												);
											} else {
												temp = temp.map(item =>
													convertion[options.type][filter][funcName](
														item,
													),
												);
											}
										}
									}
								} else {
									temp = {
										..._.omit(temp, [filter]),
										[filter]: Array.isArray(temp[filter])
											? JSON.stringify(
													temp[filter].map(i =>
														_.pick(i, filters[filter]),
													),
											  )
											: JSON.stringify(_.pick(temp[filter], filters[filter])),
									};
								}
							}
						}

						if (temp.length) {
							temp[0].top_row_command = 'TRUE';
							for (let i = 0; i < temp.length; i++) {
								if (functions.basic?.length) {
									for (const func of functions.basic) {
										const funcName = func.split('__')[0];
										const param = func.split('__')[1];

										if (param) {
											temp[i] = convertion[options.type]['basic'][funcName](
												temp[i],
												param,
											);
										} else {
											temp[i] = convertion[options.type]['basic'][funcName](
												temp[i],
											);
										}
									}
								}
							}
						} else {
							temp.top_row_command = 'TRUE';
							if (functions.basic?.length) {
								for (const func of functions.basic) {
									const funcName = func.split('__')[0];
									const param = func.split('__')[1];

									if (param) {
										temp = convertion[options.type]['basic'][funcName](
											temp,
											param,
										);
									} else {
										temp = convertion[options.type]['basic'][funcName](temp);
									}
								}
							}
						}

						return temp;
					}),
				);
			} else {
				filteredData = await Promise.all(
					data[options.type].map(async item => {
						let metafields = {};
						if (options.type === 'products' && fields.includes('metafields')) {
							const value = await shopifyRESTApiProductMetafield(
								options.url,
								item.id,
							);

							metafields = { metafields: value?.metafields || [] };
						}

						let temp = { ...item, ...metafields, domain: domainData.shop.domain };
						if (fields.includes('variant_metafields')) {
							temp.variants = await Promise.all(
								(temp.variants || []).map(async subItem => {
									const response = await shopifyRESTApiVariantMetafield(
										options.url,
										subItem.id,
									);
									let adds = {};
									for (const meta in response?.metafields) {
										if (
											!filters.variants.includes(
												`h_variant__${response.metafields[meta]?.key}`,
											)
										)
											filters.variants.push(
												`h_variant__${response.metafields[meta]?.key}`,
											);
										adds = {
											...adds,
											[`h_variant__${response.metafields[meta]?.key}`]:
												response.metafields[meta]?.value,
										};
									}
									filters.variants.push('variant_metafields');
									return {
										...subItem,
										...adds,
										variant_metafields: response?.metafields || [],
									};
								}),
							);
						}

						if (functions.basic?.length) {
							for (const func of functions.basic) {
								const funcName = func.split('__')[0];
								const param = func.split('__')[1];

								if (param) {
									temp = convertion[options.type]['basic'][funcName](temp, param);
								} else {
									temp = convertion[options.type]['basic'][funcName](temp);
								}
							}
						}

						const itemWithFunc = { ...temp };

						for (const filter in filters) {
							if (
								item[filter]?.length ||
								(options.type === 'orders' && orderMultiFields().includes(filter))
							) {
								item[filter] = item[filter] || [];

								if (isMain(options.type, filter)) {
									// should use temp to pick for variant metafield
									if (!Array.isArray(temp))
										temp = temp[filter].map(subItem => {
											return {
												..._.omit(temp, [filter]),
												...addPrefix(
													_.pick(subItem, filters[filter]),
													filter,
												),
											};
										});
									else {
										const maxLength = Math.max(
											temp.length,
											item[filter].length,
										);
										for (let i = 0; i < maxLength; i++) {
											temp[i] = {
												...(temp[i]
													? { ..._.omit(temp[i], [filter]) }
													: {
															..._.omit(
																itemWithFunc,
																Object.keys(filters).filter(key =>
																	isMain(options.type, key),
																),
															),
													  }),
												...addPrefix(
													_.pick(item[filter][i], filters[filter]) || {},
													filter,
												),
											};
										}
									}

									if (functions[filter]?.length) {
										for (const func of functions[filter]) {
											const funcName = func.split('__')[0];
											const param = func.split('__')[1];

											if (param) {
												temp = temp.map(item =>
													convertion[options.type][filter][funcName](
														item,
														param,
													),
												);
											} else {
												temp = temp.map(item =>
													convertion[options.type][filter][funcName](
														item,
													),
												);
											}
										}
									}
								} else if (isMulti(options.type, filter)) {
									if (!Array.isArray(temp))
										temp = item[filter].map(subItem => {
											return {
												client_details__line_type_command: capitalize(
													filter,
												).slice(0, -1),
												line_items__line_command: 'DEFAULT',
												line_items__force_gift_card: 'No',
												..._.omit(temp, [filter]),
												...addPrefix(
													_.pick(subItem, filters[filter]),
													filter,
												),
											};
										});
									else {
										let tempLength = item[filter].length;
										if (item[filter].length > 0)
											for (let i = 0; i < tempLength; i++) {
												temp.push({
													client_details__line_type_command: capitalize(
														filter,
													).slice(0, -1),
													line_items__line_command: 'DEFAULT',
													line_items__force_gift_card: 'No',
													..._.omit(
														itemWithFunc,
														Object.keys(filters).filter(key =>
															isMulti(options.type, key),
														),
													),
													...addPrefix(
														_.pick(item[filter][i], filters[filter]) ||
															{},
														filter,
													),
												});
											}
									}

									if (functions[filter]?.length) {
										for (const func of functions[filter]) {
											const funcName = func.split('__')[0];
											const param = func.split('__')[1];
											if (param) {
												temp = temp.map(item =>
													convertion[options.type][filter][funcName](
														item,
														param,
													),
												);
											} else {
												temp = temp.map(item =>
													convertion[options.type][filter][funcName](
														item,
													),
												);
											}
										}
									}
								} else {
									temp = {
										..._.omit(temp, [filter]),
										[filter]: Array.isArray(item[filter])
											? JSON.stringify(
													item[filter].map(i =>
														_.pick(i, filters[filter]),
													),
											  )
											: JSON.stringify(_.pick(item[filter], filters[filter])),
									};
								}
							} else if (!Array.isArray(item[filter])) {
								temp = {
									..._.omit(temp, [filter]),
									...addPrefix(_.pick(item[filter], filters[filter]), filter),
								};

								if (functions[filter]?.length) {
									for (const func of functions[filter]) {
										const funcName = func.split('__')[0];
										const param = func.split('__')[1];

										if (param) {
											temp = convertion[options.type][filter][funcName](
												temp,
												param,
											);
										} else {
											temp = convertion[options.type][filter][funcName](temp);
										}
									}
								}
							}
						}

						if (temp.length) {
							temp[0].top_row_command = 'TRUE';
							temp[0].client_details__top_row_command = 'TRUE';
							for (let i = 0; i < temp.length; i++) {
								if (options.type === 'products' && i !== 0) temp[i].body_html = '';
								if (options.type === 'products' && fields.includes('metafields') && i !== 0) {
									for (const key of Object.keys(temp[i])) {
										if (key.includes('h_product__')) temp[i][key] = '';
									}
								}
							}
						} else {
							temp.top_row_command = 'TRUE';
							temp.client_details__top_row_command = 'TRUE';
						}

						bar1.increment(1);
						return temp;
					}),
				);
			}
			// Flat the filteredData because it might be nested array.
			const flatData = filteredData.flat();

			if (data[options.type].length === 0) break;

			result = [...result, ...flatData];

			if (data[options.type].length !== limit) break;
			since_id = data[options.type][data[options.type].length - 1].id;
		}
	}
		const finish_at = new Date();

		const { keys, header } = getHeader(result, options.type, [
			...options.fields,
			...addFields(options.format, options.type, options.fields),
		]);

		result = result.map((item, index) =>
			_.pick(
				{
					...item,
					...addValues(options.format, options.type, item, index),
				},
				keys,
			),
		);
		worksheet = jsonToSheet(result, 0, worksheet, options.type, keys, header);

		if (options.format === 'Excel') {
			writeExcel(worksheet, `${options.type}`, `${options.fileName}.xlsx`);
		} else if (options.format === 'CSV') {
			sheetToCsv(worksheet, `${options.fileName}.csv`);
		} else if (options.format === 'Matrixify') {
			writeMatrixify(
				worksheet,
				capitalize(options.type),
				`${options.fileName}.xlsx`,
				header,
				{
					items: capitalize(options.type),
					start_at,
					finish_at,
					duration: new Date(finish_at - start_at).toISOString().substring(11, 19),
					per_seconds: ((finish_at - start_at) / result.length / 1000).toFixed(3),
					exported: result.length,
					details: [
						'base',
						...Object.keys(filters),
						...(options.type === 'products' && fields.includes('metafields')
							? ['Metafields']
							: []),
						...(fields.includes('variant_metafields') ? ['Variant Metafields'] : []),
					]
						.map(capitalize)
						.toString(),
					filter: '',
					columns: [
						...header.filter(h => !h.includes('Metafield')),
						...(options.type === 'products' && fields.includes('metafields')
							? ['Metafield ...']
							: []),
						...(fields.includes('variant_metafields') ? ['Variant Metafield ...'] : []),
					].toString(),
				},
			);
		}
		bar1.stop();
		console.log();
		console.log('%s Operation Succeeded.', chalk.green.bold('DONE'));

		console.log();
	} catch (error) {
		console.log(error);
		console.error('%s Operation Failed.', chalk.red.bold('ERROR'));
	}
}
