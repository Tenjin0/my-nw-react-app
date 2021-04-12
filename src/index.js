import React from "react"
import ReactDOM from "react-dom"

import App from "./App.js"

ReactDOM.render(<App />, document.getElementById("root"))

console.log("start")
console.log(module.hot)
if (module.hot) {
    module.hot.accept()
}
