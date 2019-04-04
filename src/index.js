import React from "react";
import ReactDOM from "react-dom";

import Routes from "./components/routes/Routes";
import Bigneon from "./helpers/bigneon";
import analytics from "./helpers/analytics";
import errorReporting from "./helpers/errorReporting";

window.bigneonVersion = REACT_APP_VERSION;
console.debug("BigNeon Version: ", REACT_APP_VERSION);

//Upload widget for cloudinary (Can be removed when we switch to S3)
insertScript("//widget.cloudinary.com/global/all.js", "cloudinary-js");
insertScript("https://js.stripe.com/v3/", "stripe-js");

function insertScript(url, id) {
	const script = document.createElement("script");

	if (id) {
		script.id = id;
	}

	script.async = true;
	script.crossorigin = true;
	script.src = url;
	document.body.appendChild(script);
}

Bigneon({}, {});
analytics.init();
errorReporting.init();

ReactDOM.render(<Routes/>, document.querySelector("#root"));
