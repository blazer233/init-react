// 核心逻辑不复杂，将参数都塞到一个对象上返回就行
// children也要放到props里面去，这样我们在组件里面就能通过this.props.children拿到子元素
const createElement = (type, props, ...children) => ({
  type,
  props: {
    ...props,
    children: children.map(child =>
      typeof child === "object"
        ? child
        : {
            type: "TEXT_ELEMENT",
            props: {
              nodeValue: child,
              children: [],
            },
          }
    ),
  },
});

export default createElement;
