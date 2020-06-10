import React, { useState } from 'react'

import Address from './ethereum/Address'
import { ok, err } from './Result'
import { SafeUpgradesProps, Validation } from './types'
import { isProxyAdmin, isManaged } from './ethereum/Contract'
import { AddressInput, useAddressInput } from './AddressInput'

import { Button, Title, Section } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'


const SafeUpgrades: React.FC<SafeUpgradesProps> = ({ safe, ethereum }) => {
  const [proxyAdminAddress, setProxyAdminAddress] = useState<string>('')
  const [currentImplementationAddress, setCurrentImplementationAddress] = useState<string>('')


  const proxyInput = useAddressInput(async (address: Address) : Promise<Validation> => {
    // Prefer null or undefined over empty strings
    setProxyAdminAddress('')
    setCurrentImplementationAddress('')

    const Eip1967 = await ethereum.detect(address)
    if (Eip1967 === null) {
      return err('This proxy is not EIP 1967 compatible')
    }

    const safeAddress = safe.info?.safeAddress
    const { proxy, implementation } = Eip1967
    const { admin } = proxy

    if (isProxyAdmin(admin)) {

      if (isManaged(admin)) {
        if (admin.admin.address.toString() === safeAddress) {
          return err("This proxy's admin is not managed by this Safe")
        }

        setProxyAdminAddress(admin.admin.address.toString())

      } else {
        return err("This proxy's admin is not managed by any address")
      }

    } else if (admin.address.toString() !== safeAddress) {
      return err('This proxy is not managed by this Safe')
    }

    setCurrentImplementationAddress(implementation.address.toString())
    return ok(true)
  })


  const newImplementationInput = useAddressInput(async (address: Address) : Promise<Validation> => {
    if (currentImplementationAddress === address.toString()) {
      return err('Proxy already points to this implementation')
    }

    const hasBytecode = await ethereum.hasBytecode(address)

    if (! hasBytecode) {
      return err('This implementation has no bytecode')
    }

    const Eip1967 = await ethereum.detect(address)
    if (Eip1967 !== null) {
      return err("New implementation can't be a proxy contract")
    }

    return ok(true)
  })


  const sendTransaction = () : void => {
    const tx = ethereum.buildUpgradeTransaction(proxyInput.address, newImplementationInput.address, proxyAdminAddress)
    safe.sdk.sendTransactions([tx])
    // Does the user get any prompt from the safe app here? Or should we let the user know that the proposal was successful somehow, and clear the inputs?
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
            disabled={! (proxyInput.isValid && newImplementationInput.isValid) }
          >
            Propose upgrade
          </Button>

        </ButtonContainer>
      </WidgetWrapper>
    </ThemeProvider>
  )
}


export default SafeUpgrades
