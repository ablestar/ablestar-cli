import { writeIni } from '../utils/index.js';
import { verifyToken } from '../utils/shopify.js';

export async function verifyApiKey(options) {
	try {
		const response = await verifyToken(options);

		if (response.status === 200) writeIni(options);
		else throw `Error code ${response.status}`;

		console.log();
		console.log('Success! You can now export data with the following command:');
		console.log(
			'ablestar-cli export products example.myshopify.com --format=CSV --fields=products',
		);
	} catch (error) {
		console.log(error);
		console.log('Error! Please check API Key and Password again.');
	}
}
