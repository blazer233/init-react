import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

export default class Popover extends React.Component {
  render() {
    let { tipString, position } = this.props;

    let clientX = position.x || -99999;
    let clientY = position.y || -99999;

    return ReactDOM.createPortal(
      !!tipString && (
        <div
          style={{
            left: `${clientX}px`,
            top: `${clientY - 20}px`,
          }}
          className="sdw-popover__wrap"
        >
          <span>{tipString}</span>
        </div>
      ),
      document.body
    );
  }
}
