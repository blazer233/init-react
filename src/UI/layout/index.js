import React from "react";
import "./index.css";

const ROW = ({ gutter, justigy, marginTop, marginBottom, children }) => {
  Layout.customObj.gutter = gutter;
  return (
    <div
      className="sdw__row-wrap"
      style={{
        display: "flex",
        justifyContent: justigy || "flex-start",
        boxSizing: "border-box",
        marginTop,
        marginBottom,
      }}
    >
      {children}
    </div>
  );
};

const COL = ({ span, children }) => (
  <div
    className="sdw__col-wrap"
    style={{
      display: "inline-block",
      boxSizing: "border-box",
      width: `${(span / 24) * 100}%`,
      margin: `0 ${Layout.customObj.gutter / 2}px`,
    }}
  >
    {children}
  </div>
);

const Layout = ({ children }) => <div>{children}</div>;
Layout.Row = ROW;
Layout.Col = COL;
Layout.customObj = {};

export default Layout;
