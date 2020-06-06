import { useState, useEffect, useCallback } from 'react'


const useAddressInput = (validate: (address: string) => void) => {
  const [address, setAddress] = useState<string>('')
  const [isValid, setValid] = useState<boolean>(true)
  const [meta, setMeta] = useState<object>({})

  const _isValid = useCallback(validate, [address])

  useEffect(() => {
    (async () => {
      try {
        if (! address) return
        await _isValid(address)
        setValid(true)
        setMeta({})
      } catch (e) {
        setValid(false)
        setMeta({ error: e.message })
      }
    })()
  }, [address, _isValid])

  return { address, setAddress, isValid, meta }
}

export default useAddressInput