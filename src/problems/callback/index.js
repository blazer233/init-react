import React, { useCallback, useState, useEffect } from "react";

/* 用react.memo */
const DemoChildren = React.memo(props => {
  /* 只有初始化的时候打印了 子组件更新 */
  console.log("子组件更新");
  useEffect(() => props.getInfo("子组件"), []);
  return <div>子组件</div>;
});

const DemoUseCallback = ({ id }) => {
  const [number, setNumber] = useState(1);
  /* 此时usecallback的第一参数 (sonName)=>{ console.log(sonName) }
    经过处理赋值给 getInfo */
  const getInfo = useCallback(sonName => console.log(sonName), [id]);
  return (
    <div>
      {/* 点击按钮触发父组件更新 ，但是子组件没有更新 */}
      <button onClick={() => setNumber(number + 1)}>增加</button>
      <DemoChildren getInfo={getInfo} />
    </div>
  );
};
export default DemoUseCallback;
