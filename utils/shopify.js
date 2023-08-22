// Shopify related functions.
import { getKeyToken, getToken, sleep } from './index.js';
import ax from 'axios';

let axios = ax.create({});

axios.interceptors.response.use(
	response => {
		return response;
	},
	error => {
		// send 429 as error so recall the api after sleep.
		if (error.response?.status === 429) {
			return Promise.reject(429);
		}
		
		if (error.code === 'ETIMEDOUT' && error.port === 443) {
			return Promise.reject(443);
		}
		
		if (error.code === 'ECONNRESET' || error.response?.status === 502|| error.response?.status === 504) {
			return Promise.reject(4077);
		}

		console.log(error)

		return Promise.reject(error.message);
	},
);

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

const apiVersion = "2023-04";

export async function verifyToken({ url, apiPass }) {
	const response = await axios.post(
		`https://${url}/admin/api/${apiVersion}/graphql.json`,
		TEST_GRAPHQL_QUERY,
		{
			headers: {
				'Content-Type': 'application/graphql',
				'X-Shopify-Access-Token': apiPass,
			},
		},
	);
	return response;
}

export async function shopifyApi(url, query) {
	const token = await getToken(url);
	const response = await axios.post(`https://${url}/admin/api/graphql.json`, query, {
		headers: {
			'Content-Type': 'application/graphql',
			'X-Shopify-Access-Token': token,
		},
	});
	return response.data?.data;
}

export async function shopifyRESTApi(store, resource, method, query) {
	const { apikey, token } = await getKeyToken(store);
	try {
		const response = await axios[method](
			`https://${apikey}:${token}@${store}/admin/api/${apiVersion}/${resource}.json`,
			query,
		);
		return response.data;
	} catch (error) {
		if (error === 429) {
			sleep(2000);
			return await shopifyRESTApi(store, resource, method, query);
		}
		if (error === 443) {
			sleep(5000);
			return await shopifyRESTApi(store, resource, method, query);
		}
		if (error === 4077) {
			sleep(10000);
			return await shopifyRESTApi(store, resource, method, query);
		}
	}
	
}

export async function shopifyRESTApiCount(store, resource, method, query) {
	const { apikey, token } = await getKeyToken(store);
	try {
		const response = await axios[method](
			`https://${apikey}:${token}@${store}/admin/api/${apiVersion}/${resource}/count.json`,
			query,
		);
		return response.data;
	} catch (error) {
		if (error === 429) {
			sleep(2000);
			return await shopifyRESTApiCount(store, resource, method, query);
		}
		if (error === 443) {
			sleep(5000);
			return await shopifyRESTApiCount(store, resource, method, query);
		}
		if (error === 4077) {
			sleep(10000);
			return await shopifyRESTApiCount(store, resource, method, query);
		}
	}
	
}

export async function shopifyRESTApiDomain(store, method, query) {
	const { apikey, token } = await getKeyToken(store);
	try {
		const response = await axios[method](
			`https://${apikey}:${token}@${store}/admin/api/${apiVersion}/shop.json`,
			query,
		);
		return response.data;
	} catch (error) {
		if (error === 429) {
			sleep(2000);
			return await shopifyRESTApiDomain(store, method, query);
		}
		if (error === 443) {
			sleep(5000);
			return await shopifyRESTApiDomain(store, method, query);
		}
		if (error === 4077) {
			sleep(10000);
			return await shopifyRESTApiDomain(store, method, query);
		}
	}
	
}

export async function shopifyRESTApiCollectionProducts(store, collectionId) {
	const { apikey, token } = await getKeyToken(store);
	try {
		const response = await axios['get'](
			`https://${apikey}:${token}@${store}/admin/api/${apiVersion}/collections/${collectionId}/products.json`,
		);

		return response.data;
	} catch (error) {
		if (error === 429) {
			sleep(2000);
			return await shopifyRESTApiCollectionProducts(store, collectionId);
		}
		if (error === 443) {
			sleep(5000);
			return await shopifyRESTApiCollectionProducts(store, collectionId);
		}
		if (error === 4077) {
			sleep(10000);
			return await shopifyRESTApiCollectionProducts(store, collectionId);
		}
	}
}

