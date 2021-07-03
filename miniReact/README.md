# 从 html 实现一个 react🎅

## 前言 📝

> 👉 我们认为，React 是用 JavaScript 构建快速响应的大型 Web 应用程序的首选方式。它在 Facebook 和 Instagram 上表现优秀。[官网地址](https://react.docschina.org/)。 👈

![Alt](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/914cba218a7e415eafc5feddcf9454dc~tplv-k3u1fbpfcp-zoom-1.image)

react 的理念是在于对大型项目的`快速响应`，对于新版的 react 16.8 而言更是带来的全新的理念`fiber`去解决网页快速响应时所伴随的问题，即 CPU 的瓶颈，传统网页浏览受制于浏览器刷新率、js 执行时间过长等因素会造成页面掉帧，甚至卡顿

react 由于自身的底层设计从而规避这一问题的发生，所以 react16.8 的面世对于前端领域只办三件事：~~快速响应、快速响应、还是 Tmd 快速响应 ~~，这篇文章将会从一个 html 出发，跟随 react 的 fiber 理念，仿一个非常基础的 react

---

## 一开始的准备工作 🤖

### html

我们需要一个 html 去撑起来整个页面，支撑 react 运行，页面中添加`<div id="root"></div>`，之后添加一个 script 标签，因为需要使用`import`进行模块化构建，所以需要为 script 添加 type 为`module`的属性

```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="./index.js" ></script>
</body>

</html>
```

推荐安装一个 `Live Server` 插件，有助于我们对代码进行调试，接下来的操作也会用到

### JavaScript

我们会仿写一个如下的 react，实现一个最最基础的 react 双向绑定，在 `<input/>` 绑定事件，将输入的值插入在 `<h2/>` 标签内：

```JavaScript
...
function App() {
  return (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
      <hr />
    </div>
  );
}
...
```

在 react 进行 babel 编译的时候，会将 `JSX` 语法转化为 `React.createElement()` 的形式，如上被 retuen 的代码就会被转换成

```JavaScript
...
React.createElement(
  "div",
  null,
  React.createElement("input", {
    onInput: updateValue,
    value: value,
  }),
  React.createElement("h2", null, "Hello ", value),
  React.createElement("hr", null)
);
...
```

> [在线地址](https://www.babeljs.cn/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.6&spec=false&loose=false&code_lz=Q&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=false&targets=&version=7.14.7&externalPlugins=)

从转换后的代码我们可以看出 React.createElement 支持多个参数:

1. type，节点类型

2. config, 节点上的属性，比如 id 和 href

3. children, 子元素了，子元素可以有多个，类型可以是简单的文本，也可以还是 React.createElement，如果是 React.createElement，其实就是子节点了，子节点下面还可以有子节点。这样就用 React.createElement 的嵌套关系实现了 HTML 节点的树形结构。

我们可以按照 `React.createElement` 的形式仿写一个可以实现同样功能的 `createElement` 将 jsx 通过一种简单的数据结构展示出来即 `虚拟DOM` 这样在更新时，新旧节点的对比也可以转化为虚拟 DOM 的对比

```JavaScript
{
  type:'节点标签',
  props:{
    props:'节点上的属性，包括事件、类...',
    children:'节点的子节点'
  }
}
```

实现：

- 原则是将所有的参数返回到一个对象上
- children 也要放到 props 里面去，这样我们在组件里面就能通过 props.children 拿到子元素
- 当子组件是文本节点时，通过构造一种 type 为 `TEXT_ELEMENT` 的节点类型表示

```JavaScript
/**
 * 创建虚拟 DOM 结构
 * @param {type} 标签名
 * @param {props} 属性对象
 * @param {children} 子节点
 * @return {element} 虚拟 DOM
 */
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
```

> [源码实现](https://github.com/facebook/react/blob/60016c448bb7d19fc989acd05dda5aca2e124381/packages/react/src/ReactElement.js#L348)

实现 `createElement` 之后我们可以拿到虚拟 DOM，但是还需要 `render` 将代码渲染到页面，此时我们需要对 `index.js` 进行一下处理，添加输入事件，将 `createElement` 和 `render` 通过 import 进行引入，render 时传入被编译后的虚拟 DOM 和页面的根元素 `root`， 最后再进行`executeRender`调用，页面被渲染，在页面更新的时候再次调用`executeRender`进行更新渲染

```JavaScript
import {createElement,render} from "./mini/index.js";
const updateValue = e => executeRender(e.target.value);
const executeRender = (value = "World") => {
  const element = createElement(
    "div",
    null,
    createElement("input", {
      onInput: updateValue,
      value: value,
    }),
    createElement("h2", null, "Hello ", value),
    createElement("hr", null)
  );
  render(element, document.getElementById("root"));
};

executeRender();
```

## render 的时候做了什么 🥔

### 之前的版本

`render` 函数帮助我们将 element 添加至真实节点中，接下拉我们会详细看看它做了些什么，首先它接受两个参数：

> 1. 根组件，其实是一个 JSX 组件，也就是一个 createElement 返回的虚拟 DOM
> 1. 父节点，也就是我们要将这个虚拟 DOM 渲染的位置

在 react 16.8 之前，渲染的方法是通过一下几步进行的

1. 创建 element.type 类型的 dom 节点，并添加到 root 元素下（文本节点特殊处理）
2. 将 element 的 props 添加到对应的 DOM 上，事件进行特殊处理，挂载到 document 上（react17 调整为挂在到 container 上）
3. 将 element.children 循环添加至 dom 节点中；

拿到虚拟 dom 进行如上三步的递归调用，渲染出页面 类似于如下流程

```javascript
/**
 * 将虚拟 DOM 添加至真实 DOM
 * @param {element} 虚拟 DOM
 * @param {container} 真实 DOM
 */
const render = (element, container) => {
  let dom;
  /*
      处理节点（包括文本节点）
  */
  if (typeof element !== "object") {
    dom = document.createTextNode(element);
  } else {
    dom = document.createElement(element.type);
  }
  /*
      处理属性（包括事件属性）
  */
  if (element.props) {
    Object.keys(element.props)
      .filter((key) => key != "children")
      .forEach((item) => {
        dom[item] = element.props[item];
      });
    Object.keys(element.props)
      .filter((key) => key.startsWith("on"))
      .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
      });
  }
  if (
    element.props &&
    element.props.children &&
    element.props.children.length
  ) {
    /*
      循环添加到dom
  */
    element.props.children.forEach((child) => render(child, dom));
  }
  container.appendChild(dom);
};
```

### 之后的版本（fiber）

当我们写完如上的代码，会发现这个递归调用是有问题的

如上这部分工作被 React 官方称为 renderer，renderer 是第三方可以自己实现的一个模块，还有个核心模块叫做 reconsiler，reconsiler 的一大功能就是 diff 算法，他会计算出应该更新哪些页面节点，然后将需要更新的节点虚拟 DOM 传递给 renderer，renderer 负责将这些节点渲染到页面上，但是但是他却是同步的，一旦开始渲染，就会将所有节点及其子节点全部渲染完成这个进程才会结束。

React 的官方演讲中有个例子，可以很明显的看到这种同步计算造成的卡顿：

![Alt](https://mmbiz.qpic.cn/mmbiz_gif/8mYHUg4p3qsuwtrhpG5ySTUFMb2lKeMncZmRcRFnwVUZPGM3NXDyUGSKR5Vqf5zcHZfDbWlYiahy3fC0ibLwiaNfA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

当 dom tree 很大的情况下，JS 线程的运行时间可能会比较长，在这段时间浏览器是不会响应其他事件的，因为 JS 线程和 GUI 线程是互斥的，JS 运行时页面就不会响应，这个时间太长了，用户就可能看到卡顿，

此时我们可以分为两步解决这个问题

- 允许中断渲染工作，如果有优先级更高的工作插入，则暂时中断浏览器渲染，待完成该工作后，恢复浏览器渲染；
- 将渲染工作进行分解，分解成一个个小单元；

#### 第一个方案，此时我们将引入一个新的 Api

> [window.requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback) 将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件

requestIdleCallback 接收一个回调，这个回调会在浏览器空闲时调用，每次调用会传入一个 IdleDeadline，可以拿到当前还空余多久， options 可以传入参数最多等多久，等到了时间浏览器还不空就强制执行了。

（但是这个 API 还在实验中，兼容性不好，所以 React 官方自己实现了一套。本文会继续使用 requestIdleCallback 来进行任务调度）

```JavaScript
// 下一个工作单元
let nextUnitOfWork = null
/**
 * workLoop 工作循环函数
 * @param {deadline} 截止时间
 */
function workLoop(deadline) {
  // 是否应该停止工作循环函数
  let shouldYield = false

  // 如果存在下一个工作单元，且没有优先级更高的其他工作时，循环执行
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )

    // 如果截止时间快到了，停止工作循环函数
    shouldYield = deadline.timeRemaining() < 1
  }

  // 通知浏览器，空闲时间应该执行 workLoop
  requestIdleCallback(workLoop)
}
// 通知浏览器，空闲时间应该执行 workLoop
requestIdleCallback(workLoop)

// 执行单元事件，并返回下一个单元事件
function performUnitOfWork(nextUnitOfWork) {
  // TODO
}

```

#### 第二个方案，此时我们将创建 fiber 的数据结构

Fiber 之前的数据结构是一棵树，父节点的 children 指向了子节点，但是只有这一个指针是不能实现中断继续的。比如我现在有一个父节点 A，A 有三个子节点 B,C,D，当我遍历到 C 的时候中断了，重新开始的时候，其实我是不知道 C 下面该执行哪个的，因为只知道 C，并没有指针指向他的父节点，也没有指针指向他的兄弟。

Fiber 就是改造了这样一个结构，加上了指向父节点和兄弟节点的指针：

- child 指向子组件
- sibling 指向兄弟组件
- return 指向父组件

## ![Alt](https://upload-images.jianshu.io/upload_images/9369683-699b6c3475685cdd.png?imageMogr2/auto-orient/strip|imageView2/2/w/813/format/webp)

每个 fiber 都有一个链接指向它的第一个子节点、下一个兄弟节点和它的父节点。这种数据结构可以让我们更方便的查找下一个工作单元，fiber 的渲染顺序也如下步骤

1. 从 root 开始，找到第一个子节点 A；
2. 找到 A 的第一个子节点 B
3. 找到 B 的第一个子节点 E
4. 找 E 的第一个子节点，如无子节点，则找下一个兄弟节点，找到 E 的兄弟节点 F
5. 找 F 的第一个子节点，如无子节点，也无兄弟节点，则找它的父节点的下一个兄弟节点，找到 F 的 父节点的兄弟节点 C；
6. 找 C 的第一个子节点，找不到，找兄弟节点，D
7. 找 D 的第一个子节点，G
8. 找 G 的第一个子节点，找不到，找兄弟节点，找不到，找父节点 D 的兄弟节点，也找不到，继续找 D 的父节点的兄弟节点，找到 root；
9. 上一步已经找到了 root 节点，渲染已全部完成。

我们通过这个数据结构实现一个 fiber

```JavaScript
 wipRoot = {
  dom: container,
  props: { children: [element] },
};
performUnitOfWork(wipRoot);
//随后调用`performUnitOfWork`自上而下构造整个 fiber 树

/**
 * performUnitOfWork用来执行任务
 * @param {fiber} 我们的当前fiber任务
 * @return {fiber} 下一个任务fiber任务
 */
const  performUnitOfWork = fiber => {
  if (!fiber.dom) fiber.dom = createDom(fiber); // 创建一个DOM挂载上去
  const elements = fiber.props.children; //当前元素下的所有同级节点
  // 如果有父节点，将当前节点挂载到父节点上
  if (fiber.return) {
    fiber.return.dom.appendChild(fiber.dom);
  }

  let prevSibling = null;
  /*
      之后代码中我们将把此处的逻辑进行抽离
  */
  if (elements && elements.length) {
    elements.forEach((element, index) => {
      const newFiber = {
        type: element.type,
        props: element.props,
        return: fiber,
        dom: null,
      };
      // 父级的child指向第一个子元素
      if (index === 0) {
        fiber.child = newFiber;
      } else {
        // 每个子元素拥有指向下一个子元素的指针
        prevSibling.sibling = newFiber;
      }
      prevSibling = fiber;
    });
  }
  // 先找子元素，没有子元素了就找兄弟元素
  // 兄弟元素也没有了就返回父元素
  // 最后到根节点结束
  // 这个遍历的顺序其实就是从上到下，从左到右
  if (fiber.child) {
    return fiber.child;
  } else {
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.return;
    }
  }
}
```

### 之后的版本（commit）

上面我们的 performUnitOfWork 一边构建 Fiber 结构一边操作 DOM appendChild，这样如果某次更新好几个节点，操作了第一个节点之后就中断了，那我们可能只看到第一个节点渲染到了页面，后续几个节点等浏览器空了才陆续渲染。为了避免这种情况，我们应该将 DOM 操作都搜集起来，最后统一执行，这就是 commit。当没有下一次的工作单元时 commit:

```JavaScript
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

```

## 遇到的问题&总结 💢

有很多时候 react 错误边界不是万能的比如

- 事件错误

![demo-1](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f097a4fd654a48e5a29a889462e89065~tplv-k3u1fbpfcp-zoom-1.image)
上面 this.o 不存在，会报错，window.onerror 可以捕获，但是错误边界捕获不到。

- 异步代码

![demo-1](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5641266e60f4a139605862e322a9cc8~tplv-k3u1fbpfcp-zoom-1.image)

- 服务端渲染 和 错误边界自己的错误

总结

- 抽离组件 ✔
- 错误反馈 ✔
- UI 抽离 ✔
- 错误重置 ✔
- 抽离 hook 模式 ✖
- 服务端 ✖

至此，谢谢各位在百忙之中点开这篇文章，希望对你们能有所帮助，相信你对 react 中的错误边界有了大概的认实，也会编写一个简单的`ErrorBoundary`总的来说优化的点还有很多，如有问题欢迎各位大佬指正。

- 👋：[跳转 github](https://github.com/blazer233/react-errors/tree/errors-hook)

### 参考文献

- 🍑：[React.js |错误边界组件](https://juejin.cn/post/6877165871693987847#heading-2)
- 🍑：[捕获 React 异常](https://github.com/x-orpheus/catch-react-error/blob/master/doc/catch-react-error.md)
- 🍑：[造一个 React 错误边界的轮子](https://github.com/Haixiang6123/my-react-error-bounday)
- 🍑：[错误边界(Error Boundaries)](https://react.html.cn/docs/error-boundaries.html)
- 🍑：[深入浅出 React 的异常错误边界](https://www.jianshu.com/p/3ae9838ed51c)

求个 star，谢谢大家了
