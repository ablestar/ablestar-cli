import { initMethod, promptForMissingOptions } from '../src/cli.js';
import { addFields, addPrefix, addValues, defaultFields, isMain } from '../utils/fields.js';
import { getHeader, jsonToSheet } from '../utils/index.js';
import { testJson } from './mock/mock-const.js';

describe('cli init', () => {
	it('should return correct method', async () => {
		const options = await initMethod({ method: 'init' });
		expect(options.method).toEqual('init');
	});

});

describe('export', () => {
	it('should return correct method', async () => {
		const options = await initMethod({ method: 'export' });
		expect(options.method).toEqual('export');
	});

	it('should return correct options', async () => {
		const options = await promptForMissingOptions({
			type: 'products',
			url: 'test',
			format: 'csv',
			fileName: 'test_file_name',
			fields: ['id'],
		});
		expect(options.fileName).toEqual('test_file_name');
		expect(options.type).toEqual('products');
		expect(options.format).toEqual('csv');
		expect(options.fields).toHaveLength(1);
	});

	it('should add default fields', () => {
		const fields = defaultFields('products');
		expect(fields).toEqual(['id', 'handle']);
	});

	it('should define main field', () => {
		const is_main = isMain('products', 'variants');
		expect(is_main).toEqual(true);
	});

	it('should add prefix to the object keys', () => {
		const result = addPrefix({ id: 'test_id', value: 'test_value' }, 'variants');
		expect(Object.keys(result)).toEqual(['variants__id', 'variants__value']);
	});

	it('should add additional fields depends on format', () => {
		const result = addFields('Matrixify', 'products', [
			'tags-basic',
			'id-basic',
			'handle-basic',
			'id-variants',
			'src-images',
		]);
		expect(result).toEqual([
			'command-basic',
			'row_number_command-basic',
			'top_row_command-basic',
			'tags_command-basic',
			'variant_command-variants',
			'image_command-images',
		]);
	});

	it('should add additional values depends on format', () => {
		const result = addValues(
			'Matrixify',
			'products',
			{ variants__id: 1, images__src: 'src' },
			0,
		);
		expect(result).toMatchObject({
			command: 'MERGE',
			tags_command: 'REPLACE',
			row_number_command: 1,
			variants__variant_command: 'MERGE',
			images__image_command: 'MERGE',
		});
	});

	it('should return correct keys and headers', () => {
		const fields = ['id-basic', 'handle-basic', 'title-basic'];
		const { keys, header } = getHeader(testJson, 'products', fields);
		expect(keys).toEqual(['id', 'handle', 'title']);
		expect(header).toEqual(['ID', 'Handle', 'Title']);
	});

	it('should return correct worksheet', () => {
		const keys = ['id', 'handle', 'title'];
		const header = ['ID', 'Handle', 'Title'];
		let testsheet;

		const data = jsonToSheet(testJson, 0, testsheet, 'products', keys, header);

		expect(Object.keys(data).length).toBe(43);
		expect(data['A2'].v).toBe(6796247957694);
		expect(data['F5'].v).toBe('TRUE');
		expect(data['!ref']).toBe('A1:F7');
	});
});
