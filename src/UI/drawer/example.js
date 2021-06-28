import React, { useState } from "react";
import Drawer from "./index";

export default () => {
  let [visible, setVisible] = useState(false);
  return (
    <>
      <span onClick={() => setVisible(true)}>点我打开抽屉</span>
      <Drawer
        title="我是标题"
        visible={visible}
        onIconClick={() => setVisible(false)}
        onCancelClick={() => setVisible(false)}
        onSureClick={() => setVisible(false)}
      >
        <Drawer.Body>
          <div>这里可以自定义内容</div>
        </Drawer.Body>
      </Drawer>
    </>
  );
};
