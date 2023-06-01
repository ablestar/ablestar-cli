import welcome from 'cli-welcome';
import unhandled from 'cli-handle-unhandled';
import { require } from '../utils/index.js';
const pkg = require('./../package.json');

export default () => {
	unhandled();
	welcome({
		title: `ablestar-cli`,
		tagLine: ``,
		description: pkg.description,
		version: pkg.version,
		bgColor: '#36BB09',
		color: '#000000',
		bold: true,
		clear: false,
	});
};
