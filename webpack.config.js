const __DEV__ = process.env.NODE_ENV !== 'production';

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const plugins = [
	new webpack.EnvironmentPlugin('NODE_ENV'),
];

const entry = [
	'./src/start/heyneighbor-client',
];

const babelrc = JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf-8').toString());

module.exports = {
	devtool: 'source-map',
	entry: __DEV__ ? [ ...entry, 'webpack-hot-middleware/client' ] : [ ...entry ],
	output: {
		path: path.resolve(__dirname, 'static/dist/scripts'),
		publicPath: '/dist/scripts',
		filename: 'bundle.min.js',
		sourceMapFilename: 'bundle.min.js.map'
	},
	plugins: __DEV__ ? [ ...plugins, new webpack.HotModuleReplacementPlugin() ] : [ ...plugins, new webpack.optimize.UglifyJsPlugin() ],
	resolve: {
		extensions: [ '', '.web.js', '.js' ],
	},
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				loader: 'eslint?quiet=true',
				exclude: /node_modules/
			}
		],
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/,
				query: Object.assign({}, babelrc, {
					presets: babelrc.presets.map(p => p === 'es2015' ? 'es2015-native-modules' : p),
					env: {
						developement: {
							presets: [ 'react-hmre' ],
						},
					}
				})
			},
			{
				test: /\.json$/,
				loader: 'json'
			}
		]
	}
};
