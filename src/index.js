import React from "react";
import ReactDOM from "react-dom";

import Routes from "./components/routes/Routes";
import Bigneon from "./helpers/bigneon";

console.debug("BigNeon Version: ", REACT_APP_VERSION);

Bigneon({}, {});

ReactDOM.render(<Routes />, document.querySelector("#root"));
