import React, { useState, useEffect } from 'react'
import { TextField } from '@gnosis.pm/safe-react-components'

interface Props {
  name: string
  label: string
  value: string
  setValue(value: string) : void
  setValid(valid: boolean) : void
  validate(address: string) : Promise<boolean>
}

const AddressInput : React.FC<Props> = ({ name, label, value, setValue, setValid, validate }) => {
  const [meta, setMeta] = useState<object>({})

  useEffect(() => {
    (async () => {
      try {
        if (! value) return
        await validate(value)
        setValid(true)
        setMeta({})
      } catch (e) {
        setValid(false)
        setMeta({ error: e.message })
      }
    })()
  }, [value, validate, setValid])

  return <div>
    <TextField
      id={ `${name}-address` }
      label={ label }
      value={ value }
      meta={ meta }
      style={{ marginTop: 10 }}
      onChange={e => setValue(e.target.value)}
    />
  </div>
}

export default AddressInput