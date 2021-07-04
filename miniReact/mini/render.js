let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function render(element, container) {
  //渲染开始的入口
  wipRoot = {
    dom: container,
    props: { children: [element] },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot; //fiber
}

requestIdleCallback(workLoop);
/**
 * 被requestIdleCallback调用时会把IdleDeadline传入函数作为参数
 * 它提供了一个方法, 可以让你判断浏览器还剩余多少闲置时间可以用来执行耗时任务
 * 即timeRemaining()，由于fiber是以链表的形式，nextUnitOfWork代表自上而下的每一个节点
 * 的fiber,即保存了type、child、effectTag等属性，当为 mount时 alternate 为空，
 * 即没有可复用的元素，在 deadline 剩余时间还充裕时 nextUnitOfWork逐级互相交换，当 deadline
 * 的剩余时间小于1时，且元素深度便利结束后 跳出循环 进行渲染，当空闲时再次进行调度
 *
 * 当没有下一个 工作单元时 进行渲染操作
 */
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

function performUnitOfWork(fiber) {
  /**
   * 第一次fiber为div#root节点，props.children只有一个为 div 节点
   * 第二次fiber为div节点，props.children节点有三个分别为input、h1、hr
   * ...
   */
  if (!fiber.dom) fiber.dom = createDom(fiber); //根据type创建dom节点
  const elements = fiber.props.children; //当前元素下的所有同级节点
  /**
   * 计算是否变化给 fiber 打上 effectTag
   * 遍历如果有子节点则返回，进行下一次遍历
   * 遍历如果没有子节点，fiber 指向其父节点寻找兄弟节点进行返回，进行下一次遍历
   * 
  // 这个函数的返回值是下一个任务，这其实是一个深度优先遍历
  // 先找子元素，没有子元素了就找兄弟元素
  // 兄弟元素也没有了就返回父元素
  // 然后再找这个父元素的兄弟元素
  // 最后到根节点结束
  // 这个遍历的顺序其实就是从上到下，从左到右
   */
  reconcileChildren(fiber, elements);
  if (fiber.child) {
    return fiber.child;
  } else {
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
  }
}
function reconcileChildren(wipFiber, elements) {
  // reconcile 节点
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child; //更新时才会产生
  let prevSibling;
  console.error("-----------ele", wipFiber, elements);
  while (index < elements.length || oldFiber) {
    /**
     * 每次 while 拿到的是同一层的元素
     * elements 即 child 为数组,
     * oldFiber判断是更新触发还是首次触发,更新触发时为元素下所有节点
     */
    let newFiber;
    const element = elements[index];
    const sameType = oldFiber && element && element.type == oldFiber.type; //同一个标签节点
    console.log(`更新节点是否相同：${sameType}`, oldFiber, element);
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
     * 标签不存在了
     */
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) oldFiber = oldFiber.sibling;
    // 父级的child指向第一个子元素
    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      // 每个子元素拥有指向下一个子元素的指针
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
function createDom(fiber) {
  //创建dom
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  /**
   * 在 createTextElement 时，元素节点type为其标签
   * 文本节点type为"TEXT_ELEMENT"，第一次updateDom时
   * 全为添加属性，故 prevProps 置为空对象
   */
  updateDom(dom, {}, fiber.props);
  return dom;
}
const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];

function updateDom(dom, prevProps, nextProps) {
  //更新节点属性
  /**
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
/**
 * 拿到 fiber 树根据EffectTag的值进行不同操作的渲染
 * 最终'双缓存'中页面的树指向重新渲染完成的树，
 * 内存的树清空，等待下一次更新
 */
function commitRoot() {
  //commit阶段
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  //操作真实dom
  if (!fiber) return;
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
export default render;
