# 从 html 实现一个 react🎅

## 前言 📝

> 👉 我们认为，React 是用 JavaScript 构建快速响应的大型 Web 应用程序的首选方式。它在 Facebook 和 Instagram 上表现优秀。[官网地址](https://react.docschina.org/)。 👈

![Alt](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/914cba218a7e415eafc5feddcf9454dc~tplv-k3u1fbpfcp-zoom-1.image)

react 的理念是在于对大型项目的`快速响应`，对于新版的 react 16.8 而言更是带来的全新的理念`fiber`去解决网页快速响应时所伴随的问题，即 CPU 的瓶颈，传统网页浏览受制于浏览器刷新率、js 执行时间过长等因素会造成页面掉帧，甚至卡顿，而 react 由于自身的底层设计从而规避这一问题的发生，所以 react16.8 的面世对于前端领域只办三件事：快速响应、快速响应、还是 Tmd 快速响应 为什么说是从 0 到 0.1 实现一个 react ？因为我会从一个 html 出发，跟随新版 react 的 fiber 理念，仿一个非常基础的 react

---

## 一开始的准备工作 🤖

##### html

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

##### JavaScript

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

从转换后的代码我们可以看出 React.createElement 支持多个参数:

1. type，也就是节点类型

2. config, 这是节点上的属性，比如 id 和 href

3. children, 从第三个参数开始就全部是 children 也就是子元素了，子元素可以有多个，类型可以是简单的文本，也可以还是 React.createElement，如果是 React.createElement，其实就是子节点了，子节点下面还可以有子节点。这样就用 React.createElement 的嵌套关系实现了 HTML 节点的树形结构。

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

[源码实现](https://github.com/facebook/react/blob/60016c448bb7d19fc989acd05dda5aca2e124381/packages/react/src/ReactElement.js#L348)

实现 `createElement` 之后我们可以拿到虚拟 DOM，但是还需要 `render` 将代码渲染到页面，此时我们需要对 `index.js` 进行一下处理，添加输入事件，将 `createElement` 和 `render` 通过 import 进行引入，render 时传入被编译后的虚拟 DOM 和页面的根元素 `root`， 最后再进行函数调用，执行我们的 `类react` 最终渲染到页面

```JavaScript
import {createElement,render} from "./mini/index.js";
const updateValue = e => startRender(e.target.value);
const startRender = (value = "World") => {
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

startRender();
```

## render 的时候做了什么 🥔

`render`可谓是 react 最神秘的方法之一，接下拉我们会详细看看`render`做了些什么，首先它接受两个参数：

> 1. 根组件，其实是一个 JSX 组件，也就是一个 createElement 返回的虚拟 DOM
> 1. 父节点，也就是我们要将这个虚拟 DOM 渲染的位置

```javascript

```

然后你可以将它作为一个常规组件去使用：

```javascript
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

错误边界的工作方式类似于 JavaScript 的 `catch {}`，不同的地方在于错误边界只针对 `React` 组件。只有 `class` 组件才可以成为错误边界组件。大多数情况下, 你只需要声明一次错误边界组件, 并在整个应用中使用它，在使用时被包裹组件出现的错误或者`throw new Error()`抛出的异常都可以被错误边界组件捕获，并且显示出兜底 UI

---

## 封装一个可配置的 ErrorBoundary 🚲

了解了官网实现错误边界组件的方法，我们可以封装一个`ErrorBoundary`组件，造一个好用的轮子，而不是直接写死`return <h1>Something went wrong</h1>`，学习了`react-redux`原理后我们知道可以用高阶组件来包裹`react`组件，将`store`中的数据和方法全局注入，同理，我们也可以使用高阶组件包裹使其成为一个能够错误捕获的 react 组件

#### 1️⃣ 创造一个可配置的 ErrorBoundary 类组件

相比与官网的 `ErrorBoundary`，我们可以将日志上报的方法以及显示的 `UI` 通过接受传参的方式进行动态配置，对于传入的`UI`，我们可以设置以`react`组件的方式 或 是一个`React Element`进行接受，而且通过组件的话，我们可以传入参数，这样可以在兜底 UI 中拿到具体的错误信息

- componentDidCatch() : 错误日志处理的钩子函数
- static getDerivedStateFromError() : 它将抛出的错误作为参数，并返回一个值以更新 state

```javascript
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      //上报日志通过父组件注入的函数进行执行
      this.props.onError(error, errorInfo.componentStack);
    }
  }
  render() {
    const { fallback, FallbackComponent } = this.props;
    const { error } = this.state;
    if (error) {
      const fallbackProps = { error };
      //判断是否为React Element
      if (React.isValidElement(fallback)) {
        return fallback;
      }
      //组件方式传入
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }
      throw new Error("ErrorBoundary 组件需要传入兜底UI");
    }
    return this.props.children;
  }
}
```

这样就可以对兜底`UI`显示和`错误日志`进行动态获取，使组件更加灵活，但是又有一个问题出现，有时候会遇到这种情况：服务器突然 503、502 了，前端获取不到响应，这时候某个组件报错了，但是过一会又正常了。比较好的方法是用户点一下被`ErrorBoundary`封装的组件中的一个方法来重新加载出错组件，不需要重刷页面，这时候需要兜底的组件中应该暴露出一个方法供`ErrorBoundary`进行处理

![image-1](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb534b2ba8de4a0a85cbce8b837d4e19~tplv-k3u1fbpfcp-zoom-1.image)

1. 在 ErrorBoundary 中添加方法，检测是否有注入重置方法，如果有重置方法就执行并且重置 state 中的 error，使其错误状态为 false

```javascript
resetErrorBoundary = () => {
  if (this.props.onReset) this.props.onReset();
  this.setState({ error: false });
};
```

2. 在 render 中添加函数组件类型进行渲染，可以将重置的方法以及错误信息当做参数进行传递到当前组件进行处理

```javascript
  render() {
    const { fallback, FallbackComponent, fallbackRender } = this.props;
    const { error } = this.state;
    if (error) {
      const fallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };
      ...
      if (typeof fallbackRender === "function")return fallbackRender(fallbackProps);
      ...
    }
    return this.props.children;
  }
