import React, { useState, useEffect } from "react";
import "./index.css";
import { Deepclone } from "./config";
const isCheckClass = "is-checked";

const App = ({
  tableStyle = {},
  className = "",
  dataSource = [],
  columns = [],
  emptyText = "暂无数据",
  tbodyMinHeight = "230px",
  onRowClick = () => {},
  checkboxChange = () => {},
  checkBoxIdList: checkIdList = [],
  tdEmptyText = "-",
  tdWhiteSpace = false,
  classTableHeadName = "",
  isUserSelect = "none",
  childrenString = "children",
  showCheck = false,
  tbodyHeight = "",
  isLastNoOp = "",
}) => {
  let [checkBoxIdList, setList] = useState([]);
  let [allCheckState, setCheck] = useState(0);
  let [dividLineOnMouseDown, setLine] = useState(false);
  let [mouseDownClientX, setClientX] = useState(0);
  let [widthList, setWL] = useState([]);
  let [showDividLine, setSD] = useState(false);
  let [dividLineIndex, setDL] = useState(null);
  let [oprShowBoxShadow, setSB] = useState(false);
  let [hasChildrenList, setHC] = useState([]);
  let [openChildrenList, setOC] = useState([]);
  useEffect(() => initData(), [checkBoxIdList.length]);
  useEffect(() => initColWidth(), [columns.length]);
  useEffect(() => inithasChildrenList(dataSource), [dataSource.length]);
  let initData = () => setList(checkIdList);
  let initColWidth = () => {
    let defaultWidth = 70;
    let widthList = columns.reduce((prev, col) => {
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
    setWL(widthList);
  };
  let inithasChildrenList = list => {
    let idList = [];
    list.forEach(item => {
      if (Array.isArray(item[childrenString]) && item[childrenString].length) {
        idList.push(item.id);
      }
    });
    setHC(idList);
  };
  // 全选单元格事件
  let selectAllChange = (e = window.event) => {
    let checkBoxIdList = [];
    let allCheckState = 0;
    if (allCheckState == 0) {
      let dataKey = "";
      for (let i = 0; i < columns.length; i++) {
        let checkTd = columns[i].checkTd ? columns[i].checkTd : 0;
        if (checkTd == 1) {
          dataKey = columns[i].dataIndex;
          break;
        }
      }
      if (dataKey != "") {
        for (let i = 0; i < dataSource.length; i++) {
          let id = dataSource[i][dataKey];
          checkBoxIdList.push(id);
        }
      }
      allCheckState = 1;
    }
    setList(checkBoxIdList);
    setCheck(allCheckState);
    checkboxChange(checkBoxIdList);
    e.stopPropagation();
    e.preventDefault();
  };
  // 单元格tip渲染
  let showTdTip = (e, showState, content, contentNullState) => {
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
  };
  let hideTdTip = () => {};
  // 行点击事件 如果存在则触发该事件
  let trClick = (data, event) => {
    onRowClick(data, event);
    var e = e || window.event;
    e.stopPropagation();
  };
  // 单元格点击事件
  let tableTdClick = (data, event) => {
    tableTdClick(data, event);
    var e = e || window.event;
    e.stopPropagation();
  };

  let onMouseDown = (e, k) => {
    setLine(true);
    setClientX(e.clientX);
    setDL(k);
  };

  let getCurWidth = curWidth => {
    return curWidth < 80 ? 80 : curWidth;
  };

  let onMouseUp = e => {
    if (dividLineOnMouseDown) {
      let moveX = e.clientX - mouseDownClientX;
      let curWidthArr = [...widthList];
      curWidthArr[dividLineIndex - 1] = getCurWidth(
        +curWidthArr[dividLineIndex - 1] + moveX
      );
      curWidthArr[dividLineIndex] = getCurWidth(
        +curWidthArr[dividLineIndex] - moveX
      );
      setWL(curWidthArr);
      setLine(false);
      setSB(true);
    }
  };
  let getTdClassName = (tdWhiteSpace, fiexd) => {
    let classNames = "";
    if (tdWhiteSpace) {
      classNames += "tdWhiteSpace ";
    }
    if (fiexd && oprShowBoxShadow) {
      classNames += "fiexdTdClass";
    }
    return classNames;
  };
  let handCheckChildren = data => {
    let curArr = [...openChildrenList];
    let pID = data.id;
    let flagIndex = curArr.findIndex(i => i === pID);
    if (flagIndex === -1) {
      curArr.push(pID);
    } else {
      curArr.splice(flagIndex, 1);
    }
    setOC(curArr);
  };
  // 表体渲染(tbody)
  let retRows = (columns, data, index, isLastNoOp, length) => {
    return columns.map((col, i) => {
      // 是否是可选单元格
      let checkTd = col.checkTd ? col.checkTd : 0;
      // 可选单元格渲染
      if (checkTd == 1 && showCheck) {
        return (
          <td className="checkInput" key={i} width={widthList[i]}>
            <span className="cell">
              <label
                className={
                  checkBoxIdList.indexOf(data[col.dataIndex]) >= 0
                    ? "el-checkbox " + isCheckClass
                    : "el-checkbox"
                }
              >
                <span
                  className={
                    checkBoxIdList.indexOf(data[col.dataIndex]) >= 0
                      ? "el-checkbox__input " + isCheckClass
                      : "el-checkbox__input"
                  }
                  onClick={e => selectboxChange(e, col, data[col.dataIndex])}
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
      // 非选中单元格渲染 className={row.fiexd ? "fiexdClass" : ""} {tdWhiteSpace && col.fiexd ? 'tdWhiteSpace':''}
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
                onMouseLeave={e =>
                  col.showTip && hideTdTip(e, col.showTip, showVal)
                }
                onMouseEnter={e =>
                  col.showTip &&
                  showTdTip(e, col.showTip, showVal, contentNullState)
                }
                className={getTdClassName(tdWhiteSpace, col.fiexd)}
                onClick={() => {
                  col.getCellClick && col.getCellClick(col, data);
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
                  }}
                  onMouseEnter={e => {
                    if (!col.showTip) return;
                  }}
                >
                  {col.checkChildren && (
                    <span
                      className={
                        openChildrenList.some(i => i === data.id)
                          ? "sdw-table__td-has-children is-open"
                          : hasChildrenList.some(i => i === data.id)
                          ? "sdw-table__td-has-children"
                          : "no-children"
                      }
                      onClick={() => handCheckChildren(data)}
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
                className={getTdClassName(tdWhiteSpace, col.fiexd)}
                onClick={() => {
                  col.getCellClick && col.getCellClick(col, data);
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
              className={getTdClassName(tdWhiteSpace, col.fiexd)}
              key={i}
              width={widthList[i]}
            >
              <span
                onMouseLeave={() => {
                  if (!col.tip) return;
                }}
                onMouseEnter={e => {
                  if (!col.tip) return;
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
  // 单元格变化事件
  let selectboxChange = (e = window.event, data, checkId) => {
    let checkBoxIdList = [...checkBoxIdList];
    let index = checkBoxIdList.indexOf(checkId);
    if (index >= 0) {
      checkBoxIdList.splice(index, 1);
    } else {
      checkBoxIdList.push(checkId);
    }
    setList(checkBoxIdList);
    setCheck(checkBoxIdList.length == dataSource.length);
    checkboxChange(checkBoxIdList);
    e.stopPropagation();
    e.preventDefault();
  };
  // 表体空内容的展示
  let retEmptyText = emptyText => {
    return (
      <div className="emptyTextClass">
        <span className="text">{emptyText}</span>
      </div>
    );
  };
  let curDataSource = Deepclone(dataSource);
  let newDataSource = curDataSource.reduce((prev, item) => {
    prev.push(item);
    let childList = Deepclone(item[childrenString]);
    if (openChildrenList.includes(item.id) && childList && childList.length) {
      childList = childList.map(i => {
        return Object.assign({}, i, {
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
            onMouseEnter={() => setSD(true)}
            onMouseLeave={() => setSD(false)}
            onMouseUp={e => onMouseUp(e)}
          >
            {columns.map((row, k) => {
              let checkTd = row.checkTd ? row.checkTd : 0;
              if (checkTd == 1 && showCheck) {
                // 选择类型表头
                return (
                  <th
                    className="checkInput selectButton"
                    key={k}
                    width={widthList[k]}
                    style={{ userSelect: isUserSelect }}
                  >
                    <span className="cell">
                      <label
                        className={
                          allCheckState == 1
                            ? "el-checkbox " + isCheckClass
                            : "el-checkbox"
                        }
                      >
                        <span
                          className={
                            allCheckState == 1
                              ? "el-checkbox__input " + isCheckClass
                              : "el-checkbox__input"
                          }
                          onClick={e => selectAllChange(e)}
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
                      row.fiexd && oprShowBoxShadow ? "fiexdClass" : ""
                    }
                    key={k}
                    width={widthList[k]}
                    style={{
                      position: "relative",
                      userSelect: isUserSelect,
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
                          onMouseDown={e => onMouseDown(e, k)}
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
                  onClick={trClick.bind(this, data)}
                >
                  {retRows(columns, data, i, isLastNoOp, newDataSource.length)}
                </tr>
              );
            })}
        </tbody>
      </table>
      {/* 表体空内容展示 */}
      {newDataSource && newDataSource.length == 0 && retEmptyText(emptyText)}
    </div>
  );
};

// Table.propTypes = {
//   columns: PropTypes.array.isRequired, //表头名称
//   dataSource: PropTypes.array.isRequired, //数据列表
//   emptyText: PropTypes.string, //列表为空时， 空内容展示的html
//   isLastNoOp: PropTypes.bool, //表格最后一行不需要渲染操作样式
//   className: PropTypes.string, //表格的自定义的样式名,
//   classTableHeadName: PropTypes.string, // 表格的表头的自定义样式名
//   tableStyle: PropTypes.object,
//   tbodyMinHeight: PropTypes.string,
//   tbodyHeight: PropTypes.string,
//   showCheck: PropTypes.bool, // 是否展示选中单元格
//   checkBoxIdList: PropTypes.array, // 选中的单元格数据
//   tdEmptyText: PropTypes.string, // 表格缺省值
//   tdWhiteSpace: PropTypes.bool, // 单元格的内容是否需要一行展示
//   isUserSelect: PropTypes.string,
//   childrenString: PropTypes.string, // 子节点对应的字段，默认为 children
// };

export default App;
