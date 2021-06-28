import React from "react";
function Son() {
  console.log("child render!");
  return <div>Son</div>;
}

function Parent(props) {
  const [count, setCount] = React.useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      count:{count}
      {props.children}
    </div>
  );
}

import React from "react";

function App() {
  return (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
      <hr />
    </div>
  );
}
export default App;
