// custom tree prompt for inquirer

import { require } from '../utils/index.js';
const _ = {
	cloneDeep: require('lodash/cloneDeep'),
};
import chalk from 'chalk';
import figures from 'figures';
import cliCursor from 'cli-cursor';
const { fromEvent } = require('rxjs');
const { filter, share, flatMap, map, take, takeUntil } = require('rxjs/operators');
import BasePrompt from 'inquirer/lib/prompts/base.js';
import observe from 'inquirer/lib/utils/events.js';
import Paginator from 'inquirer/lib/utils/paginator.js';
import util from 'util';

class TreePrompt extends BasePrompt {
	constructor(questions, rl, answers) {
		super(questions, rl, answers);

		this.done = () => {};

		this.firstRender = true;

		const tree =
			typeof this.opt.tree === 'function'
				? _.cloneDeep(this.opt.tree(answers))
				: _.cloneDeep(this.opt.tree);

		this.tree = { children: tree };

		this.shownList = [];

		this.opt = {
			pageSize: 10,
			multiple: false,
			...this.opt,
		};

		// Make sure no default is set (so it won't be printed)
		this.opt.default = null;

		this.paginator = new Paginator(this.screen, { isInfinite: this.opt.loop !== false });

		this.selectedList = [];
	}

	/**
	 * @protected
	 */
	async _run(done) {
		this.done = done;

		this._installKeyHandlers();

		cliCursor.hide();

		await this.prepareChildrenAndRender(this.tree);

		// TODO: exit early somehow if no items
		// TODO: what about if there are no valid items?

		return this;
	}

	_installKeyHandlers() {
		const events = observe(this.rl);

		const validation = this.handleSubmitEvents(
			events.line.pipe(
				map(() => this.valueFor(this.opt.multiple ? this.selectedList[0] : this.active)),
			),
		);
		validation.success.forEach(this.onSubmit.bind(this));
		validation.error.forEach(this.onError.bind(this));

		events.normalizedUpKey.pipe(takeUntil(validation.success)).forEach(this.onUpKey.bind(this));

		events.normalizedDownKey
			.pipe(takeUntil(validation.success))
			.forEach(this.onDownKey.bind(this));

		events.keypress
			.pipe(
				filter(({ key }) => key.name === 'right'),
				share(),
			)
			.pipe(takeUntil(validation.success))
			.forEach(this.onRightKey.bind(this));

		events.keypress
			.pipe(
				filter(({ key }) => key.name === 'left'),
				share(),
			)
			.pipe(takeUntil(validation.success))
			.forEach(this.onLeftKey.bind(this));

		events.spaceKey.pipe(takeUntil(validation.success)).forEach(this.onSpaceKey.bind(this));

		function normalizeKeypressEvents(value, key) {
			return { value: value, key: key || {} };
		}
		fromEvent(this.rl.input, 'keypress', normalizeKeypressEvents)
			.pipe(
				filter(({ key }) => key && key.name === 'tab'),
				share(),
			)
			.pipe(takeUntil(validation.success))
			.forEach(this.onTabKey.bind(this));
	}

	async prepareChildrenAndRender(node) {
		await this.prepareChildren(node);

		this.render();
	}

	async prepareChildren(node) {
		if (node.prepared) {
			return;
		}
		node.prepared = true;

		await this.runChildrenFunctionIfRequired(node);

		if (!node.children) {
			return;
		}

		this.cloneAndNormaliseChildren(node);

		await this.validateAndFilterDescendants(node);
	}

	async runChildrenFunctionIfRequired(node) {
		if (typeof node.children === 'function') {
			try {
				const nodeOrChildren = await node.children();
				if (nodeOrChildren) {
					let children;
					if (Array.isArray(nodeOrChildren)) {
						children = nodeOrChildren;
					} else {
						children = nodeOrChildren.children;
						['name', 'value', 'short'].forEach(property => {
							node[property] = nodeOrChildren[property];
						});
						node.isValid = undefined;

						await this.addValidity(node);

						/*
						 * Don't filter based on validity; children can be handled by the
						 * callback itself if desired, and filtering out the node itself
						 * would be a poor experience in this scenario.
						 */
					}

					node.children = _.cloneDeep(children);
				}
			} catch (e) {
				/*
				 * if something goes wrong gathering the children, ignore it;
				 * it could be something like permission denied for a single
				 * directory in a file hierarchy
				 */

				node.children = null;
			}
		}
	}

