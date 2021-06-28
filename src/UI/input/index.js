import React, { Component } from "react";
import PropTypes from "prop-types";

import "./index.css";

class SdwInput extends Component {
  inputRef = React.createRef();

  static defaultProps = {
    width: null,
    height: 40,
    rows: 3,
    cols: 28,
    placeholder: "请输入",
    clearable: true,
    value: "",
    label: "",
    type: "text",
    disabled: false,
    sholdCheckValidate: false,
    multipleValue: [],
    multipleOption: [],
  };

  state = {
    isValidatePass: true,
    validateText: "",
    showClearIcon: false,
    isOnFocus: false,
    hideSearchField: true,
    searchValue: "",
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.sholdCheckValidate !== this.props.sholdCheckValidate ||
      prevProps.multipleValue !== this.props.multipleValue
    ) {
      this.validate(this.props.value);
    }
  }

  handleChange = e => {
    if (this.props.disabled) return;
    let value = e.target.value;

    if (typeof this.props.onChange === "function") {
      this.props.onChange(value);
    }

    if (!this.state.isValidatePass) {
      this.validate(value);
    }

    if (!value.length) {
      this.validate("");
    }
  };

  handleBlur = e => {
    this.validate(e.target.value);

    if (typeof this.props.onBlur === "function") {
      this.props.onBlur(e.target.value);
    }
  };

  handleClearInput = e => {
    e.preventDefault();

    if (typeof this.props.onChange === "function") {
      this.props.onChange("");
    }

    this.validate("");
    this.inputRef.current.focus();
  };

  handleKeyDown = record => {
    if (
      record.keyCode === 13 &&
      typeof this.props.onEnterKeyDown === "function"
    ) {
      this.props.onEnterKeyDown();
      this.inputRef.current.blur();
    }
  };

  validate = value => {
    if (this.props.isMultipleChoice) {
      value = this.props.multipleValue;
    }

    // 如果没有传入valiateFun进行校验，直接跳过
    if (typeof this.props.validateFun !== "function") {
      return;
    }

    let res = this.props.validateFun(value);

    // validateFun只有返回true，才会校验通过
    if (res === true) {
      this.setState({
        isValidatePass: res,
        validateText: "",
      });
    } else {
      this.setState({
        isValidatePass: false,
        validateText: res,
      });
    }
  };

  onChangeMultipleValue = (obj, type) => {
    let { multipleValue } = this.props;
    let list = [...multipleValue].filter(i => !!i);

    this.setState({
      searchValue: "",
    });

    if (!type || !obj || typeof this.props.changeMultipleValue !== "function")
      return;

    if (type === "add" && multipleValue.indexOf(obj.value) === -1) {
      list.push(obj.value);
    }

    if (type === "del" && multipleValue.indexOf(obj.value) !== -1) {
      let index = list.findIndex(i => i === obj.value);
      list.splice(index, 1);
    }

    this.props.changeMultipleValue(list);
  };

  render() {
    let {
      value,
      type,
      placeholder,
      disabled,
      width,
      height,
      rows,
      cols,
      label,
      clearable,
      isMultipleChoice,
      multipleValue,
      multipleOption,
    } = this.props;

    let {
      isValidatePass,
      validateText,
      showClearIcon,
      isOnFocus,
      hideSearchField,
      searchValue,
    } = this.state;

    let textareaClassName = isValidatePass
      ? "sdw-textarea-input__wrap"
      : "sdw-textarea-input__wrap sdw-error-input";
    let inputClassName = isValidatePass
      ? "sdw-input__wrap"
      : "sdw-input__wrap sdw-error-input";

    let filterSearchFieldsArr = [];
    let selectedFields = [];
    if (isMultipleChoice) {
      filterSearchFieldsArr = multipleOption.filter(
        i =>
          i.name.indexOf(searchValue) !== -1 && !multipleValue.includes(i.value)
      );
      selectedFields = multipleOption.filter(i =>
        multipleValue.some(j => j === i.value)
      );
    }

    return (
      <span
        className={
          isOnFocus
            ? "sdw-input__on-focus"
            : isValidatePass
            ? ""
            : "sdw-error-input__wrap"
        }
      >
        {!!label && <span className="operation-label-title">{label}</span>}
        <div
          onMouseEnter={() => this.setState({ showClearIcon: true })}
          onMouseLeave={() => this.setState({ showClearIcon: false })}
          className="sdw-input__div-wrap"
          style={{ width: width === null ? "80%" : width }}
        >
          {type === "textarea" ? (
            <textarea
              ref={this.inputRef}
              rows={rows}
              cols={cols}
              value={value}
              style={{
                width: "100%",
              }}
              disabled={disabled}
              placeholder={placeholder}
              className={textareaClassName}
              onChange={e => this.handleChange(e)}
              onFocus={() => this.setState({ isOnFocus: true })}
              onBlur={e => {
                this.handleBlur(e);
                this.setState({ isOnFocus: false });
              }}
            />
          ) : isMultipleChoice ? (
            <span
              className={
                isValidatePass
                  ? "sdw-nultiple-input-wrap"
                  : "sdw-nultiple-input-wrap sdw-error-input"
              }
            >
              {selectedFields.map(item => (
                <span key={item.value} className="sdw-input-tags tag">
                  {item.name}
                  <i
                    className="sdw-input-tags__clear-icon"
                    onClick={() => this.onChangeMultipleValue(item, "del")}
                  />
                </span>
              ))}
              <input
                ref={this.inputRef}
                value={searchValue}
                type={type}
                disabled={disabled}
                placeholder={placeholder}
                style={{
                  width: 200,
                  height,
                  marginLeft: 16,
                }}
                className="sdw-input-tags search-input"
                onKeyDown={v => this.handleKeyDown(v)}
                onChange={e =>
                  this.setState({
                    searchValue: e.target.value,
                    hideSearchField: !e.target.value,
                  })
                }
                onFocus={() => {
                  this.setState({ isOnFocus: true });

                  if (typeof this.props.onFocus === "function") {
                    this.props.onFocus();
                  }
                }}
                onBlur={e => {
                  this.handleBlur(e);
                  this.setState({ isOnFocus: false });
                }}
              />
              {Array.isArray(filterSearchFieldsArr) &&
                !!filterSearchFieldsArr.length &&
                !hideSearchField && (
                  <div className="sdw-input__multiple-choice-div-wrap">
                    {filterSearchFieldsArr.map((item, index) => (
                      <div
                        key={index}
                        title={item.name}
                        className="ellipsis sdw-input__multiple-choice-item"
                        onClick={() => {
                          this.onChangeMultipleValue(item, "add");
                          this.setState({
                            hideSearchField: true,
                          });
                        }}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                )}
            </span>
          ) : (
            <input
              ref={this.inputRef}
              value={value}
              type={type}
              disabled={disabled}
              placeholder={placeholder}
              style={{
                width: "100%",
                height,
              }}
              className={inputClassName}
              onKeyDown={v => this.handleKeyDown(v)}
              onChange={e => this.handleChange(e)}
              onFocus={() => {
                this.setState({ isOnFocus: true });

                if (typeof this.props.onFocus === "function") {
                  this.props.onFocus();
                }
              }}
              onBlur={e => {
                this.handleBlur(e);
                this.setState({ isOnFocus: false });
              }}
            />
          )}
          {!isMultipleChoice &&
            !disabled &&
            clearable &&
            showClearIcon &&
            !!value && (
              <i
                className="sdw-input-clearable"
                onClick={this.handleClearInput}
              ></i>
            )}
          {!isValidatePass && (
            <div className="sdw-error-input__tip">{validateText}</div>
          )}
        </div>
      </span>
    );
  }
}

SdwInput.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.string,
  clearable: PropTypes.bool,
  value: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  cols: PropTypes.number,
  onChange: PropTypes.func,
  validateFun: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onEnterKeyDown: PropTypes.func, // 按下enter键触发的事件
  sholdCheckValidate: PropTypes.bool, // true: 手动触发必填项的检查
  isMultipleChoice: PropTypes.bool, // true: 支持'多选'
  multipleValue: PropTypes.array, // 多选绑定的数组value
  multipleOption: PropTypes.array, // 多选绑定的数组候选项
  changeMultipleValue: PropTypes.func, // 改变multipleValue函数
};

export default SdwInput;
