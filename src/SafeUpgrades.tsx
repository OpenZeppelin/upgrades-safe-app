import React from 'react'

import { SafeProvider } from './types'
import { hasBytecode, isEmpty } from './utils'
import { getCode, buildTransaction } from './EthereumBridge'


import { AddressInput, useAddressInput } from './AddressInput'
import { Button, Title, Section } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'


interface Props {
  safe: SafeProvider
}


const SafeUpgrades: React.FC<Props> = ({ safe }) => {

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

          <AddressInput
            id='proxy-address'
            label='Proxy address'
            input={ proxyInput }
          />

          <AddressInput
            id='new-implementation-address'
            label='New implementation address'
            input={ newImplementationInput }
          />

          <AddressInput
            id='proxy-admin-address'
            label='Proxy admin address (optional)'
            input={ proxyAdminInput }
          />

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


export default SafeUpgrades
