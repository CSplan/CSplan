const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

function dateField(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Format a date: Jan. 01, 1970 - 00:00 */
export function formatDate(d: Date): string {
  const hours = dateField(d.getHours())
  const minutes = dateField(d.getMinutes())
  const month = months[d.getMonth()]
  const date = dateField(d.getDate())
  const year = d.getFullYear() // padding is not going to be a problem soon enough for me to care
  return `${month}. ${date}, ${year} - ${hours}:${minutes}`
}