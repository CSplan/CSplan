// The database name
const DB_NAME = 'CSplan'
// The current database version, increment by 1 to trigger a db upgrade
const DB_VER = 4
// Stores that will be deleted on database upgrade
const clearStoresOnUpgrade = [
  'stripe/customer-id',
  'tags',
  'user-name',
  'user-profile-picture',
  'tags',
  'lists'
] as const

let cachedIDB: IDBDatabase|null = null

const enum Scopes {
  All,
  User
}

type StoreTemplate = {
  scope: Scopes
  options: IDBObjectStoreParameters
}

const stores: { [name: string]: StoreTemplate } = {
  keys: {
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  lists: {
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  tags: {
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  'user/profile-picture': {
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  'user/name': {
    scope: Scopes.User,
    options: {
      keyPath: 'id',
      autoIncrement: false
    }
  },
  'stripe/customer-id': {
    scope: Scopes.User,
    options: {
      keyPath: 'userID',
      autoIncrement: false
    }
  },
  'stripe/invoice': {
    scope: Scopes.User,
    options: {
      keyPath: 'userID',
      autoIncrement: false
    }
  }
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
      // Create stores from the declared templates
      for (const name in clearStoresOnUpgrade) {
        if (db.objectStoreNames.contains(name)) {
          db.deleteObjectStore(name)
        }
      }
      for (const name in stores) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, stores[name].options)
        }
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

export async function addToStore<K>(storeName: string, data: KeyedObject<K extends string ? K : 'id'>): Promise<void> {
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
export async function getByKey<T, K = unknown>(storeName: string, key: string): Promise<(KeyedObject<K extends string ? K : 'id'> & T)|undefined> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName)
    const req: IDBRequest<KeyedObject<K extends string ? K : 'id'> & T> = store.get(key)

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

// Call getByKey, reject with an error message if result is undefined
export async function mustGetByKey<T, K = unknown>(storeName: string, key: string): Promise<KeyedObject<K extends string ? K : 'id'> & T> {
  const result = await getByKey<T, K>(storeName, key)!
  if (result === undefined) {
    throw new Error(`IDB error - resource expected but not found (store \`${storeName}\`, key \`${key}\`)`)
  }
  return result
}

// Delete a record from an object store
export async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.delete(key)

    req.onerror = () => {
      reject(`Failed to delete from IDB store ${storeName}: ${req.error}`)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

export async function clearAll(): Promise<void> {
  for (const name in  stores) {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(name)

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