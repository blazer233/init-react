## requestIdleCallback

调度 -> 协调 -> 渲染

在 react 老版本

1. Reconciler 和 Renderer 是交替工作的，当 Reconciler 第一个 li 在页面上 Renderer 后，第二个 li 再进入 Reconciler。
2. 同步进行，如果更新时中断更新，此时后面的步骤都还未执行，得到更新不完全的 DOM

在 react 新版本

1. 更新工作从递归变成了可以中断的循环过程。每次循环都会调用 shouldYield 判断当前是否有剩余时间。

```javascript
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
/*
workInProgress 代表当前已创建的 workInProgress fiber。

performUnitOfWork 方法会创建下一个 Fiber 节点并赋值给 workInProgress，并将 workInProgress 与已创建的 Fiber 节点连接起来构成Fiber树。
*/
```

2. econciler 与 Renderer 不再是交替工作。当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的 DOM 打上代表 增/删/更新 的标记 ，且由于性能问题只会同级进行比较，如果一个 DOM 节点在前后两次更新中跨越了层级，那么 React 不会尝试复用他。(二进制记录)：

```javascript
export const Placement = /*             */ 0b0000000000010;
export const Update = /*                */ 0b0000000000100;
export const PlacementAndUpdate = /*    */ 0b0000000000110;
export const Deletion = /*              */ 0b0000000001000;
```

双缓存

> 在 React 中最多会同时存在两棵 Fiber 树。

- 当前屏幕上显示内容对应的 Fiber 树称为 current Fiber 树
- 正在内存中构建的 Fiber 树称为 workInProgress Fiber 树。

mount 时

1. 首次执行 ReactDOM.render 会创建 fiberRoot 和 rootFiber。
   1. fiberRoot 是整个应用的根节点 (一个)
   2. rootFiber 是<App/>所在组件树的根节点 (多个)

fiberRoot.current 指向的 rootFiber

2. 接下来进入 render 阶段，根据组件返回的 JSX 在内存中依次创建 Fiber 节点并连接在一起构建 Fiber 树，被称为 workInProgress Fiber 树。

在构建 workInProgress Fiber 树时会尝试复用 current Fiber 树中已有的 Fiber 节点内的属性，在首屏渲染时只有 rootFiber 存在对应的 current fiber（即 rootFiber.alternate）首屏时只有 rootFiber 存在对应的 current fiber

3. 最后，fiberRoot 的 current 指针指向 workInProgress Fiber 树使其变为 current Fiber 树

update 时

1. 会开启一次新的 render 阶段并构建一棵新的 workInProgress Fiber 树。和 mount 时一样，workInProgress fiber 的创建可以复用 current Fiber 树对应的节点数据。

React 通过 ClassComponent 实例原型上的 isReactComponent 变量判断是否是 ClassComponent

## render 阶段

#### “递”阶段

rootFiber 开始向下深度优先遍历。为遍历到的每个 Fiber 节点调用 beginWork 方法 。
该方法会根据传入的 Fiber 节点创建子 Fiber 节点，并将这两个 Fiber 节点连接起来。

```javascript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  // ...省略函数体
}
//current：当前组件对应的Fiber节点在上一次更新时的Fiber节点，即workInProgress.alternate
//workInProgress：当前组件对应的Fiber节点
//renderLanes：优先级相关，在讲解Scheduler时再讲解
```

通过 current === null ?来区分组件是处于 mount 还是 update
可以通过 current 是否存在来分别处理

- update： current 存在，可以复用 current 节点，这样就能克隆 current.child 作为 workInProgress.child，而不需要新建 workInProgress.child。

- mount：除 fiberRootNode 以外，current === null。会根据 fiber.tag 不同，进入不同类型 Fiber 的创建逻辑 如：LazyComponent、FunctionComponent、ClassComponent

进入 reconcileChildren

- mount 的组件，他会创建新的子 Fiber 节点
- update 的组件，他会将当前组件与该组件在上次更新时对应的 Fiber 节点进行 diff 算法比较，将比较的结果生成新 Fiber 节点，由于同级的 Fiber 节点是由 sibling 指针链接形成的单链表，即不支持双指针遍历。(区别 Vue)

```javascript
function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  if (current === null) {
    // 对于mount的组件
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    );
  } else {
    // 对于update的组件
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes
    );
  }
}
```

