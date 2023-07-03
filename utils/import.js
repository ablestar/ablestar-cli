import fs from 'fs';
import XLSX from 'xlsx';

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
