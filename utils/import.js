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
