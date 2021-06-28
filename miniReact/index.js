import React from "./mini/index.js";
const updateValue = e => rerender(e.target.value);
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

/**
 * https://mp.weixin.qq.com/s/wGSUdQJxOiyPTRbrBBs1Zg
 * https://react.iamkasong.com/preparation/idea.html#cpu%E7%9A%84%E7%93%B6%E9%A2%88
 * https://react.docschina.org/
 */