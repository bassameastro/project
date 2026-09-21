export const dataStructurePseudocode = {
  array: {
    create: ['procedure CreateArray(values)', '    arr ← []', '    for each value in values', '        arr.push(value)', '    end for', 'end procedure'],
    insert: ['procedure InsertAt(arr, value, index)', '    arr.splice(index, 0, value)', 'end procedure'],
    remove: ['procedure RemoveAt(arr, index)', '    arr.splice(index, 1)', 'end procedure'],
    update: ['procedure UpdateAt(arr, value, index)', '    arr[index] ← value', 'end procedure'],
  },
  stack: {
    push: ['procedure Push(stack, value)', '    stack.push(value)', 'end procedure'],
    pop: ['procedure Pop(stack)', '    if stack is not empty', '        value ← stack.pop()', '    end if', 'end procedure'],
  },
  queue: {
    add: ['procedure Enqueue(queue, value)', '    queue.push(value)', 'end procedure'],
    remove: ['procedure Dequeue(queue)', '    if queue is not empty', '        front ← queue.shift()', '    end if', 'end procedure'],
  },
  'linked-list': {
    addHead: ['procedure AddHead(list, value)', '    node ← new Node(value)', '    node.next ← list.head', '    list.head ← node', 'end procedure'],
    addTail: ['procedure AddTail(list, value)', '    node ← new Node(value)', '    list.tail.next ← node', '    list.tail ← node', 'end procedure'],
    removeHead: ['procedure RemoveHead(list)', '    if list.head exists', '        list.head ← list.head.next', '    end if', 'end procedure'],
    removeTail: ['procedure RemoveTail(list)', '    if list.tail exists', '        previous ← last node before tail', '        previous.next ← null', '        list.tail ← previous', '    end if', 'end procedure'],
  },
  tree: {
    insert: ['procedure Insert(node, key)', '    if node is null', '        node ← new TreeNode(key)', '    else if key < node.key', '        Insert(node.left, key)', '    else', '        Insert(node.right, key)', '    end if', 'end procedure'],
    remove: ['procedure Remove(node, key)', '    if node is null', '        return', '    else if key < node.key', '        Remove(node.left, key)', '    else if key > node.key', '        Remove(node.right, key)', '    else', '        Reconnect child or leaf', '    end if', 'end procedure'],
  },
};
