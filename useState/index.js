
/**
 * workInProgressHook为单线链表，记录每次工作中useState调用 ,next指向下一次的useState
 */
let isMount = true; //Mount还是Update
let workInProgressHook = null; //保存当前的hook
/**
 * 保存当前节点/操作的hook/...
 */
const fiber = {
  startNode: App, //当前组件(当前函数)
  memoizedState: null, //保存hooks的数据(链表即 workInProgressHook ),如果是Class则保存this.state
};
/**
 *
 * @param {any} init 初始值
 */
const useState = init => {
  let hook; //确定当前执行的hook
  if (isMount) {
    //首次渲染需要自创建一个hook
    hook = {
      memoizedState: init, //保存当前执行hook初始的值
      next: null, //指向下一个hook
      queue: { pending: null }, //保存改变之后新的状态（环状链表）
    };
    //
    if (!fiber.memoizedState) {
      //只有一个useState的情况
      /**
       * let [count, setCount] = useState(0);
       */
      fiber.memoizedState = hook; //更新当前fiber节点信息
    } else {
      //多个useState的情况
      /**
       * let [count, setCount] = useState(0);
       * let [num, setNum] = useState(0);
       * 第一次在 schedule 中 workInProgressHook = fiber.memoizedState
       * 所以处理多个时，将后续挂到next上
       */
      workInProgressHook.next = hook; //将hook插入workInProgressHook链表的下一个，链接之前创建的useState和刚创建的useState
    }
    workInProgressHook = hook; //全局指针指向当前创建的hook
  } else {
    /**
     * 更新时, hook无需自创建，直接取全局hook
     * 移动workInProgressHook指针
     * 1、当前hook指向全局hook
     * 2、全局hook指向下一个hook
     */
    //
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  /**
   * 以上逻辑可以取到当前useState保存的数据
   *
   *
   *
   *
   *
   * 处理 dispatchAction 之后再来进行
   */
  let baseState = hook.memoizedState; //update执行前的初始state
  if (hook.queue.pending) {
    /**
     * 调用时触发
     * 获取update环状单向链表中第一个update
     */
    let firstUpdate = hook.queue.pending.next; //拿到第一个update
    do {
      // 执行update action
      const action = firstUpdate.action; //每一次执行的函数，即更新state的具体操作例如： setCount(count => count + 1)
      baseState = action(baseState); //拿到函数执行之后的新state，新的状态又被作为老的状态存储，即下一次操作的目标state
      firstUpdate = firstUpdate.next; //更新执行下一个setCount，firstUpdate指向他的next
    } while (firstUpdate !== hook.queue.pending.next); //每次触发的Update只要不是第一个Update就跳出，否则循环执行
    hook.queue.pending = null; // 清空queue.pending链表
    hook.memoizedState = baseState; //将update action执行完后的state作为memoizedState
  }
  /**
   * bind() 的另一个最简单的用法是使一个函数拥有预设的初始参数。只要将这些参数（如果有的话）作为 bind() 的参数写在 this 后面。
   * 当绑定函数被调用时，这些参数会被插入到目标函数的参数列表的开始位置，传递给绑定函数的参数会跟在它们后面。
   */
  //偏函数 ：bind将hook.queue提前作为第一个参数进行传入
  return [baseState, dispatchAction.bind(null, hook.queue)];
};

//useState 返回的第二个函数
/**
 *
 * @param {Object} queue 当前处理的hook
 * @param {Function} action 改变state的 函数/值
 */
const dispatchAction = (queue, action) => {
  /**
   * 也会存在多个setCount进行调用，也需要next形成链表，
   * 但是保存为环状链表（优先级不一样）,每次创建的update即最后一个调用
   */
  const update = {
    //记一次更新
    //  环状链表 真实react，计算新的state,每次update更新是有优先级，点击更新高于ajax更新
    //创建的update即最后一个update
    action,
    next: null, //指向下一个update
  };
  /**
   * 函数调用时：
   * setData() {
            setCount(count => count + 1); queue.pending == null 时触发
            setCount(count => count + 1); else 时触发
            setCount(count => count + 1); else 时触发
         }
   */
  if (queue.pending == null) {
    /**
     * 第一次触发更新，queue.pending为初始值null
     * u0->u0->u0
     */
    update.next = update;
  } else {
    /**
     * 多次调用
     * 类似一个函数中多次执行
     *
     * 目标：
     * u1->u0->u1
     * u2->u0->u1->u2
     * u3->u0->u1->u2->u3
     *queue.pending 保存最后一个 update
     *queue.pending.next 保存第一个 update
     *
     * 实现：
     *
     * 1、此时update为正在处理的update
     *    此时queue.pending即上一次更新的update,因为update.next = update所以queue.pending.next也为update
     *
     * 1、调整queue.pending.next方向，指向当前的update，作为下一次的上一次更新，即达成环状链表
     */
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  /**
   * 第一次：queue.pending = u0
   * 多次：queue.pending = u1，保存每次的update到queue.pending
   */
  queue.pending = update;
  schedule();
};
//调度
const schedule = () => {
  // 更新前将workInProgressHook重置为fiber保存的第一个Hook
  workInProgressHook = fiber.memoizedState;
  const app = fiber.startNode();
  isMount = false;
  return app;
};
/*********************************************************
 */
function App() {
  let [count, setCount] = useState(5);
  let [num, setNum] = useState(10);
  console.log("isMount?:", isMount, "count:", count, "num:", num);
  let setDate1 = () => {
    setCount(count => count + 1);
    setCount(count => count + 1);
    setNum(num => num - 1);
  };
  let setDate2 = () => {
    setNum(count => count + 1);
    setNum(count => count + 1);
    setCount(count => count - 1);
  };
  return {
    setDate1,
    setDate2,
  };
}
window.app = schedule();
​