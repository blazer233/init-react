// API
// columns为表格定义数据格式,title字段为表格标题,dataIndex为传入的数据源中需要显示的字段一致,可以通过render函数来渲染当前列的数据 -> Array// dataSource为数据源 -> Array
// onRowClick为单行点击事件 返回该行的数据
// checkTd:1 表示该单元格是可选单元格
import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import "./index.css";
class Table extends Component {
  constructor(props) {
    console.log(props);
    super(props);
  }

  state = {
    isCheckClass: "is-checked", // 选中后的样式变化
    checkBoxIdList: [],
    allCheckState: 0,
    tipStyleClass: { display: "none" },
    tipContent: "",
    positionParams: { x: -99999, y: -99999 },
    showPopover: false,
    dividLineOnMouseDown: false,
    mouseDownClientX: 0,
    widthList: [],
    showDividLine: false,
    dividLineIndex: null,
    oprShowBoxShadow: false,
    hasChildrenList: [], // 拥有孩子节点的父节点的id
    openChildrenList: [], // 存储当前需要展开的子行的父行id
  };

  // 属性默认值
  static defaultProps = {
    tableStyle: {},
    className: "",
    dataSource: [],
    columns: [],
    emptyText: "暂无数据",
    tbodyMinHeight: "230px",
    onRowClick: () => {},
    checkboxChange: () => {},
    checkBoxIdList: [],
    tdEmptyText: "-",
    tdWhiteSpace: false,
    classTableHeadName: "",
    isUserSelect: "none",
    childrenString: "children",
  };
  /**
   * 返回选中数据，计算行高
   */
  componentDidMount() {
    if (this.props.checkBoxIdList.length) {
      this.initData();
    }
    if (Array.isArray(this.props.columns) && this.props.columns.length) {
      this.initColWidth();
    }
  }

  /**
   * 重新计算选数据、行高
   */
  componentDidUpdate(prevProps) {
    if (prevProps.checkBoxIdList.length !== this.props.checkBoxIdList.length) {
      this.initData();
    }
    if (
      (prevProps.columns !== this.props.columns ||
        prevProps.columns.length !== this.props.columns.length) &&
      Array.isArray(this.props.columns) &&
      this.props.columns.length
    ) {
      this.initColWidth();
    }
    if (
      prevProps.dataSource.length !== this.props.dataSource.length ||
      _.differenceWith(prevProps.dataSource, this.props.dataSource, _.isEqual)
        .length
    ) {
      this.inithasChildrenList(this.props.dataSource);
    }
  }

  inithasChildrenList = (list = []) => {
    let { childrenString } = this.props;
    let idList = [];
    list.forEach(item => {
      if (_.isArray(item[childrenString]) && item[childrenString].length) {
        idList.push(item.id);
      }
    });
    this.setState({
      hasChildrenList: idList,
    });
  };

  initData = () => {
    this.setState({
      checkBoxIdList: this.props.checkBoxIdList || [],
    });
  };

  /**
   * 计算行高
   */
  initColWidth = () => {
    let defaultWidth = 70;
    let widthList = this.props.columns.reduce((prev, col) => {
      if (!!col.width) {
        if (typeof col.width === "string" && col.width.indexOf("px") !== -1) {
          let width = +col.width.slice(0, -2);
          if (typeof width === "number" && !isNaN(width)) {
            prev.push(width);
          } else {
            prev.push(defaultWidth);
          }
        } else if (typeof +col.width === "number") {
          prev.push(+col.width);
        } else {
          prev.push(defaultWidth);
        }
      } else {
        prev.push(defaultWidth);
      }

      return prev;
    }, []);

    this.setState({ widthList: widthList });
  };

  // 单元格变化事件
  selectboxChange = (e = window.event, data, checkId) => {
    let checkBoxIdList = [...this.props.checkBoxIdList];
    let index = checkBoxIdList.indexOf(checkId);

    if (index >= 0) {
      checkBoxIdList.splice(index, 1);
    } else {
      checkBoxIdList.push(checkId);
    }

    this.setState({
      checkBoxIdList: checkBoxIdList,
      allCheckState: checkBoxIdList.length === this.props.dataSource.length,
    });

    this.props.checkboxChange(checkBoxIdList);

    // 阻止事件冒泡
    e.stopPropagation();
    e.preventDefault();
  };

