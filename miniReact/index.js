import React from "./mini/index.js";
const updateValue = (e) => rerender(e.target.value);
const rerender = (value = "World") => {
  const element = React.createElement(
    "div",
    null,
    React.createElement("input", {
      onInput: updateValue,
      value: value,
    }),
    React.createElement("h2", null, "Hello ", value),
    React.createElement("hr", null)
  );
  React.render(element, document.getElementById("root"));
};

rerender();
