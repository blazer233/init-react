import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import ChildrenProblems from "./problems/children";
import MemoProblems from "./problems/memo";
import CallbackProblems from "./problems/callback";
import UseCloneElement from "./problems/cloneElement";
import TableApp from "./UI/table/example";
import CopyApp from "./UI/copy/example";
import LayoutApp from "./UI/layout/example";
import DrawerApp from "./UI/drawer/example";
//unstable_createRoot
ReactDOM.render(
  <React.StrictMode>
    {/**将子组件以props.children代替解决父组件变化子组件渲染问题 */}
    {/* <ChildrenProblems /> */}
    <hr />
    {/**将子组件放到useMemo中解决父组件变化子组件渲染问题 */}
    {/* <MemoProblems /> */}
    <hr />
    {/* <UseCloneElement /> */}
    <hr />
    <CallbackProblems />
    <hr />
    {/* <CopyApp /> */}
    <hr />
    {/* <TableApp /> */}
    <hr />
    {/* <LayoutApp /> */}
    <hr />
    {/* <DrawerApp />  */}
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