```

#### 2️⃣ 将 ErrorBoundary 通过高阶函数进行包裹返回

```javascript
import React from "react";
import DefaultErrorBoundary from "./core";
const catchreacterror = (Boundary = DefaultErrorBoundary) => InnerComponent => {
  return props => (
    <Boundary {...props}>
      <InnerComponent {...props} />
    </Boundary>
  );
};
```

---

## 使用&测试 🏁

通过一个点击自增的 Demo，当数字到达某值，抛出异常，这里分别对 class 组件和 Function 组件作为发起异常的组件进行测试

- 发起异常的组件

```javascript
//Function组件
const fnCount1 = ({ count }) => {
  if (count == 3) throw new Error("count is three");
  return <span>{count}</span>;
};
//Class组件
class fnCount2 extends React.Component {
  render() {
    const { count } = this.props;
    if (count == 2) throw new Error("count is two");
    return <span>{count}</span>;
  }
}
```

- 处理错误异常的函数组件

```javascript
const errorbackfn = ({ error: { message }, resetErrorBoundary }) => (
  <div>
    <p>出错啦</p>
    <pre>{message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);
```

- 处理错误异常的普通组件

```javascript
const errorbackcom = () => <h1>出错啦,不可撤销</h1>;
```

- 测试组件

```javascript
//对发起异常的组件进行包裹处理，返回一个可以处理错误编辑的高阶组件
const SafeCount1 = catchreacterror()(fnCount1);
const SafeCount2 = catchreacterror()(fnCount2);

//测试主组件
const App = () => {
  const [count, setCount] = useState(0);
  const ListenError = (arg, info) => console.log("出错了:" + arg.message, info); //错误时进行的回调
  const onReset = () => setCount(0); //点击重置时进行的回调
  return (
    <div className="App">
      <section>
        <button onClick={() => setCount(count => count + 1)}>+</button>
        <button onClick={() => setCount(count => count - 1)}>-</button>
      </section>
      <hr />
      <div>
        Class componnet:
        <SafeCount2
          count={count}
          fallbackRender={errorbackfn}
          onReset={onReset}
          onError={ListenError}
        />
      </div>
      <div>
        Function componnet:
        <SafeCount1
          count={count}
          FallbackComponent={errorbackcom}
          onError={ListenError}
        />
      </div>
    </div>
  );
};
```

![demo-1](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b73110b411344b8a8c7cb7b8d3e2b6d2~tplv-k3u1fbpfcp-zoom-1.image)

大功告成！

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
