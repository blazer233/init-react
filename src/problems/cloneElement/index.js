import React from "react";
function FatherComponent({ children }) {
  const newChildren = React.cloneElement(children, { age: 18 });
  return <div> {newChildren} </div>;
}

function SonComponent(props) {
  console.error(props);
  return <div>hello,world</div>;
}

class Index extends React.Component {
  render() {
    return (
      <div className="box">
        <FatherComponent>
          <SonComponent name="alien" />
        </FatherComponent>
      </div>
    );
  }
}
export default Index;
