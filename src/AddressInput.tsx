import React, { useState, useEffect, useCallback } from 'react'
import { TextField } from '@gnosis.pm/safe-react-components'
import { Validator, Input } from './types'

interface Props {
  id: string
  label: string
  input: Input
}


export const AddressInput: React.FC<Props> = ({ input, ...props }) => {
  return <div>
    <TextField
      value={ input.address }
      meta={ input.meta }
      style={{ marginTop: 10 }}
      onChange={e => input.setAddress(e.target.value)}
      { ...props }
    />
  </div>
}


export const useAddressInput = (validate: Validator) : Input => {
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
