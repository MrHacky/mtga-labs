import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./app";

let div = document.createElement("div");
document.body.style.margin = "0";
document.body.appendChild(div);
ReactDOM.render(<App />, div);