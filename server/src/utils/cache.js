class Node {
  constructor(
    key = null,
    value = null,
    next = null,
    prev = null,
  ) {
    this.key = key;
    this.value = value;
    this.next = next;
    this.prev = prev;
  }
}

export class LRUCache {
  #size = 0;
  #capacity = undefined;

  #cache = {};
  #head = null;
  #tail = null;

  constructor(
    capacity = 100,
    cache = {},
    head = new Node(), // lru
    tail = new Node(), // mru
  ) {
    this.#capacity = capacity;
    this.#cache = cache;
    this.#head = head;
    this.#tail = tail;
  }

  put(key, value) {
    let node = this.#cache[key];

    if (node) {
      node.value = value;

      this.promote(node);
    } else {
      node = new Node(key, value);
      this.append(node);
    }
  }

  get(key) {
    const node = this.#cache[key];

    if (!node) return -1;

    this.promote(node);

    return node.value;
  }

  promote(node) {
    this.evict(node);
    this.append(node);
  }

  append(node) {
    this.#cache[node.key] = node;

    if (!this.#head.next) {
      this.#head.next = node;
      this.#tail.prev = node;
      node.prev = this.#head;
      node.next = this.#tail;
    } else {
      const oldTail = this.#tail.prev;
      oldTail.next = node;
      node.prev = oldTail;
      node.next = this.#tail;
      this.#tail.prev = node;
    }

    this.#size += 1;

    if (this.#size > this.#capacity) {
      this.evict(this.#head.next);
    }
  }

  evict(node) {
    delete this.#cache[node.key];
    this.#size -= 1;

    if (this.#head.next === node && this.#tail.prev === node) {
      this.#head.next = null;
      this.#tail.prev = null;
      this.#size = 0;
      return;
    }

    if (this.#head.next === node) {
      this.#head.next = node.next;
      node.next.prev = this.#head;
      return;
    }

    if (this.#tail.prev === node) {
      this.#tail.prev = node.prev;
      node.prev.next = this.#tail;
      return;
    }

    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
}
