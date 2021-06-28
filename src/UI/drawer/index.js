import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.css";

const DrawerBody = ({ children }) => children;

class SdwDrawer extends Component {
  state = {
    isHide: false,
    isShowWin: false,
  };

  componentDidMount() {
    this.setState({
      isShowWin: this.props.visible,
    });
  }

  componentDidUpdate(prevProps, prevStates) {
    if (prevProps.visible !== this.props.visible) {
      if (!this.props.visible) {
        this.hanldeClick();
      } else {
        this.setState({
          isShowWin: this.props.visible,
        });
      }
    }
  }

  hanldeClick = () => {
    this.setState({
      isHide: true,
    });

    setTimeout(() => {
      this.setState({
        isHide: false,
        isShowWin: false,
      });
    }, 150);
  };

  render() {
    let { isHide, isShowWin } = this.state;
    let contentClassName = isHide ? "is_hide_win" : "";
    return ReactDOM.createPortal(
      isShowWin && (
        <div className={`sdw-drawer__wrap ${contentClassName}`}>
          <div
            className="sdw-drawer__left-wrap"
            onClick={this.props.onCancelClick}
          ></div>
          <div className={`sdw-drawer__content-wrap ${contentClassName}`}>
            <div className="sdw-drawer__content-header">
              <span>{this.props.title}</span>
              <span
                className="sdw-drawer__content-header-cancel-img"
                onClick={this.props.onIconClick}
              ></span>
            </div>
            <div className="sdw-drawer__content-body">
              <DrawerBody>{this.props.children}</DrawerBody>
            </div>
            <div className="sdw-drawer__content-footer">
              {!this.props.hideCancelButton && (
                <button
                  className="sdw-drawer__content-footer-button--cancel"
                  onClick={this.props.onCancelClick}
                >
                  {this.props.cancelText || "取 消"}
                </button>
              )}
              {!this.props.hideSureButton && (
                <button
                  className="sdw-drawer__content-footer-button--primary"
                  onClick={this.props.onSureClick}
                >
                  {this.props.sureText || "确 定"}
                </button>
              )}
            </div>
          </div>
        </div>
      ),
      document.body
    );
  }
}

SdwDrawer.Body = DrawerBody;

export default SdwDrawer;
