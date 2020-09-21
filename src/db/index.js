const DB_NAME = 'CSplan'
const DB_VER = 1
/** @type {IDBDatabase} */
let cachedIDB

/**
 * Get an IDBDatabase instance to request transactions
 * @returns {Promise<IDBDatabase>} IDBDatabase
 */
export function getDB() {
  return new Promise((resolve, reject) => {
    if (cachedIDB instanceof IDBDatabase) {
      resolve(cachedIDB)
    }

    const req = indexedDB.open(DB_NAME, DB_VER)

    req.onupgradeneeded = () => {
      cachedIDB = req.result
      // Keys store is indexed by id
      cachedIDB.createObjectStore('keys', { keyPath: 'id' })
      cachedIDB.createObjectStore('lists', { keyPath: 'id' })
      resolve(cachedIDB)
    }

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

/**
 * @param {string} storeName 
 * @param {object} data 
 */
export async function addToStore(storeName, data) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.add(data)
    
    req.onerror = () => {
      reject(req.error)
    } 
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

/**
 * Clear a specified object store
 * @param {string} storeName
 * @returns {Promise<void>}
 */
export async function clearStore(storeName) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.clear()

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

/**
 * Retrieve a record from an object store by key
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<object>}
 */
export async function getByKey(storeName, key) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readonly').objectStore(storeName)
    const req = store.get(key)

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

/**
 * Update an object store's record with an object including a key
 * @param {string} storeName 
 * @param {object} dataWithKey 
 * @returns {Promise<void>}
 */
export async function updateWithKey(storeName, dataWithKey) {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.put(dataWithKey)

    req.onerror = () => {
      reject(req.error)
    }
    req.onsuccess = () => {
      resolve(req.result)
    }
  })
}

/**
 * Delete a record from an object store
 * @param {string} storeName 
 * @param {string} key 
 * @returns {Promise<void>}
 */
export async function deleteFromStore(storeName, key) {
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
