import React, { useState } from 'react'

import { Providers } from './types'

import { AdminUpgradeabilityProxy } from './contracts/AdminUpgradeabilityProxy'
import { ProxyAdmin } from './contracts/ProxyAdmin'
import AddressInput from './AddressInput'

import { Button, Title, Section } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'
import { hasBytecode, isEmpty } from './utils'

const AdminUpgradeabilityProxyABI = require('./contracts/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('./contracts/ProxyAdmin.json')

interface Props {
  providers: Providers
}

type Validator = (address: string) => boolean

const DefenderSafe: React.FC<Props> = ({ providers }) => {
  const [proxyAddress, setProxyAddress] = useState<string>('')
  const [newImplementationAddress, setNewImplementationAddress] = useState<string>('')
  const [proxyAdminAddress, setProxyAdminAddress] = useState<string>('')

  const [proxyAddressIsValid, setProxyAddressIsValid] = useState<boolean>(true)
  const [newImplementationAddressIsValid, setNewImplementationAddressIsValid] = useState<boolean>(true)
  const [proxyAdminAddressIsValid, setProxyAdminAddressIsValid] = useState<boolean>(true)

  const { web3, safe } = providers
  const { Contract } = web3.eth
  const { isAddress } = web3.utils

  const sendTx = () : void => {
    const value = 0
    let to 
    let data

    if (proxyAdminAddress) {
      const proxyAdmin: ProxyAdmin = new Contract(ProxyAdminABI, proxyAdminAddress)
      to = proxyAdminAddress
      data = proxyAdmin.methods
        .upgrade(proxyAddress, newImplementationAddress)
        .encodeABI()
    } else {
      const proxy: AdminUpgradeabilityProxy = new Contract(AdminUpgradeabilityProxyABI, proxyAddress)
      to = proxyAddress
      data = proxy.methods
        .upgradeTo(newImplementationAddress)
        .encodeABI()
    }

    const tx = { to, value, data }
    safe.sdk.sendTransactions([tx])
  }

  // Contract validations

  const isValidNewImplementation = (code: string) : boolean => {
    if (! hasBytecode(code)) throw new Error('New implementation has no bytecode')
    return true
  }

  const isValidProxy = (code: string) : boolean => {
    return true
  }

  const isValidProxyAdmin = (code: string) : boolean => {
    return true
  }

  // Input validations

  const validateNewImplementationAddress = async (address: string) : Promise<boolean> => {
    return await validateAddress(address, isValidNewImplementation)
  }

  const validateProxyAdminAddress = async (address: string) : Promise<boolean> => {
    return await validateAddress(address, isValidProxyAdmin)
  }

  const validateProxyAddress = async (address: string) : Promise<boolean> => {
    return await validateAddress(address, isValidProxy)
  }

  const validateAddress = async (address: string, validate: Validator) : Promise<boolean> => {
    if (! isAddress(address)) throw new Error('Invalid address')

    const code = await web3.eth.getCode(address)
    return validate(code)
  }

  const formIsValid = () : boolean => {
    const isNotEmpty = !isEmpty(proxyAddress) && !isEmpty(newImplementationAddress)
    const inputsAreValid = proxyAddressIsValid && newImplementationAddressIsValid && proxyAdminAddressIsValid

    return isNotEmpty && inputsAreValid
  }

  return (
    <ThemeProvider theme={theme}>
      <WidgetWrapper>
        <Title size='xs'>Upgrade proxy implementation</Title>

        <Section>
          <AddressInput
            name='proxy'
            label='Proxy address'
            value={ proxyAddress }
            setValue={ setProxyAddress }
            setValid={ setProxyAddressIsValid }
            validate={ validateProxyAddress }
          />

          <AddressInput
            name='new-implementation'
            label='New implementation address'
            value={ newImplementationAddress }
            setValue={ setNewImplementationAddress }
            setValid={ setNewImplementationAddressIsValid }
            validate={ validateNewImplementationAddress }
          />

          <AddressInput
            name='admin'
            label='ProxyAdmin address (optional)'
            value={ proxyAdminAddress }
            setValue={ setProxyAdminAddress }
            setValid={ setProxyAdminAddressIsValid }
            validate={ validateProxyAdminAddress }
          />
        </Section>

        <ButtonContainer>
          <Button
            size='lg'
            color='primary'
            variant='contained'
            onClick={ sendTx }
            disabled={ ! formIsValid() }
          >
            Propose upgrade
          </Button>
        </ButtonContainer>
      </WidgetWrapper>
    </ThemeProvider>
  )
}

export default DefenderSafe
