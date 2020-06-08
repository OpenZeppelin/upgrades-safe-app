
export const isEmpty = (s: string) : boolean => {
  return s.length === 0
}

export const hasBytecode = (code: string) : boolean => {
  return code !== '0x'
}