  // 全选单元格事件
  selectAllChange = e => {
    let checkBoxIdList = [];
    let allCheckState = 0;

    if (this.state.allCheckState == 0) {
      let dataKey = "";
      for (let i = 0; i < this.props.columns.length; i++) {
        let checkTd = this.props.columns[i].checkTd
          ? this.props.columns[i].checkTd
          : 0;
        if (checkTd == 1) {
          dataKey = this.props.columns[i].dataIndex;
          break;
        }
      }
      if (dataKey != "") {
        for (let i = 0; i < this.props.dataSource.length; i++) {
          let id = this.props.dataSource[i][dataKey];
          checkBoxIdList.push(id);
        }
      }
      allCheckState = 1;
    }

    this.setState({
      checkBoxIdList: checkBoxIdList,
      allCheckState: allCheckState,
    });

    this.props.checkboxChange(checkBoxIdList);

    // 阻止事件冒泡
    var e = e || window.event;
    e.stopPropagation();
    e.preventDefault();
  };

  // 单元格tip渲染
  showTdTip = (e, showState, content, contentNullState) => {
    if (contentNullState === 1) return;

    let styleClass = {
      position: "absolute",
      top: e.target.offsetTop + 10,
      left: e.target.offsetLeft,
      background: "#262626",
      color: "#fff",
      display: "block",
      padding: "8px",
      borderRadius: "3px",
    };

    this.setState({
      tipStyleClass: styleClass,
      tipContent: content,
    });
  };

  hideTdTip = e => {
    let styleClass = {
      display: "none",
    };

    this.setState({
      tipStyleClass: styleClass,
      tipContent: "",
    });
  };

  getTdClassName = (tdWhiteSpace, fiexd) => {
    let classNames = "";
    if (tdWhiteSpace) {
      classNames += "tdWhiteSpace ";
    }
    if (fiexd && this.state.oprShowBoxShadow) {
      classNames += "fiexdTdClass";
    }
    return classNames;
  };

  // 表体渲染(tbody)
  retRows = (columns, data, index, isLastNoOp, length) => {
    let tdEmptyText = this.props.tdEmptyText;
    let { widthList } = this.state;
    return columns.map((col, i) => {
      // 是否是可选单元格
      let checkTd = col.checkTd ? col.checkTd : 0;

      // 可选单元格渲染
      if (checkTd == 1 && this.props.showCheck) {
        return (
          <td className="checkInput" key={i} width={widthList[i]}>
            <span className="cell">
              <label
                className={
                  this.state.checkBoxIdList.indexOf(data[col.dataIndex]) >= 0
                    ? "el-checkbox " + this.state.isCheckClass
                    : "el-checkbox"
                }
              >
                <span
                  className={
                    this.state.checkBoxIdList.indexOf(data[col.dataIndex]) >= 0
                      ? "el-checkbox__input " + this.state.isCheckClass
                      : "el-checkbox__input"
                  }
                  onClick={e =>
                    this.selectboxChange(e, col, data[col.dataIndex])
                  }
                >
                  <span className="el-checkbox__inner"></span>
                  <input
                    type="checkbox"
                    className="el-checkbox__original"
                    value=""
                  />
                </span>
              </label>
            </span>
          </td>
        );
      }

      // 非选中单元格渲染 className={row.fiexd ? "fiexdClass" : ""} {this.props.tdWhiteSpace && col.fiexd ? 'tdWhiteSpace':''}
      if (checkTd === 0) {
        if (col.dataIndex !== undefined) {
          if (data[col.dataIndex] !== undefined) {
            let showVal = data[col.dataIndex];
            let contentNullState = 0;
            if (
              typeof data[col.dataIndex] === "object" ||
              typeof data[col.dataIndex] === "array"
            ) {
              showVal = JSON.stringify(data[col.dataIndex]);
            }
            if (showVal === "" || showVal === "null" || showVal === null) {
              contentNullState = 1;
              showVal = tdEmptyText;
            }
            return (
              <td
                onMouseLeave={e => {
                  col.showTip && this.hideTdTip(e, col.showTip, showVal);
                }}
                onMouseEnter={e => {
                  col.showTip &&
                    this.showTdTip(e, col.showTip, showVal, contentNullState);
                }}
                className={this.getTdClassName(
                  this.props.tdWhiteSpace,
                  col.fiexd
                )}
                onClick={() => {
                  col.getCellClick && col.getCellClick(this, col, data);
                }}
                key={i}
                width={widthList[i]}
              >
                <div
                  className={
                    col.showTip
                      ? "tdContent tdContentTip "
                      : "tdContent " +
                        (col.checkChildren && !!data.customClass
                          ? data.customClass
                          : "")
                  }
                  onMouseLeave={() => {
                    if (!col.showTip) return;
                    this.setState({
                      showPopover: false,
                    });
                  }}
                  onMouseEnter={e => {
                    if (!col.showTip) return;
                    this.setState({
                      showPopover: true,
                      positionParams: {
                        x: e.clientX,
                        y: e.clientY,
                      },
                    });
                  }}
                >
                  {col.checkChildren && (
                    <span
                      className={
                        this.state.openChildrenList.some(i => i === data.id)
                          ? "sdw-table__td-has-children is-open"
                          : this.state.hasChildrenList.some(i => i === data.id)
                          ? "sdw-table__td-has-children"
                          : "no-children"
                      }
                      onClick={() => this.handCheckChildren(data)}
                    ></span>
                  )}
                  {col.render ? col.render(showVal, data, index) : showVal}
                  {col.tip ? col.tip(showVal, data, index) : ""}
                </div>
              </td>
            );
          } else {
            return (
              <td
                className={this.getTdClassName(
                  this.props.tdWhiteSpace,
                  col.fiexd
                )}
                onClick={() => {
                  col.getCellClick && col.getCellClick(this, col, data);
                }}
                key={i}
                width={widthList[i]}
              >
                {tdEmptyText}
              </td>
            );
          }
        } else {
          // 自定义 render 函数渲染
          let renderEle = "";
          if (col.render) {
            renderEle = col.render(data, index);
            if (isLastNoOp && index === length - 1) {
              renderEle = "";
            }
          }

          // 自定义 tip 函数渲染
          let renderTip = "";
          if (col.tip) {
            renderTip = col.tip(data, index);
          }
          return (
            <td
              className={this.getTdClassName(
                this.props.tdWhiteSpace,
                col.fiexd
              )}
              key={i}
              width={widthList[i]}
            >
              <span
                onMouseLeave={() => {
                  if (!col.tip) return;
                  this.setState({
                    showPopover: false,
                  });
                }}
                onMouseEnter={e => {
                  if (!col.tip) return;
                  this.setState({
                    tipContent: renderTip,
                    showPopover: true,
                    positionParams: {
                      x: e.clientX,
                      y: e.clientY,
                    },
                  });
                }}
              >
                {col.render && renderEle}
              </span>
            </td>
          );
        }
      }
    });
  };

