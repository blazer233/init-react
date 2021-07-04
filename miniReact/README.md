## 前言 📝

> 👉 我们认为，React 是用 JavaScript 构建快速响应的大型 Web 应用程序的首选方式。它在 Facebook 和 Instagram 上表现优秀。[官网地址](https://react.docschina.org/)

![Alt](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5506b312f4ae415a89f10860c7e98bd8~tplv-k3u1fbpfcp-zoom-1.image)

react 的理念是在于对大型项目的`快速响应`，对于新版的 react 16.8 而言更是带来的全新的理念`fiber`去解决网页快速响应时所伴随的问题，即 CPU 的瓶颈，传统网页浏览受制于浏览器刷新率、js 执行时间过长等因素会造成页面掉帧，甚至卡顿

react 由于自身的底层设计从而规避这一问题的发生，所以 react16.8 的面世对于前端领域只办三件事：快速响应、快速响应、还是 Tmd 快速响应 !，这篇文章将会从一个 html 出发，跟随 react 的 fiber 理念，仿一个非常基础的 react

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

我们会仿写一个如下的 react，实现一个基础的操作，在 `<input/>` 绑定事件，将输入的值插入在 `<h2/>` 标签内：

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

![actionGif.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b299a5b1f494b84874588013d12d6ca~tplv-k3u1fbpfcp-watermark.image)

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

这里我们可以写一个函数实现下列需求

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

> [react 中 createElement 源码实现](https://github.com/facebook/react/blob/60016c448bb7d19fc989acd05dda5aca2e124381/packages/react/src/ReactElement.js#L348)

实现 `createElement` 之后我们可以拿到虚拟 DOM，但是还需要 `render` 将代码渲染到页面，此时我们需要对 `index.js` 进行处理，添加输入事件，将 `createElement` 和 `render` 通过 import 进行引入，render 时传入被编译后的虚拟 DOM 和页面的根元素 `root`， 最后再进行`executeRender`调用，页面被渲染，在页面更新的时候再次调用`executeRender`进行更新渲染

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

### before 版本

`render` 函数帮助我们将 element 添加至真实节点中，首先它接受两个参数：

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

### after 版本（fiber）

当我们写完如上的代码，会发现这个递归调用是有问题的

如上这部分工作被 React 官方称为 renderer，renderer 是第三方可以自己实现的一个模块，还有个核心模块叫做 reconsiler，reconsiler 的一大功能就是 diff 算法，他会计算出应该更新哪些页面节点，然后将需要更新的节点虚拟 DOM 传递给 renderer，renderer 负责将这些节点渲染到页面上，但是但是他却是同步的，一旦开始渲染，就会将所有节点及其子节点全部渲染完成这个进程才会结束。

React 的官方演讲中有个例子，可以很明显的看到这种同步计算造成的卡顿：

![Alt](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05322d7da1dc48c0a40be7bf7770e25d~tplv-k3u1fbpfcp-zoom-1.image)

当 dom tree 很大的情况下，JS 线程的运行时间可能会比较长，在这段时间浏览器是不会响应其他事件的，因为 JS 线程和 GUI 线程是互斥的，JS 运行时页面就不会响应，这个时间太长了，用户就可能看到卡顿，

此时我们可以分为两步解决这个问题

- 允许中断渲染工作，如果有优先级更高的工作插入，则暂时中断浏览器渲染，待完成该工作后，恢复浏览器渲染；
- 将渲染工作进行分解，分解成一个个小单元；

#### solution I 引入一个新的 Api

requestIdleCallback 接收一个回调，这个回调会在浏览器空闲时调用，每次调用会传入一个 IdleDeadline，可以拿到当前还空余多久， options 可以传入参数最多等多久，等到了时间浏览器还不空就强制执行了。

> [window.requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback) 将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件
>
> > 但是这个 API 还在实验中，兼容性不好，所以 React 官方自己实现了一套。本文会继续使用 requestIdleCallback 来进行任务调度

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

#### solution II 创建 fiber 的数据结构

Fiber 之前的数据结构是一棵树，父节点的 children 指向了子节点，但是只有这一个指针是不能实现中断继续的。比如我现在有一个父节点 A，A 有三个子节点 B,C,D，当我遍历到 C 的时候中断了，重新开始的时候，其实我是不知道 C 下面该执行哪个的，因为只知道 C，并没有指针指向他的父节点，也没有指针指向他的兄弟。

Fiber 就是改造了这样一个结构，加上了指向父节点和兄弟节点的指针：

- child 指向子组件
- sibling 指向兄弟组件
- return 指向父组件

## ![Alt](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/782ce851ab8a49e79ce56a287233d8a3~tplv-k3u1fbpfcp-zoom-1.image)

每个 fiber 都有一个链接指向它的第一个子节点、下一个兄弟节点和它的父节点。这种数据结构可以让我们更方便的查找下一个工作单元，假定 `A` 是挂在 root 上的节点 fiber 的渲染顺序也如下步骤

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
//创建最初的根fiber
 wipRoot = {
  dom: container,
  props: { children: [element] },
};
performUnitOfWork(wipRoot);
```

随后调用`performUnitOfWork`自上而下构造整个 fiber 树

```JavaScript
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
  // 这个遍历的顺序是从上到下，从左到右
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

### after 版本（reconcile）

#### currentRoot

reconcile 其实就是虚拟 DOM 树的 diff 操作，将更新前的 fiber tree 和更新后的 fiber tree 进行比较，得到比较结果后，仅对有变化的 fiber 对应的 dom 节点进行更新。

- 删除不需要的节点
- 更新修改过的节点
- 添加新的节点

新增 currentRoot 变量，保存根节点更新前的 fiber tree，为 fiber 新增 alternate 属性，保存 fiber 更新前的 fiber tree

```JavaScript
let currentRoot = null
function render (element, container) {
    wipRoot = {
        // 省略
        alternate: currentRoot
    }
}
function commitRoot () {
    commitWork(wipRoot.child)
    /*
        更改fiber树的指向，将缓存中的fiber树替换到页面中的fiber tree
    */
    currentRoot = wipRoot
    wipRoot = null
}

```

1. 如果新老节点类型一样，复用老节点 DOM，更新 props

2. 如果类型不一样，而且新的节点存在，创建新节点替换老节点

3. 如果类型不一样，没有新节点，有老节点，删除老节点

#### reconcileChildren

1. 将 performUnitOfWork 中关于新建 fiber 的逻辑，抽离到 reconcileChildren 函数
2. 在 reconcileChildren 中对比新旧 fiber；

在对比 fiber tree 时

- 当新旧 fiber 类型相同时 保留 dom，`仅更新 props，设置 effectTag 为 UPDATE`；
- 当新旧 fiber 类型不同，且有新元素时 `创建一个新的 dom 节点，设置 effectTag 为 PLACEMENT`；
- 当新旧 fiber 类型不同，且有旧 fiber 时 `删除旧 fiber，设置 effectTag 为 DELETION`

```JavaScript
/**
 * 协调子节点
 * @param {fiber} fiber
 * @param {elements} fiber 的 子节点
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;// 用于统计子节点的索引值
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child; //更新时才会产生
  let prevSibling;// 上一个兄弟节点
  while (index < elements.length || oldFiber) {
    /**
     * 遍历子节点
     * oldFiber判断是更新触发还是首次触发,更新触发时为元素下所有节点
     */
    let newFiber;
    const element = elements[index];
    const sameType = oldFiber && element && element.type == oldFiber.type; // fiber 类型是否相同点
    /**
     * 更新时
     * 同标签不同属性，更新属性
     */
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props, //只更新属性
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    /**
     * 不同标签，即替换了标签 or 创建新标签
     */
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    /**
     * 节点被删除了
     */
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) oldFiber = oldFiber.sibling;
    // 父级的child指向第一个子元素
    if (index === 0) {
      // fiber的第一个子节点是它的子节点
      wipFiber.child = newFiber;
    } else {
      // fiber 的其他子节点，是它第一个子节点的兄弟节点
      prevSibling.sibling = newFiber;
    }
    // 把新建的 newFiber 赋值给 prevSibling，这样就方便为 newFiber 添加兄弟节点了
    prevSibling = newFiber;
    //  索引值 + 1
    index++;
  }
}
```

在 commit 时，根据 fiber 节点上`effectTag`的属性执行不同的渲染操作

### after 版本（commit）

在 commitWork 中对 fiber 的 effectTag 进行判断，处理真正的 DOM 操作。

1. 当 fiber 的 effectTag 为 PLACEMENT 时，表示是新增 fiber，将该节点新增至父节点中。
2. 当 fiber 的 effectTag 为 DELETION 时，表示是删除 fiber，将父节点的该节点删除。
3. 当 fiber 的 effectTag 为 UPDATE 时，表示是更新 fiber，更新 props 属性。

```JavaScript
/**
 * @param {fiber} fiber 结构的虚拟dom
 */
function commitWork(fiber) {
  if (!fiber) return;
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }

  // 递归操作子元素和兄弟元素
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

此时我们着重来看`updateDom`发生了什么，我们拿到 dom 上被改变的新旧属性，进行操作

```JavaScript
/*
    isEvent :拿到事件属性
    isProperty :拿到非节点、非事件属性
    isNew :拿到前后改变的属性
*/
const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];


/**
 * 更新dom属性
 * @param {dom} fiber dom
 * @param {prevProps} fiber dom上旧的属性
 * @param {nextProps} fiber dom上新的属性
 */
function updateDom(dom, prevProps, nextProps) {
  /**
   * 便利旧属性
   * 1、拿到on开头的事件属性
   * 2、拿到被删除的事件
   * 3、已删除的事件取消监听
   */
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  /**
   * 便利旧属性
   * 1、拿到非事件属性和非子节点的属性
   * 2、拿到被删除的属性
   * 3、删除属性
   */
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(key => !(key in nextProps))
    .forEach(key => delete dom[key]);

  /**
   * 便利新属性
   * 1、拿到非事件属性和非子节点的属性
   * 2、拿到前后改变的属性
   * 3、添加属性
   */
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  /**
   * 便利新属性
   * 1、拿到on开头的事件属性
   * 2、拿到前后改变的事件属性
   * 3、为新增的事件属性添加监听
   */
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
```

完成了一系列对 dom 的操作，我们将新改变的 dom 渲染到页面，当 input 事件执行时，页面又会进行渲染，但此时会进入更新 fiber 树的逻辑，
alternate 指向之前的 fiber 节点进行复用，更快的执行 Update 操作，如图：

![actionGif.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b299a5b1f494b84874588013d12d6ca~tplv-k3u1fbpfcp-watermark.image)

大功告成！

完整代码可以看我[github](https://github.com/blazer233/init-react/tree/main/miniReact)。

## 结论与总结 💢

结论

- 我们写的 JSX 代码被 babel 转化成了 React.createElement。
- React.createElement 返回的其实就是虚拟 DOM 结构。
- 虚拟 DOM 的调和和渲染可以简单粗暴的递归，但是这个过程是同步的，如果需要处理的节点过多，可能会阻塞用户输入和动画播放，造成卡顿。
- Fiber 是 16.x 引入的新特性，用处是将同步的调和变成异步的。
- Fiber 改造了虚拟 DOM 的结构，具有 父->第一个子， 子->兄， 子->父这几个指针，有了这几个指针，可以从任意一个 Fiber 节点找到其他节点。
- Fiber 将整棵树的同步任务拆分成了每个节点可以单独执行的异步执行结构。
- Fiber 可以从任意一个节点开始遍历，遍历是深度优先遍历，顺序是 父->子->兄->父，也就是从上往下，从左往右。
- Fiber 的调和阶段可以是异步的小任务，但是提交阶段( commit)必须是同步的。因为异步的 commit 可能让用户看到节点一个一个接连出现，体验不好。

总结

- react hook 实现 ✖
- react 合成事件 ✖
- 还有很多没有实现 😤...

至此，谢谢各位在百忙之中点开这篇文章，希望对你们能有所帮助，如有问题欢迎各位大佬指正。工作原因这篇文章大概断断续续写了有一个月，工作上在忙一个基于 `腾讯云TRTC`+`websocket` 的小程序电话功能，有时间也会写成文章分享一下，当然 react 的实现文章也会继续

👋：[跳转 github](https://github.com/blazer233/init-react/tree/main/miniReact) 欢迎给个 star，谢谢大家了

参考文献

- 🍑：[手写系列-实现一个铂金段位的 React](https://juejin.cn/post/6978654109893132318?utm_source=gold_browser_extension#heading-14)
- 🍑：[build-your-own-react（强烈推荐）](https://pomb.us/build-your-own-react/)
- 🍑：[手写 React 的 Fiber 架构，深入理解其原理](https://mp.weixin.qq.com/s/wGSUdQJxOiyPTRbrBBs1Zg)
- 🍑：[手写一个简单的 React](https://jelly.jd.com/article/60aceb6b27393b0169c85231#)
- 🍑：[妙味课堂大圣老师 手写 react 的 fiber 和 hooks 架构](https://study.miaov.com/v_show/4227)
- 🍑：[React Fiber 架构](https://zhuanlan.zhihu.com/p/37095662)
- 🍑：[手写一个简单的 React](https://jelly.jd.com/article/60aceb6b27393b0169c85231#)
