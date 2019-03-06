import React from "react";
import ReactDOM from "react-dom";

import Routes from "./components/routes/Routes";
import Bigneon from "./helpers/bigneon";
import analytics from "./helpers/analytics";
import errorReporting from "./helpers/errorReporting";

console.debug("BigNeon Version: ", REACT_APP_VERSION);

Bigneon({}, {});
analytics.init();
errorReporting.init();

ReactDOM.render(<Routes/>, document.querySelector("#root"));
