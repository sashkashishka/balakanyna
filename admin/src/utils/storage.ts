class SafeStorage {
  constructor(private storage: Storage) {}

  setItem(key: string, value: unknown) {
    try {
      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting item '${key}' in sessionStorage:`, error);
    }
  }

  getItem(key: string) {
    try {
      const value = this.storage.getItem(key);
      return value && (this.isJSON(value) ? JSON.parse(value) : value);
    } catch (error) {
      console.error(`Error getting item '${key}' from sessionStorage:`, error);
      return null;
    }
  }

  removeItem(key: string) {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item '${key}' from sessionStorage:`, error);
    }
  }

  clear() {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  isJSON(str: string) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}

export const safeSS = new SafeStorage(window.sessionStorage);
export const safeLS = new SafeStorage(window.localStorage);
