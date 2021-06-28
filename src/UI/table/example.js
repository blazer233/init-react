import React, { useEffect, useState } from "react";
import { dataList, columns1, columns2 } from "./config";
import Table from "./index";
export default () => {
  let [asynclist, setAsync] = useState([]);
  useEffect(() => {
    setTimeout(() => setAsync(["10002"]), 3000);
  }, []);
  let onRowClick = (data, event) => console.log("行", data, event);
  let onClickGetOneData = (data, event) => console.log("格", data, event);
  let checkboxChange = data => setAsync(data);
  let handle = {
    title: "操作",
    render: (data, record) => (
      <div onClick={() => onClickGetOneData(data)}>编辑</div>
    ),
  };
  return (
    <div>
      <h3>未配置可勾选行</h3>
      <Table columns={[...columns1, handle]} dataSource={dataList} />
      <br />
      <h3>配置可勾选行: {asynclist.join()}</h3>
      <h6>模拟异步：默认勾选 10002</h6>
      <Table
        showCheck={true} // 展示可选单元格
        columns={[...columns2, handle]}
        dataSource={dataList}
        onRowClick={onRowClick}
        checkBoxIdList={asynclist}
        checkboxChange={checkboxChange} // 选中的单元格数据接受事件
      />
    </div>
  );
};
