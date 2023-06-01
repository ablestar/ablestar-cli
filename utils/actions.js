export const actions = {
	customers: {
		tags: ['set-tags', 'add-tags', 'remove-tags'],
	},
};

export const actionTree = type => {
	return Object.keys(actions[type])
		.map(item =>
			actions[type][item].map(action => ({
				value: action,
				name: `${item} - ${action}`,
			})),
		)
		.flat();
};
