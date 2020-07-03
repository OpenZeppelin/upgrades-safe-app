import React, { useState, useEffect } from 'react'
import { AddressValidator, Input } from './types'
import Address from './ethereum/Address'
import Blockies from 'react-blockies'
import styles from './css/style.module.css'

interface Props {
  name: string
  label: string
  input: Input
}

export const AddressInput: React.FC<Props> = ({ name, label, input }) => {
  const status = input.loading ? 'loading' : ( input.isValid ? 'success' : 'error' )

  return <div>
    <h5>{ label }</h5>
    {
      input.isAddress

      ? <div>
        <div className={styles.input}>
          <div className={styles.address}>
            <div className={styles.blockie}>
              <Blockies
                seed={ input.address.toLowerCase() }
                className="blockie"
                size={ 6 }
              />
            </div>

            <p>{ input.address }</p>

            <button
              onClick={ () => input.reset() }
              className={styles.delete}>
              <img src='ic_delete.svg' alt="reset input"/>
            </button>
          </div>

          <div className={styles[status]} title={input.error}></div>
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
  const [loading, setLoading] = useState<boolean>(false)

  const reset = () => {
    setAddress('')
    setIsAddress(false)
    setValid(undefined)
    setError('')
  }

  useEffect(() => {
    (async () => {
      if (! address) return
      setLoading(true)

      const addressResult = Address.parse(address)

      if (addressResult.isErr()) {
        setValid(false)
        setError(addressResult.error)
        setIsAddress(false)
        setLoading(false)
        return
      }

      setIsAddress(true)

      const validationResult = await validate(addressResult.value)

      if (validationResult.isErr()) {
        setIsAddress(true)
        setValid(false)
        setError(validationResult.error)
        setLoading(false)
        return
      }

      setValid(true)
      setError('')
      setLoading(false)
    })()
  }, [address])

  return { address, setAddress, isValid, isAddress, error, reset, loading }
}