  handCheckChildren = data => {
    let curArr = [...this.state.openChildrenList];
    let pID = data.id;
    let flagIndex = curArr.findIndex(i => i === pID);

    if (flagIndex === -1) {
      curArr.push(pID);
    } else {
      curArr.splice(flagIndex, 1);
    }

    this.setState({
      openChildrenList: curArr,
    });
  };

  // 表体空内容的展示
  retEmptyText = emptyText => {
    return (
      <div className="emptyTextClass">
        <span className="text">{emptyText}</span>
      </div>
    );
  };

  // 行点击事件 如果存在则触发该事件
  trClick = (data, event) => {
    this.props.onRowClick(data, event);
    var e = e || window.event;
    e.stopPropagation();
  };

  // 单元格点击事件
  tableTdClick = (data, event) => {
    this.props.tableTdClick(data, event);
    var e = e || window.event;
    e.stopPropagation();
  };

  onMouseDown = (e, k) => {
    this.setState({
      dividLineOnMouseDown: true,
      mouseDownClientX: e.clientX,
      dividLineIndex: k,
    });
  };

  getCurWidth = curWidth => {
    return curWidth < 80 ? 80 : curWidth;
  };

  onMouseUp = e => {
    let {
      dividLineIndex,
      mouseDownClientX,
      widthList,
      dividLineOnMouseDown,
    } = this.state;

    if (dividLineOnMouseDown) {
      let moveX = e.clientX - mouseDownClientX;
      let curWidthArr = [...widthList];
      curWidthArr[dividLineIndex - 1] = this.getCurWidth(
        +curWidthArr[dividLineIndex - 1] + moveX
      );
      curWidthArr[dividLineIndex] = this.getCurWidth(
        +curWidthArr[dividLineIndex] - moveX
      );

      this.setState({
        widthList: curWidthArr,
        dividLineOnMouseDown: false,
        oprShowBoxShadow: true,
      });
    }
  };

