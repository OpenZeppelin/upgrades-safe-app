import React from 'react'

import { SafeProvider } from './types'
import { hasBytecode, isEmpty } from './utils'
import { getCode, buildTransaction } from './EthereumBridge'


import useAddressInput from './AddressInput'
import { Button, Title, Section, TextField } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'


interface Props {
  safe: SafeProvider
}


const DefenderSafe: React.FC<Props> = ({ safe }) => {

  const proxyInput = useAddressInput(async (address: string) => {
    const code = await getCode(address)
    console.log(address, code)
  })

  const proxyAdminInput = useAddressInput(async (address: string) => {
    const code = await getCode(address)
    console.log(address, code)
  })

  const newImplementationInput = useAddressInput(async (address: string) => {
    const code = await getCode(address)
    console.log(address, code)
    if (! hasBytecode(code)) throw new Error('New implementation has no bytecode')
  })

  const isNotEmpty = !isEmpty(proxyInput.address) && !isEmpty(newImplementationInput.address)
  const inputsAreValid = proxyInput.isValid && newImplementationInput.isValid && proxyAdminInput.isValid
  const isFormValid = isNotEmpty && inputsAreValid

  const sendTransaction = () : void => {
    const tx = buildTransaction(proxyInput.address, newImplementationInput.address, proxyAdminInput.address)
    safe.sdk.sendTransactions([tx])
  }

  return (
    <ThemeProvider theme={theme}>
      <WidgetWrapper>
        <Title size='xs'>Upgrade proxy implementation</Title>

        <Section>
          <div>
            <TextField
              id='proxy-address'
              label='Proxy address'
              value={ proxyInput.address }
              meta={ proxyInput.meta }
              style={{ marginTop: 10 }}
              onChange={e => proxyInput.setAddress(e.target.value)}
            />
          </div>

          <div>
            <TextField
              id='new-implementation-address'
              label='New implementation address'
              value={ newImplementationInput.address }
              meta={ newImplementationInput.meta }
              style={{ marginTop: 10 }}
              onChange={e => newImplementationInput.setAddress(e.target.value)}
            />
          </div>

          <div>
            <TextField
              id='proxy-admin-address'
              label='Proxy admin address (optional)'
              value={ proxyAdminInput.address }
              meta={ proxyAdminInput.meta }
              style={{ marginTop: 10 }}
              onChange={e => proxyAdminInput.setAddress(e.target.value)}
            />
          </div>
        </Section>

        <ButtonContainer>
          <Button
            size='lg'
            color='primary'
            variant='contained'
            onClick={ sendTransaction }
            disabled={ ! isFormValid }
          >
            Propose upgrade
          </Button>
        </ButtonContainer>
      </WidgetWrapper>
    </ThemeProvider>
  )
}


export default DefenderSafe
