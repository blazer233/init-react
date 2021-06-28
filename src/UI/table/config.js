export const dataList = [
  {
    ID: "10001",
    name: "中文名测试",
    lavel: "等级2",
    pro: "属性1",
    upTime: "2021-01-14 15:15:00",
  },
  {
    ID: "10002",
    name: "中文",
    lavel: "等级3",
    pro: "属性2",
    upTime: "2021-01-14 15:15:00",
  },
  {
    ID: "10003",
    name: "中文",
    lavel: "等级3",
    pro: "属性2",
    upTime: "2021-01-14 15:15:00",
  },
  {
    ID: "10004",
    name: "中文",
    lavel: "等级3",
    pro: "属性2",
    upTime: "2021-01-14 15:15:00",
  },
  {
    ID: "10005",
    name: "中文",
    lavel: "等级3",
    pro: "属性2",
    upTime: "2021-01-14 15:15:00",
  },
];
export const columns1 = [
  {
    title: "ID",
    dataIndex: "ID",
    width: "100",
    getCellClick: (colData, data) => console.log(colData, data),
  },
  {
    title: "维度中文名",
    dataIndex: "name",
  },
  {
    title: "维度等级",
    dataIndex: "lavel",
  },
  {
    title: "属性类型",
    dataIndex: "pro",
  },
  {
    title: "修改时间",
    dataIndex: "upTime",
  },
];
export const columns2 = [
  {
    title: "checkTd",
    dataIndex: "ID",
    checkTd: 1, // checkTd: 1 就是可选单元格按钮, 需要配合 showCheck={true} 一起才有用 // 展示可选单元格
  },
  {
    title: "ID",
    dataIndex: "ID",
    width: "100",
    getCellClick: (colData, data) => console.log(colData, data),
  },
  {
    title: "维度中文名",
    dataIndex: "name",
  },
  {
    title: "维度等级",
    dataIndex: "lavel",
  },
  {
    title: "属性类型",
    dataIndex: "pro",
  },
  {
    title: "修改时间",
    dataIndex: "upTime",
  },
];
export const Deepclone = (target, map = new WeakMap()) => {
  if (typeof target === "object") {
    let cloneTarget = Array.isArray(target) ? [] : {};
    if (map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);
    for (const key in target) {
      cloneTarget[key] = Deepclone(target[key], map);
    }
    return cloneTarget;
  } else {
    return target;
  }
};
