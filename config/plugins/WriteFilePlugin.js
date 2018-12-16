const fs = require("fs");
function WriteFilePlugin(options) {
	// Setup the plugin instance with options...
	this.content = options.content || "";
	if (!options.path) {
		throw new Error("Specify a path");
	}
	this.path = options.path;

}

WriteFilePlugin.prototype.apply = function(compiler) {
	compiler.plugin("done", () => {
		fs.writeFileSync(this.path, this.content);
	});
};

module.exports = WriteFilePlugin;