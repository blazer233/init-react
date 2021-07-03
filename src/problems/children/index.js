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

export default Parent;
