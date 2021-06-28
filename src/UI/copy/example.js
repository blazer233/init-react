import React from "react";
import CopyText from "./index";
import Input from "../input/index";

class App extends React.PureComponent {
  state = { copyText: "点击我,可以复制我,不信可以试试!!" };
  render() {
    let { copyText } = this.state;
    return (
      <>
        <span>{copyText}</span>
        <CopyText copyText={copyText} />
        <br />
        <h3>验证下</h3>
        <Input
          placeholder="在这里验证下复制的内容吧"
          width={600}
          rows={10}
          type="textarea"
          value={this.state.inputValue}
          onChange={val => this.setState({ inputValue: val })}
        />
      </>
    );
  }
}

export default App;