export async function shopifyRESTApiProductMetafield(store, productId) {
	const { apikey, token } = await getKeyToken(store);
	try {
		const response = await axios['get'](
			`https://${apikey}:${token}@${store}/admin/api/${apiVersion}/products/${productId}/metafields.json`,
		);

		return response.data;
	} catch (error) {
		if (error === 429) {
			sleep(2000);
			return await shopifyRESTApiProductMetafield(store, productId);
		}
		if (error === 443) {
			sleep(5000);
			return await shopifyRESTApiProductMetafield(store, productId);
		}
		if (error === 4077) {
			sleep(10000);
			return await shopifyRESTApiProductMetafield(store, productId);
		}
	}
}


export async function shopifyRESTApiVariantMetafield(store, variantId) {
	const { apikey, token } = await getKeyToken(store);
	try {
		const response = await axios['get'](
			`https://${apikey}:${token}@${store}/admin/api/${apiVersion}/variants/${variantId}/metafields.json`,
		);

		return response.data;
	} catch (error) {
		if (error === 429) {
			sleep(2000);
			return await shopifyRESTApiVariantMetafield(store, variantId);
		}
		if (error === 443) {
			sleep(5000);
			return await shopifyRESTApiVariantMetafield(store, variantId);
		}
		if (error === 4077) {
			sleep(10000);
			return await shopifyRESTApiVariantMetafield(store, variantId);
		}
	}
}

export async function shopifyRESTApiSingle(store, resource, id, method, query) {
	const { apikey, token } = await getKeyToken(store);
	const response = await axios[method](
		`https://${apikey}:${token}@${store}/admin/api/${apiVersion}/${resource}/${id}.json`,
		query,
	);
	return response.data;
}

const META_QUERY = (cursor) => `{
  metaobjectDefinitions(first: 250 ${cursor ? `, after: "${cursor}"` : ''}) {
		nodes {
			id
			name
			type
			metaobjectsCount
			fieldDefinitions {
				key
				name
				description
				required
				type {
					name
				}
			}
		}
		pageInfo {
			hasNextPage
			endCursor
		}
	}
}`

export async function shopifyGraphMetaobject({ store, endCursor }) {
	const { token } = await getKeyToken(store);
	const QUERY = META_QUERY(endCursor);

	const response = await axios.post(
		`https://${store}/admin/api/${apiVersion}/graphql.json`,
		QUERY,
		{
			headers: {
				'Content-Type': 'application/graphql',
				'X-Shopify-Access-Token': token,
			},
		},
	);
	return response.data.data?.metaobjectDefinitions;
}

const ENTRY_QUERY = (cursor, type) => `{
  metaobjects (first: 250 ${cursor ? `, after: "${cursor}"` : ''}, type: "${type}") {
		nodes {
			id
			displayName
			handle
			type
			updatedAt
			fields {
				key
				value
			}
		}
		pageInfo {
			hasNextPage
			endCursor
		}
	}
}`

export async function shopifyGraphMetaobjectEntries({ store, type, endCursor }) {
	const { token } = await getKeyToken(store);
	const QUERY = ENTRY_QUERY(endCursor, type);

	const response = await axios.post(
		`https://${store}/admin/api/${apiVersion}/graphql.json`,
		QUERY,
		{
			headers: {
				'Content-Type': 'application/graphql',
				'X-Shopify-Access-Token': token,
			},
		},
	);

	if (response.data.errors?.[0].message === 'Throttled') {
		sleep(2000);
		return await shopifyGraphMetaobjectEntries({ store, type, endCursor });
	}
	
	return response.data.data?.metaobjects;
}
