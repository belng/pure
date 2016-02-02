import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Hello from "./components/views/Hello";

document.addEventListener("readystatechange", () => {
	if (document.readyState === "complete") {
		ReactDOM.render(<Hello />, document.getElementById("root"));
	}
});
