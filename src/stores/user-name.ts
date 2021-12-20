import { aes, rsa } from 'cs-crypto'
import { getUserID } from '$lib/session'
import { Readable, writable } from 'svelte/store'
import { HTTPerror, NamePreferences, Visibilities } from '$lib'
import { route } from 'core'
import { mustGetByKey, addToStore } from '$db'


function create(): Readable<Name> & NameStore {
  let initialized = false
  const initialState: Name = {
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    publicNamePreference: NamePreferences.Anonymous,
    visibility: {
      firstName: Visibilities.Encrypted,
      lastName: Visibilities.Encrypted,
      username: Visibilities.Encrypted
    },
    checksum: ''
  }
  const { subscribe, set }  = writable(initialState)

  return {
    subscribe,
    async init() {
      if (initialized) {
        return
      }

      initialized = true

    },
    async create(name: NameData): Promise<void> {
      // Validate the name
      if (typeof name !== 'object') {
        throw new TypeError(`Expected type object, received type ${typeof name}`)
      }
      // Get the user's ID
      const userID = getUserID()

      // Generate a crypto key if there are any fields that need to be encrypted
      const encryptUsername = name.visibility.username === Visibilities.Encrypted
      const encryptFirstName = name.visibility.firstName === Visibilities.Encrypted
      const encryptLastName = name.visibility.lastName === Visibilities.Encrypted
      const hasEncryptedFields = encryptFirstName || encryptLastName || encryptUsername || name.namePreference != null
      let cryptoKey: CryptoKey|undefined
      if (hasEncryptedFields) {
        cryptoKey = await aes.generateKey('AES-GCM')
      } 
      // Encrypt any necessary fields
      let firstName: string, lastName: string, username: string, encryptedNamePreference: string|undefined
      if (encryptFirstName) {
        firstName = await aes.encrypt(name.firstName, cryptoKey!)
      } else {
        firstName = name.firstName
      }
      if (encryptLastName) {
        lastName = await aes.encrypt(name.lastName, cryptoKey!)
      } else {
        lastName = name.lastName
      }
      if (encryptUsername) {
        username = await aes.encrypt(name.username, cryptoKey!)
      } else {
        username = name.username
      }
      if (name.namePreference != null){
        encryptedNamePreference = await aes.encrypt(name.namePreference.toString(), cryptoKey!)
      }

      // Encrypt the cryptokey
      let encryptedKey: string|null
      if (cryptoKey != null) {
        const { publicKey } = await mustGetByKey<MasterKeys>('keys', userID)
        encryptedKey = await rsa.wrapKey(cryptoKey!, publicKey)
      } else {
        encryptedKey = null
      }

      // Submit the document to the API
      const res = await fetch(route('/name'), {
        method: 'PUT',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(<NameDocument<NameMetaRequest>>{
          firstName,
          lastName,
          username,
          namePreference: encryptedNamePreference,
          visibility: name.visibility,
          meta: {
            cryptoKey: encryptedKey
          }
        })
      })
      if (res.status !== 200) {
        throw new Error(await HTTPerror(res, 'failed to submit name to server'))
      }

      // Update local state and IDB
      const { meta }: MetaResponse = await res.json()
      const final: Name = {
        ...name,
        id: userID,
        checksum: meta.checksum,
        cryptoKey
      }
      set(final)
      await addToStore('user-name', final)
      initialized = true
    },
    async delete(): Promise<void> {
      const res = await fetch(route('/name'), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': localStorage.getItem('CSRF-Token')!
        }
      })
      if (res.status !== 204) {
        throw new Error(await HTTPerror(res, 'failed to delete name from server'))
      }
    }
  }
}

export const userName = create()

export default userName