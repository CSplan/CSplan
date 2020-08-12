const DB_NAME = 'CSplan'
const DB_VER = 1
let db

/**
 * Get an IDBDatabase instance to request transactions
 * @returns {Promise<IDBDatabase>} IDBDatabase
 */
function getDB() {
  return new Promise((resolve, reject) => {
    if (db instanceof IDBDatabase) {
      resolve(db)
    }

    const req = indexedDB.open(DB_NAME, DB_VER)

    req.addEventListener('upgradeneeded', () => {
      db = req.result
      // Keys store is indexed by id
      db.createObjectStore('keys', { keyPath: 'id' })
      db.createObjectStore('lists', { keyPath: 'id' })
      resolve(db)
    })

    req.addEventListener('error', () => {
      reject(req.error)
    })

    req.addEventListener('success', () => {
      db = req.result
      resolve(req.result)
    })
  })
}

/**
 * @param {string} storeName 
 * @param {object} data 
 */
function addToStore(storeName, data) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.add(data)
    
    req.addEventListener('error', () => {
      reject(req.error)
    })

    req.addEventListener('success', () => {
      resolve(req.result)
    })
  })
}

/**
 * Clear a specified object store
 * @param {string} storeName
 * @returns {Promise<void>}
 */
function clearStore(storeName) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.clear()

    req.addEventListener('error', () => {
      reject(req.error)
    })

    req.addEventListener('success', () => {
      resolve(req.result)
    })
  })
}

function getByKey(storeName, key) {
  return new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    const req = store.get(key)

    req.addEventListener('error', () => {
      reject(req.error)
    })

    req.addEventListener('success', () => {
      resolve(req.result)
    })
  })
}

export {
  getDB,
  addToStore,
  clearStore,
  getByKey
}
