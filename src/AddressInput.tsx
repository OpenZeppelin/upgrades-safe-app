import React, { useState, useEffect } from 'react'
import { TextField } from '@gnosis.pm/safe-react-components'
import { Validator, Input } from './types'
import Address from './Address'
import { Err } from './Result'

interface Props {
  name: string
  label: string
  input: Input
}


export const AddressInput: React.FC<Props> = ({ name, label, input }) => {
  return <div>
    <TextField
      id={ `${name}-address` }
      label={ label }
      value={ input.address }
      meta={ input.meta }
      style={{ marginTop: 10 }}
      onChange={e => input.setAddress(e.target.value)}
    />
  </div>
}


export const useAddressInput = (validate: Validator) : Input => {
  const [address, setAddress] = useState<string>('')
  const [isValid, setValid] = useState<boolean>(true)
  const [meta, setMeta] = useState<object>({})

  useEffect(() => {
    (async () => {
      if (! address) return

      const addressResult = Address.parse(address)

      if (addressResult instanceof Err) {
        setValid(false)
        setMeta({ error: addressResult.error })
        return
      }

      const validationResult = await validate(addressResult.value)

      if (validationResult instanceof Err) {
        setValid(false)
        setMeta({ error: validationResult.error })
        return
      }

      setValid(true)
      setMeta({})
    })()
  }, [address])

  return { address, setAddress, isValid, meta }
}
