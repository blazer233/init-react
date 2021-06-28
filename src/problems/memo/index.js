import React, { useMemo } from "react";
const Tree = ({ theme }) => {
  return useMemo(() => {
    console.log("useMemo中组件仅被渲染1次");
    return <span>{theme}</span>;
  }, [theme]);
};

function App() {
  const [istrue, setTrue] = React.useState(false);
  const [num, setCount] = React.useState(0);
  return (
    <div
      onClick={() => {
        setTrue(true);
        setCount(num + 1);
      }}
    >
      点击{num}
      <Tree theme={istrue} />
    </div>
  );
}
export default App;
