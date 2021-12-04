import { writable, Writable } from 'svelte/store'

export enum FormIDs {
  ChangeEmail,
  ChangePassword,
  ChangeName
}

type SettingsFormState = {
  isEditing: FormIDs|null
}


const store: Writable<SettingsFormState> = writable({
  isEditing: null
})
export default store