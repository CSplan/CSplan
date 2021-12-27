# CSplan
Frontend for CSplan.

## Roadmap
- [x] Tag state management
- [x] Color Picker
- [x] Tag color management
- [x] Ability to tag list items
- [x] Authentication using argon2
- [x] Editing/view modes for lists

- [x] Make default click behavior for lists going to the list page, only initiate drag and drop with dedicated side handle
- [x] Configure root div for list items as drag and drop receptacle (should not be contained within padded content area)

- [x] Advanced authkey + cryptokey configuration
- [x] Navigation bar
- [ ] Replace unintended object casts with proper typed assignments

### Settings
- [x] Profile Picture form
- [x] Profile picture visibilities
- [x] Password resets
- [x] First and last name form (includes display name + private display name)
- [x] First and last name visibilities
- [ ] Respect private display name
- [ ] Username form
- [x] TOTP form
- [ ] TOTP support in login form
- [ ] Master key export
- [ ] Session view/remote logout
- [ ] Delete account form

### Finalize Beta
- [ ] JSON exports
- [ ] Homepage
- [ ] Info pages
- [ ] Prerender profile picture
- [ ] SSR?
- [ ] Deploy beta!
More to come...

### Typescript + SCSS
Current progress for adding TypeScript and SCSS to components:
- [x] Auth (register + login)
- [x] Color picker
- [ ] Tag
- [ ] Title View (lists)
- [x] Todo List
- [ ] Navbar
- [ ] List and tag modals