1. 生成新的子 Fiber 节点并赋值给 workInProgress.child，作为本次 beginWork 返回值，并作为下次 performUnitOfWork 执行时 workInProgress 的传参
2. reconcileChildFibers 会为生成的 Fiber 节点带上 effectTag 属性，作为变更的标签 ，mount 时只会打上 Placement 的 teg，即插入

#### “归”阶段

在“归”阶段会调用 completeWork 处理 Fiber 节点。
当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的“递”阶段。
如果不存在兄弟 Fiber，会进入父级 Fiber 的“归”阶段。

mount 时主要处理

- 为 Fiber 节点生成对应的 DOM 节点
- 将子孙 DOM 节点插入刚生成的 DOM 节点中
- 与 update 逻辑中的 updateHostComponent 类似的处理 props 的过程

update 时主要处理

- onClick、onChange 等回调函数的注册
- 处理 style prop
- 处理 DANGEROUSLY_SET_INNER_HTML prop
- 处理 children prop

最终会被赋值给 workInProgress.updateQueue，并最终会在 commit 阶段被渲染在页面上。

```javascript
//对不同fiber.tag调用不同的处理逻辑。
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      // ...省略
      return null;
    }
    case HostRoot: {
      // ...省略
      updateHostContainer(workInProgress);
      return null;
    }
    case HostComponent: {
      // ...省略
      return null;
    }
```

最后

- 每个执行完 completeWork 且存在 effectTag 的 Fiber 节点会被保存在一条被称为 effectList 的单向链表中。
- 所有有 effectTag 的 Fiber 节点都会被追加在 effectList 中，最终形成一条以 rootFiber.firstEffect 为起点的单向链表。

```javascript
                       nextEffect         nextEffect
rootFiber.firstEffect -----------> fiber -----------> fiber
```

## commit 阶段

#### before mutation 之前

1. 触发 useEffect 回调与其他同步任务。由于这些任务可能触发新的渲染，所以这里要一直遍历执行直到没有任务
2. 将 effectList 赋值给 firstEffect
   由于每个 fiber 的 effectList 只包含他的子孙节点
   所以根节点如果有 effectTag 则不会被包含进来
   所以这里将有 effectTag 的根节点插入到 effectList 尾部
   这样才能保证有 effect 的 fiber 都在 effectList 中

#### before mutation 阶段（执行 DOM 操作前）

1. 整个过程就是遍历 effectList 并调用 commitBeforeMutationEffects 函数处理。
2. 调用 getSnapshotBeforeUpdate 生命周期钩子。

新的 react 中 render 阶段的任务可能中断/重新开始，对应的组件在 render 阶段的生命周期钩子（即 componentWillXXX）可能触发多次。
所以标记为 UNSAFE，React 提供了替代的生命周期钩子 getSnapshotBeforeUpdate（同步）。

3. 调度 useEffect。分配何时执行最终在 Layout 阶段完成后再异步执行。

   1. before mutation 阶段在 scheduleCallback 中调度 flushPassiveEffects
   2. layout 阶段之后将 effectList 赋值给 rootWithPendingPassiveEffects
   3. scheduleCallback 触发 flushPassiveEffects，flushPassiveEffects 内部遍历 rootWithPendingPassiveEffects

useEffect 异步执行的原因主要是防止同步执行时阻塞浏览器渲染

#### mutation 阶段（执行 DOM 操作）

遍历 effectList，对每个 Fiber 节点执行如下三个操作：

1. 根据 ContentReset effectTag 重置文字节点
2. 更新 ref
3. 根据 effectTag 分别处理 插入 DOM、更新 DOM、删除 DOM

Placement 时

1. 获取父级 DOM 节点
2. 获取 Fiber 节点的 DOM 兄弟节点
3. 根据 DOM 兄弟节点和父级节点执行插入操作。

Update 时

1. 会执行 useLayoutEffect hook 销毁函数

Deletion 时

1. 递归 componentWillUnmount 生命周期钩子， 从页面移除 Fiber 节点对应 DOM 节点
2. 解绑 ref
3. 调度 useEffect 的销毁函数

#### layout 阶段（执行 DOM 操作后）

1. 对于 ClassComponent，他会通过 current === null?区分是 mount 还是 update，调用 componentDidMount 或 componentDidUpdate 。
2. 触发状态更新的 this.setState 如果赋值了第二个参数回调函数，也会在此时调用。
3. current Fiber 树切换
