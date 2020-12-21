const DB_NAME = 'CSplan'
const DB_VER = 1
let cachedIDB: IDBDatabase|null = null

interface keyedObject {
  id: string
}

// Get an IDBDatabase instance to request transactions
export function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (cachedIDB instanceof IDBDatabase) {
      resolve(cachedIDB)
    }

    const req = indexedDB.open(DB_NAME, DB_VER)

    req.onupgradeneeded = () => {
      const db = req.result
      // Keys store is indexed by id
      db.createObjectStore('keys', { keyPath: 'id', autoIncrement: false })
      db.createObjectStore('lists', { keyPath: 'id', autoIncrement: false })
      db.createObjectStore('tags', { keyPath: 'id', autoIncrement: false })
    }

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      cachedIDB = req.result
      resolve(req.result)
    }
  })
}

export async function addToStore(storeName: string, data: keyedObject): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.add(data)
    
    req.onerror = () => {
      reject(req.error)
    } 
    req.onsuccess = () => {
      resolve()
    }
  })
}

// Clear a specified object store
export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.clear()

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve()
    }
  })
}

// Retrieve a record from an object store by key
export async function getByKey(storeName: string, key: string): Promise<keyedObject> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName)
    const req: IDBRequest<keyedObject> = store.get(key)

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

// Update an object store's record with an object including a key
export async function updateWithKey(storeName: string, data: keyedObject): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.put(data)

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve()
    }
  })
}

// Delete a record from an object store
export async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.delete(key)

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}
