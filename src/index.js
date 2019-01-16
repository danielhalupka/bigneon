import React from "react";
import ReactDOM from "react-dom";

import Routes from "./components/routes/Routes";
import Bigneon from "./helpers/bigneon";
import analytics from "./helpers/analytics";

console.debug("BigNeon Version: ", REACT_APP_VERSION);

const { REACT_APP_GOOGLE_ANALYTICS_KEY, REACT_APP_SEGMENT_KEY } = process.env;

Bigneon({}, {});

analytics.init({
	ga: REACT_APP_GOOGLE_ANALYTICS_KEY,
	segment: REACT_APP_SEGMENT_KEY
});

ReactDOM.render(<Routes />, document.querySelector("#root"));
