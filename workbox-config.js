module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{css,png,html,json,js}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};