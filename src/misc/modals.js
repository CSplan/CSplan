// Base function extended for toggling modals
export function toggleModal(el) {
  el.checked = !el.checked
  // Handle escape key presses to exit modal
  if (el.checked) {
    document.addEventListener('keydown', (evt) => {
      modalKeydown(evt, el)
    })
  } else {
    document.removeEventListener('keydown', (evt) => {
      modalKeydown(evt, el)
    })
  }
}

function modalKeydown(evt, el) {
  if (evt.key === 'Escape') {
    toggleModal(el)
  }
}
