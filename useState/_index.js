let isMount = true;
let workInProgressHook = null;
let fiber = {
  startNode: App,
  memoizedState: null,
};
const useState = init => {
  let hook;
  if (isMount) {
    hook = {
      memoizedState: init,
      next: null,
      queue: { pending: null },
    };
    if (fiber.memoizedState == null) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    workInProgressHook = hook;
  } else {
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }
  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    let firstUpdate = hook.queue.pending.next;
    do {
      let action = firstUpdate.action;
      baseState = action(baseState);
      let firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending.next);
    hook.queue.pending = null;
  }
  hook.memoizedState = baseState;
  return [baseState, dispatchAction.bind(null, hook.queue)];
};

let dispatchAction = (queue, action) => {
  let update = {
    action,
    next: null,
  };

  if (queue.pending == null) {
    update.next = update;
  } else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }

  queue.pending = update;
  schedule();
};

let schedule = () => {
  workInProgressHook = fiber.memoizedState;
  let app = fiber.startNode();
  isMount = false;
  return app;
};

function App() {
  let [num, setNum] = useState(5);
  let [count, setCount] = useState(15);
  console.log(isMount, num, count);
  let changeNum = setNum(num => num + 1);
  let changeCount = setCount(count => count - 1);
  return {
    changeNum,
    changeCount,
  };
}
window.app = schedule();
