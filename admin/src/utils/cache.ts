class Node {
  key: string | null;
  value: unknown | null;
  next: Node | null;
  prev: Node | null;

  constructor(
    key: string | null = null,
    value: unknown | null = null,
    next: Node | null = null,
    prev: Node | null = null,
  ) {
    this.key = key;
    this.value = value;
    this.next = next;
    this.prev = prev;
  }
}

export class LRUCache {
  #size: number = 0;
  #capacity: number = 0;
  #cache: Record<string, Node>;
  #head: Node;
  #tail: Node;

  constructor(
    capacity: number = 50,
    cache: Record<string, Node> = {},
    head: Node = new Node(), // lru
    tail: Node = new Node(), // mru
  ) {
    this.#capacity = capacity;
    this.#cache = cache;
    this.#head = head;
    this.#tail = tail;
  }

  /**
   * Add a key-value pair to the cache.
   * @param key - The key for the value.
   * @param value - The value to store.
   */
  put(key: string, value: unknown): void {
    let node = this.#cache[key];

    if (node) {
      node.value = value;
      this.promote(node);
    } else {
      node = new Node(key, value);
      this.append(node);
    }
  }

  /**
   * Retrieve a value by its key.
   * @param key - The key to look up.
   * @returns The value associated with the key, or -1 if not found.
   */
  get(key: string): unknown {
    const node = this.#cache[key];

    if (!node) return -1;

    this.promote(node);

    return node.value;
  }

  /**
   * Promote a node to the most recently used position.
   * @param node - The node to promote.
   */
  private promote(node: Node): void {
    this.evict(node);
    this.append(node);
  }

  /**
   * Append a node to the end of the cache.
   * @param node - The node to append.
   */
  private append(node: Node): void {
    this.#cache[node.key!] = node;

    if (!this.#head.next) {
      this.#head.next = node;
      this.#tail.prev = node;
      node.prev = this.#head;
      node.next = this.#tail;
    } else {
      const oldTail = this.#tail.prev!;
      oldTail.next = node;
      node.prev = oldTail;
      node.next = this.#tail;
      this.#tail.prev = node;
    }

    this.#size += 1;

    if (this.#size > this.#capacity) {
      this.evict(this.#head.next!);
    }
  }

  /**
   * Remove a node from the cache.
   * @param node - The node to remove.
   */
  private evict(node: Node): void {
    delete this.#cache[node.key!];
    this.#size -= 1;

    if (this.#head.next === node && this.#tail.prev === node) {
      this.#head.next = null;
      this.#tail.prev = null;
      this.#size = 0;
      return;
    }

    if (this.#head.next === node) {
      this.#head.next = node.next;
      node.next!.prev = this.#head;
      return;
    }

    if (this.#tail.prev === node) {
      this.#tail.prev = node.prev;
      node.prev!.next = this.#tail;
      return;
    }

    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  serialize(): string {
    const serializedCache: { key: string; value: unknown }[] = [];
    let current = this.#head.next;

    while (current && current !== this.#tail) {
      serializedCache.push({ key: current.key!, value: current.value });
      current = current.next;
    }

    return JSON.stringify({
      capacity: this.#capacity,
      size: this.#size,
      cache: serializedCache,
    });
  }

  static restore(data: {
    capacity: number;
    size: number;
    cache: { key: string; value: unknown }[];
  }): LRUCache {
    const restoredCache = new LRUCache(data?.capacity);

    data?.cache?.forEach(({ key, value }) => {
      restoredCache.put(key, value);
    });

    return restoredCache;
  }
}