	cloneAndNormaliseChildren(node) {
		node.children = node.children.map(item => {
			if (typeof item !== 'object') {
				return {
					value: item,
				};
			}

			return item;
		});
	}

	async validateAndFilterDescendants(node) {
		for (let index = node.children.length - 1; index >= 0; index--) {
			const child = node.children[index];

			child.parent = node;

			await this.addValidity(child);

			if (this.opt.hideChildrenOfValid && child.isValid === true) {
				child.children = null;
			}

			if (this.opt.onlyShowValid && child.isValid !== true && !child.children) {
				node.children.splice(index, 1);
			}

			await this.prepareChildren(child);
		}
	}

	async addValidity(node) {
		if (typeof node.isValid === 'undefined') {
			if (this.opt.validate) {
				node.isValid = await this.opt.validate(this.valueFor(node), this.answers);
			} else {
				node.isValid = true;
			}
		}
	}

	render(error) {
		let message = this.getQuestion();

		if (this.firstRender) {
			let hint = 'Use arrow keys,';
			if (this.opt.multiple) {
				hint += ' space to select,';
			}
			hint += ' enter to confirm.';

			message += chalk.dim(`(${hint})`);
		}

		if (this.status === 'answered') {
			let answer = '\n ';
			if (this.opt.multiple) {
				// group the values to output
				const groupBy = this.selectedList.reduce(function (r, a) {
					if (!!a.children) return r;
					r[a.parent.name] = r[a.parent.name] || [];
					r[a.parent.name].push(a);
					return r;
				}, {});

				for (const groupName in groupBy) {
					if (groupName !== 'undefined') {
						answer += `${groupName}[`;
						answer +=
							groupBy[groupName].map(item => this.shortFor(item, true)).join(', ') +
							'] \n ';
					} else {
						answer += groupBy[groupName].map(item => this.shortFor(item, true)).join(', ')
					}
				}
			} else {
				answer = this.shortFor(this.active, true);
			}

			message += chalk.cyan(answer);
		} else {
			this.shownList = [];
			let treeContent = this.createTreeContent();
			if (this.opt.loop !== false) {
				treeContent += '----------------';
			}
			message +=
				'\n' +
				this.paginator.paginate(
					treeContent,
					this.shownList.indexOf(this.active),
					this.opt.pageSize,
				);
		}

		let bottomContent;

		if (error) {
			bottomContent = '\n' + chalk.red('>> ') + error;
		}

		this.firstRender = false;

		this.screen.render(message, bottomContent);
	}

	createTreeContent(node = this.tree, indent = 2) {
		const children = node.children || [];
		let output = '';
		const isFinal = this.status === 'answered';

		children.forEach(child => {
			this.shownList.push(child);
			if (!this.active) {
				this.active = child;
			}

			let prefix = child.children
				? child.open
					? figures.arrowDown + ' '
					: figures.arrowRight + ' '
				: child === this.active
				? figures.pointer + ' '
				: '  ';

			if (this.opt.multiple) {
				prefix += this.selectedList.includes(child) ? figures.radioOn : figures.radioOff;
				prefix += ' ';
			}

			const showValue = ' '.repeat(indent) + prefix + this.nameFor(child, isFinal) + '\n';

			if (child === this.active) {
				if (child.isValid === true) {
					output += chalk.cyan(showValue);
				} else {
					output += chalk.red(showValue);
				}
			} else {
				output += showValue;
			}

			if (child.open) {
				output += this.createTreeContent(child, indent + 2);
			}
		});

		return output;
	}

	shortFor(node, isFinal = false) {
		return typeof node.short !== 'undefined' ? node.short : this.nameFor(node, isFinal);
	}

