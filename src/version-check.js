// const packageJson = require("package-json");
// const semver = require("semver");
import packageJson from 'package-json';
import semver from 'semver';
import chalk from 'chalk';
import fs from 'fs';
// import appRootPath from 'app-root-path';
import ini from 'ini';

import { require } from '../utils/index.js';
import init from './init.js';
const thisPackage = require('../package.json');
import os from 'os';

const appRootPath = { path: os.homedir() };

const shouldCheck = () => {
	let config = {};
	if (fs.existsSync(appRootPath.path + '/.ablestar/cli.ini')) {
		config = ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));

		if (
			config?.core?.disable_version_check === '1' ||
			config?.core?.disable_version_check === 'true'
		)
			return false;
		else return true;
	} else {
		return false; // set false if there is no config file.
	}
};

const versionCheck = async () => {
	const check = shouldCheck();

	if (!check) return;

	let config = ini.parse(fs.readFileSync(appRootPath.path + '/.ablestar/cli.ini', 'utf-8'));

	const current = getCurrentVersion();
	const latest = config.core?.latest_version || '0.0.0';

	if (newVersionAvailable(current, latest)) {
		renderUpdateBanner(current, latest);
	} else {
		init();
	}
	config.core.latest_version = await getLatestVersion();

	fs.writeFileSync(appRootPath.path + '/.ablestar/cli.ini', ini.stringify(config));
};

const getCurrentVersion = () => thisPackage.version;

const getLatestVersion = async () => {
	try {
		const name = thisPackage.name;
		const publishedPackage = await packageJson(name, {
			allVersions: true,
			registryUrl: `https://npmjs-proxy.ablestar.workers.dev`,
		});
		return publishedPackage.version;
	} catch (e) {
		// Something failed. Return 0.0.0 to avoid the update message
		return '0.0.0';
	}
};

const newVersionAvailable = (current, latest) => semver.compare(current, latest) < 0;

const renderUpdateBanner = (current, latest) => {
	console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	${chalk.hex('#FFA500')('   Update available! ')} ${chalk.yellowBright(
		current,
	)}  →  ${chalk.greenBright(latest)}
	Run ${chalk.cyan('npm install -g @ablestar/ablestar-cli')} to update
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	`);
};

export default versionCheck;
