const DB_NAME = 'CSplan'
const DB_VER = 1
let cachedIDB: IDBDatabase|null = null

const enum Scopes {
  All,
  User
}

type StoreTemplate = {
  name: string
  scope: Scopes
  options: IDBObjectStoreParameters
}

const stores: StoreTemplate[] = [
  {
    name: 'keys',
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  {
    name: 'lists',
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  {
    name: 'tags',
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  {
    name: 'user-profile-picture',
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  }
]

// Get an IDBDatabase instance to request transactions
export function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (cachedIDB instanceof IDBDatabase) {
      resolve(cachedIDB)
    }

    const req = indexedDB.open(DB_NAME, DB_VER)

    req.onupgradeneeded = () => {
      const db = req.result
      // Create stores from the declared templates
      for (const store of stores) {
        db.createObjectStore(store.name, store.options)
      }
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

export async function addToStore(storeName: string, data: KeyedObject): Promise<void> {
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

// Clear all stores containing user information
export async function clearUserStores(): Promise<void> {
  for (const store of stores) {
    if (store.scope === Scopes.User) {
      await clearStore(store.name)
    }
  }
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
export async function getByKey<T>(storeName: string, key: string): Promise<KeyedObject & T> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName)
    const req: IDBRequest<KeyedObject & T> = store.get(key)

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

// Call getByKey, reject with an error message if result is undefined
export async function mustGetByKey<T>(storeName: string, key: string): Promise<KeyedObject & T> {
  const result = await getByKey<T>(storeName, key)
  if (result === undefined) {
    throw new Error(`IDB error - resource expected but not found (store \`${storeName}\`, key \`${key}\`)`)
  }
  return result
}

// Update an object store's record with an object including a key
export async function updateWithKey(storeName: string, data: KeyedObject): Promise<void> {
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

export async function clearAll(): Promise<void> {
  for (const store of stores) {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(store.name)

      req.onerror = () => {
        console.error(req.error)
        reject(req.error)
      }
      req.onsuccess = () => {
        resolve()
      }
    })
  }
}