	nameFor(node, isFinal = false) {
		if (typeof node.name !== 'undefined') {
			return node.name;
		}

		if (this.opt.transformer) {
			return this.opt.transformer(node.value, this.answers, { isFinal });
		}

		return node.value;
	}

	valueFor(node) {
		return typeof node?.value !== 'undefined' ? node.value : node?.name || '';
	}

	onError(state) {
		this.render(state.isValid);
	}

	onSubmit(state) {
		if (this.opt.multiple && !this.selectedList.length) throw 'error';
		this.status = 'answered';

		this.render();

		this.screen.done();
		cliCursor.show();

		this.done(
			this.opt.multiple
				? this.selectedList
						.map(item => {
							if (!item.children && this.valueFor(item.parent))
								return `${this.valueFor(item)}-${this.valueFor(item.parent)}`;
							else if (!item.children && !this.valueFor(item.parent))
								return `${this.valueFor(item)}-metafields`;
						})
						.filter(item => !!item)
				: state.value,
		);
	}

	onUpKey() {
		this.moveActive(-1);
	}

	onDownKey() {
		this.moveActive(1);
	}

	onLeftKey() {
		if (this.active.children && this.active.open) {
			this.active.open = false;
		} else {
			if (this.active.parent !== this.tree) {
				this.active = this.active.parent;
			}
		}

		this.render();
	}

	onRightKey() {
		if (this.active.children) {
			if (!this.active.open) {
				this.active.open = true;

				this.prepareChildrenAndRender(this.active);
			} else if (this.active.children.length) {
				this.moveActive(1);
			}
		}
	}

	moveActive(distance = 0) {
		const currentIndex = this.shownList.indexOf(this.active);
		let index = currentIndex + distance;

		if (index >= this.shownList.length) {
			if (this.opt.loop === false) {
				return;
			}
			index = 0;
		} else if (index < 0) {
			if (this.opt.loop === false) {
				return;
			}
			index = this.shownList.length - 1;
		}

		this.active = this.shownList[index];

		this.render();
	}

	onTabKey() {
		this.toggleOpen();
	}

	onSpaceKey() {
		if (this.opt.multiple) {
			this.toggleSelection();
		} else {
			this.toggleOpen();
		}
	}

	toggleSelection() {
		if (this.active.isValid !== true) {
			return;
		}
		const selectedIndex = this.selectedList.indexOf(this.active);
		if (selectedIndex === -1) {
			this.selectedList.push(this.active);
			this.toggleAll(this.active, true);
			this.checkParent(this.active, true);
		} else {
			this.selectedList.splice(selectedIndex, 1);
			this.toggleAll(this.active, false);
			this.checkParent(this.active, false);
		}

		this.render();
	}

	toggleAll(parent, value) {
		if (parent.children) {
			parent.children.map(child => {
				if (value) {
					if (this.selectedList.indexOf(child) === -1) this.selectedList.push(child);
					this.toggleAll(child, true);
				} else {
					this.selectedList.splice(this.selectedList.indexOf(child), 1);
					this.toggleAll(child, false);
				}
			});
		}
		return;
	}

	checkParent(item, value) {
		if (!item.parent.value) return;
		if (!value) {
			if (this.selectedList.indexOf(item.parent) !== -1)
				this.selectedList.splice(this.selectedList.indexOf(item.parent), 1);
			this.checkParent(item.parent, false);
		} else {
			if (item.parent.children.map(i => this.selectedList.indexOf(i)).includes(-1)) {
				if (this.selectedList.indexOf(item.parent) !== -1)
					this.selectedList.splice(this.selectedList.indexOf(item.parent), 1);
				this.checkParent(item.parent, false);
			} else {
				this.selectedList.push(item.parent);
				this.checkParent(item.parent, true);
			}
		}
	}

	toggleOpen() {
		if (!this.active.children) {
			return;
		}

		this.active.open = !this.active.open;

		this.render();
	}
}

export default TreePrompt;
