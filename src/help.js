import chalk from 'chalk';

export default function showHelp() {
	console.log(`
	${chalk.bgGreenBright.black(' USAGE ')}

	$ ${chalk.greenBright('ablestar-cli')} ${chalk.cyan('<command>')} ${chalk.yellowBright('[options]')}

	${chalk.bgCyan.black(' COMMANDS ')}

	${chalk.cyan('init')}    Initialize the store
	
	${chalk.cyan('export')}  Export products from Shopify
	${chalk.cyan('import')}  Import products to Shopify

	${chalk.bgYellowBright.black(' OPTIONS ')}

	${chalk.yellowBright('-t, --type')}     Type of products to export/import (${chalk.yellowBright(
		'products',
	)}/${chalk.yellowBright('variants')})
	${chalk.yellowBright('-u, --url')}      URL of store (${chalk.yellowBright('*.myshopify.com')})
	${chalk.yellowBright(
		'-f, --format',
	)}   File format that be uses to export/import (${chalk.yellowBright(
		'CSV',
	)}/${chalk.yellowBright('Excel')})
	${chalk.yellowBright('-i, --fields')}   Fields that be exported/imported (${chalk.yellowBright(
		'products',
	)}/${chalk.yellowBright('variants')})

	${chalk.yellowBright('-v, --version')}  Print CLI version
	${chalk.yellowBright('-h, --help')}  Print CLI help
	`);
}