  render() {
    const {
      className,
      classTableHeadName,
      columns,
      dataSource,
      emptyText,
      isLastNoOp,
      tableStyle,
      tbodyMinHeight,
      tbodyHeight,
      childrenString,
    } = this.props;

    let { tipContent, widthList, showDividLine, openChildrenList } = this.state;

    let curDataSource = _.cloneDeep(dataSource);
    let newDataSource = curDataSource.reduce((prev, item) => {
      prev.push(item);

      let childList = _.cloneDeep(item[childrenString]);
      if (openChildrenList.includes(item.id) && childList && childList.length) {
        childList = childList.map(i => {
          return _.assign({}, i, {
            customClass: "children",
          });
        });
        prev = prev.concat(childList);
      }

      return prev;
    }, []);

    return (
      <div className={`table-box ${className}`}>
        <table className="table-box-table" style={{ ...tableStyle }}>
          {/* 表头部分 */}
          <thead className={`table-box-table-thead ${classTableHeadName}`}>
            <tr
              className="sdw-table__tr"
              onMouseEnter={() => this.setState({ showDividLine: true })}
              onMouseLeave={() => this.setState({ showDividLine: false })}
              onMouseUp={e => this.onMouseUp(e)}
            >
              {columns.map((row, k) => {
                let checkTd = row.checkTd ? row.checkTd : 0;
                if (checkTd == 1 && this.props.showCheck) {
                  // 选择类型表头
                  return (
                    <th
                      className="checkInput selectButton"
                      key={k}
                      width={widthList[k]}
                      style={{ userSelect: this.props.isUserSelect }}
                    >
                      <span className="cell">
                        <label
                          className={
                            this.state.allCheckState == 1
                              ? "el-checkbox " + this.state.isCheckClass
                              : "el-checkbox"
                          }
                        >
                          <span
                            className={
                              this.state.allCheckState == 1
                                ? "el-checkbox__input " +
                                  this.state.isCheckClass
                                : "el-checkbox__input"
                            }
                            onClick={e => this.selectAllChange(e)}
                          >
                            <span className="el-checkbox__inner"></span>
                            <input
                              type="checkbox"
                              className="el-checkbox__original"
                              value=""
                            />
                          </span>
                        </label>
                      </span>
                    </th>
                  );
                }

                // 普通表头
                if (checkTd == 0) {
                  return (
                    <th
                      className={
                        row.fiexd && this.state.oprShowBoxShadow
                          ? "fiexdClass"
                          : ""
                      }
                      key={k}
                      width={widthList[k]}
                      style={{
                        position: "relative",
                        userSelect: this.props.isUserSelect,
                      }}
                    >
                      {row.title}
                      {showDividLine &&
                        k !== 0 &&
                        !row.fiexd &&
                        ((columns[0].checkTd === 1 && k !== 1) ||
                          columns[0].checkTd !== 1) && (
                          <span
                            className="sdw__table-th-dividing-line"
                            onMouseDown={e => this.onMouseDown(e, k)}
                          />
                        )}
                    </th>
                  );
                }
              })}
            </tr>
          </thead>

          {/* 表体部分 */}
          <tbody
            className="sdw-table__tbody"
            style={{
              minHeight: tbodyMinHeight,
              height: tbodyHeight,
              position: "relative",
            }}
          >
            {newDataSource &&
              newDataSource.map((data, i) => {
                return (
                  <tr
                    className="sdw-table__tr"
                    key={i}
                    onClick={this.trClick.bind(this, data)}
                  >
                    {this.retRows(
                      columns,
                      data,
                      i,
                      isLastNoOp,
                      newDataSource.length
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
        {/* 表体空内容展示 */}
        {newDataSource &&
          newDataSource.length == 0 &&
          this.retEmptyText(emptyText)}
      </div>
    );
  }
}

Table.propTypes = {
  columns: PropTypes.array.isRequired, //表头名称
  dataSource: PropTypes.array.isRequired, //数据列表
  emptyText: PropTypes.string, //列表为空时， 空内容展示的html
  isLastNoOp: PropTypes.bool, //表格最后一行不需要渲染操作样式
  className: PropTypes.string, //表格的自定义的样式名,
  classTableHeadName: PropTypes.string, // 表格的表头的自定义样式名
  tableStyle: PropTypes.object,
  tbodyMinHeight: PropTypes.string,
  tbodyHeight: PropTypes.string,
  showCheck: PropTypes.bool, // 是否展示选中单元格
  checkBoxIdList: PropTypes.array, // 选中的单元格数据
  tdEmptyText: PropTypes.string, // 表格缺省值
  tdWhiteSpace: PropTypes.bool, // 单元格的内容是否需要一行展示
  isUserSelect: PropTypes.string,
  childrenString: PropTypes.string, // 子节点对应的字段，默认为 children
};

export default Table;
