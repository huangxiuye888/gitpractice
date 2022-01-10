export const getFileNameAndTypeByDownloading = (response = {}, name, type) => {
  let suffix = null
  const { data, headers } = response
  const { 'content-disposition': cd, 'content-type': ct } = headers || {}

  if (cd && typeof name === 'undefined') [name, suffix] = cd.match(/(?<=;filename=).*(?=\.(.*))/) || {} || []
  if (ct) type = ct

  return [decodeURIComponent(name), type || suffix, data, suffix]
}

export const TYPES_DOWNLOAD = {
  DEFAULT: 'application/octet-stream',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
  XLS: 'application/vnd.ms-excel;charset=UTF-8'
}

export const downloadFile = (name, type, data, suffix) => {
  const blob = new Blob([data], { type: TYPES_DOWNLOAD[type.toUpperCase()] || type })
  const href = window.URL.createObjectURL(blob)
  const $a = document.createElement('a')
  $a.href = href
  $a.download = `${name}${suffix ? `.${suffix}` : ''}`
  document.body.appendChild($a)
  $a.click()
  document.body.removeChild($a)
  window.URL.revokeObjectURL(href)
}
