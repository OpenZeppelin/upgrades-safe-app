import React, { useState, useEffect } from 'react'
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
              alt=""
              className={styles.blockie}
              onClick={ () => input.reset() }
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
  const [isValid, setValid] = useState<boolean | undefined>(undefined)
  const [error, setError] = useState<string>('')

  const reset = () => {
    setAddress('')
    setIsAddress(false)
    setValid(undefined)
    setError('')
  }

  useEffect(() => {
    (async () => {
      if (! address) return

      const addressResult = Address.parse(address)

      if (addressResult.isErr()) {
        setValid(false)
        setError(addressResult.error)
        setIsAddress(false)
        return
      }

      const validationResult = await validate(addressResult.value)

      if (validationResult.isErr()) {
        setIsAddress(true)
        setValid(false)
        setError(validationResult.error)
        return
      }

      setIsAddress(true)
      setValid(true)
      setError('')
    })()
  }, [address])

  return { address, setAddress, isValid, isAddress, error, reset }
}
