import React, { useState } from "react";

import USERIMG from "./img/icon_12_copy@2x.png";
import "./index.css";

export default props => {
  let [isCopy, setIsCopy] = useState(false);
  let [isShowTip, setIsShowTip] = useState(false);

  function handleCopy() {
    !!props.copyText && copyToClipboard(props.copyText);
    setIsCopy(true);
  }

  function copyToClipboard(value) {
    const input = document.createElement("input");
    input.style.position = "absolute";
    input.style.left = "10000px";
    input.style.bottom = "10000px";
    input.value = value;
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.parentNode.removeChild(input);
  }

  return (
    <div
      style={{
        position: "absolute",
        display: "inline-block",
        lineHeight: "26px",
      }}
    >
      <img
        className="monitor-eye-detail__user-img"
        src={USERIMG}
        onClick={() => handleCopy()}
        onMouseLeave={() => {
          setIsCopy(false);
          setIsShowTip(false);
        }}
        onMouseEnter={() => setIsShowTip(true)}
      ></img>
      {isShowTip && (
        <div className="suspend">
          <span>
            {isCopy ? "复制成功" : !!props.copyTip ? props.copyTip : "点击复制"}
          </span>
        </div>
      )}
    </div>
  );
};
