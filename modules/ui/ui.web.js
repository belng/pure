let ReactDom = require("react-dom");

module.exports = (core) => {
	let App = require("./components/app")(core);
	ReactDom.render(<App />, document.getElementById("app-container"));
};
