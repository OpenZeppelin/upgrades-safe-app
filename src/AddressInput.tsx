import React, { useState, useEffect } from 'react'
import { TextField } from '@gnosis.pm/safe-react-components'
import { AddressValidator, Input } from './types'
import Address from './ethereum/Address'
import styles from './css/style.module.css';

interface Props {
  name: string
  label: string
  input: Input
}

interface MetaData {
  error?: string
}

export const AddressInput: React.FC<Props> = ({ name, label, input }) => {
  if (input.address===""){
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
  else {
    return <div>
      <h5>New implementation address</h5>
      <div className={styles.input}>
        <div className={styles.address}>
          <img className={styles.blockie} src='/blockie.png' />
          <p>0xLc0AC4de5BBE235135E67ba58bDe41d4d863f6B8</p>
        </div>
      </div>
    </div>
  }
}


export const useAddressInput = (validate: AddressValidator) : Input => {
  const [address, setAddress] = useState<string>('')
  const [isValid, setValid] = useState<boolean>(true)
  const [meta, setMeta] = useState<MetaData>({})

  useEffect(() => {
    (async () => {
      if (! address) return

      const addressResult = Address.parse(address)

      if (addressResult.isErr()) {
        setValid(false)
        setMeta({ error: addressResult.error })
        return
      }

      const validationResult = await validate(addressResult.value)

      if (validationResult.isErr()) {
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
