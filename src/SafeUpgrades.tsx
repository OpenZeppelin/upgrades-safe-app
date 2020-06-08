import React, { useState } from 'react'

import { SafeProvider, Validation } from './types'
import { hasBytecode, isEmpty } from './utils'
import EthereumBridge from './EthereumBridge'
import { ok, err } from './Result'
import Address from './Address'


import { AddressInput, useAddressInput } from './AddressInput'
import { Button, Title, Section } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'


interface Props {
  safe: SafeProvider
}

const ethereumBridge = new EthereumBridge()

const SafeUpgrades: React.FC<Props> = ({ safe }) => {
  const [proxyAdmin, setProxyAdmin] = useState<string>('')
  const [currentImplementation, setCurrentImplementation] = useState<string>('')

  const proxyInput = useAddressInput(async (address: Address) : Promise<Validation> => {
    const proxy = await ethereumBridge.detect(address)

    if (proxy === null) return err('Contract is not an EIP 1967 compatible proxy')

    return ok(true)
  })

  const newImplementationInput = useAddressInput(async (address: Address) : Promise<Validation> => {
    const hasBytecode = await ethereumBridge.hasBytecode(address)
    if (! hasBytecode) return err('New implementation has no bytecode')

    return ok(true)
  })

  const isFormValid = proxyInput.isValid && newImplementationInput.isValid

  const sendTransaction = () : void => {
    const tx = ethereumBridge.buildUpgradeTransaction(proxyInput.address, newImplementationInput.address)
    safe.sdk.sendTransactions([tx])
  }

  return (
    <ThemeProvider theme={theme}>
      <WidgetWrapper>

        <Title size='xs'>Upgrade proxy implementation</Title>

        <Section>
          <AddressInput
            name='proxy'
            label='Proxy address'
            input={ proxyInput }
          />

          <AddressInput
            name='new-implementation'
            label='New implementation address'
            input={ newImplementationInput }
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
