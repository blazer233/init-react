# 筆記

## 前言 📝

> 👉
> 一、实现一个 useState
> 二、react 生命周期
> 三、effect 第二个参数的影响

---

## 实现一个 useState 🤖

- 見 useSate

---

## react 生命周期

this.setState-->reconcile 算法（diff 算法）计算出变化状态 即 render 阶段--->reactDom 渲染器讲状态变换渲染到视图 commit 阶段

#### 首次 render 时：

调用 this.setData()时

- render 阶段：

  构建 fiber 树：
  1、自上而下，深度遍历的方式创建，先儿子后兄弟的创建最后回到根节点
  2、每创建完一个节点，执行 render 阶段 的方法 constructor-->getDerivedstateFromProps/componentWillMount-->render

- commit 阶段：

  fiber 树渲染到 Dom，会从子节点开始执行生命周期函数 componentDidMount 直到根组件

调用 this.setData()时

- render 阶段：

  1、复用之前的节点创建一棵 fiber 树，不会执行节点的生命周期
  经过 diff 算法，标记变换

- commit 阶段：

  执行标记点的变换，对应的视图变换 执行 componentDidUpdate、getSnapshotBeforeUpdate
  新创建的 fiber 树替换之前的 fiber 树，等待下一次调用 this.setData()

---

## useEffect 第二个参数的影响

- useEffect(fn)--->mount、update、
- useEffect(fn,[])--->mount、
- useEffect(fn,[xx])--->mount、xx 变换时、

- render 阶段到 commit 阶段 传递了一条包含不同 fiber 节点的 effect 链表（update、delete、create 操作时分别进行标记）即 effectTag，
- commit 阶段分为三个阶段
- beforeMutation 阶段：

- Mutation 阶段：
- appendChild Dom 节点插入视图
- layout 阶段：
- 同步调用 componentDidMount
- 同步调用 uselayoutEffect
- useEffect 会在三个子阶段执行完成后异步的调用

---
