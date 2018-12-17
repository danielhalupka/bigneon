const webpack = require("webpack");
const paths = require("./paths");
process.env.NODE_ENV = "production";
module.exports = {
	entry: {
		"events.min": paths.appPublic + "/widgets/events.js"
	},
	target: "web",
	output: {
		path: paths.appBuild + "/widgets",
		filename: "[name].js"
	},
	amd: {
		jQuery: true
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|mjs)$/,
				include: paths.appPublic + "/widgets",
				loader: require.resolve("babel-loader"),
				options: {
					compact: true
				}
			}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			include: /\.min\.js$/,
			minimize: true
		})
	]
};