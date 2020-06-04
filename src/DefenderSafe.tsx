import React, { useState } from 'react'

import { Providers } from './types'
import { hasBytecode, isEmpty } from './utils'

import { AdminUpgradeabilityProxy } from './contracts/AdminUpgradeabilityProxy'
import { ProxyAdmin } from './contracts/ProxyAdmin'

import AddressInput from './AddressInput'
import { Button, Title, Section } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'

const AdminUpgradeabilityProxyABI = require('./contracts/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('./contracts/ProxyAdmin.json')

interface Props {
  providers: Providers
}


const DefenderSafe: React.FC<Props> = ({ providers }) => {
  const { web3, safe } = providers

  const [proxyAddress, setProxyAddress] = useState<string>('')
  const [newImplementationAddress, setNewImplementationAddress] = useState<string>('')
  const [proxyAdminAddress, setProxyAdminAddress] = useState<string>('')

  const [proxyAddressIsValid, setProxyAddressIsValid] = useState<boolean>(true)
  const [newImplementationAddressIsValid, setNewImplementationAddressIsValid] = useState<boolean>(true)
  const [proxyAdminAddressIsValid, setProxyAdminAddressIsValid] = useState<boolean>(true)


  const sendTx = () : void => {
    const { Contract } = web3.eth
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

  const getCode = async (address: string) : Promise<string> => {
    if (! web3.utils.isAddress(address)) throw new Error('Invalid address')
    return await web3.eth.getCode(address)
  }

  // Validations

  const newImplementationValidator = async (address: string) => {
    const code = await getCode(address)
    if (! hasBytecode(code)) throw new Error('New implementation has no bytecode')
  }

  const proxyAdminValidator = async (address: string) => {
    // const code = await getCode(address)
  }

  const proxyAddressValidator = async (address: string) => {
    // const code = await getCode(address)
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
            validator={ proxyAddressValidator }
          />

          <AddressInput
            name='new-implementation'
            label='New implementation address'
            value={ newImplementationAddress }
            setValue={ setNewImplementationAddress }
            setValid={ setNewImplementationAddressIsValid }
            validator={ newImplementationValidator }
          />

          <AddressInput
            name='admin'
            label='ProxyAdmin address (optional)'
            value={ proxyAdminAddress }
            setValue={ setProxyAdminAddress }
            setValid={ setProxyAdminAddressIsValid }
            validator={ proxyAdminValidator }
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
