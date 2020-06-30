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

export const AddressInput: React.FC<Props> = ({ name, label, input }) => {
  return <div>
    <h5>{ label }</h5>
    {
      input.isAddress

      ? <div>
        <div className={styles.input}>
          <div className={styles.address}>
            <img
              className={styles.blockie}
              onClick={ () => input.setAddress('') }
              src='/blockie.png'
            />
            <p>{ input.address }</p>
          </div>
        </div>
      </div>

      : <input
          id={ `${name}-address` }
          className={styles.input}
          type="text"
          value={ input.address }
          onChange={ e => input.setAddress(e.target.value) }
        />
    }
  </div>
}


export const useAddressInput = (validate: AddressValidator) : Input => {
  const [address, setAddress] = useState<string>('')
  const [isAddress, setIsAddress] = useState<boolean>(false)
  const [isValid, setValid] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    (async () => {
      setIsAddress(false)
      const addressResult = Address.parse(address)

      if (addressResult.isErr()) {
        setValid(false)
        setError(addressResult.error)
        return
      }

      setIsAddress(true)
      const validationResult = await validate(addressResult.value)

      if (validationResult.isErr()) {
        setValid(false)
        setError(validationResult.error)
        return
      }

      setValid(true)
      setError('')
    })()
  }, [address])

  return { address, setAddress, isValid, isAddress, error }
}
