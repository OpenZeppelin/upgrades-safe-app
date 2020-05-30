import React, { useState } from 'react'

import { Providers } from './types'

import { AdminUpgradeabilityProxy } from './contracts/AdminUpgradeabilityProxy'
import { ProxyAdmin } from './contracts/ProxyAdmin'

import { Button, Title, Section, TextField } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'

const AdminUpgradeabilityProxyABI = require('./contracts/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('./contracts/ProxyAdmin.json')
interface Props {
  providers: Providers
}

const DefenderSafe: React.FC<Props> = ({ providers }) => {
  const [proxyAddress, setProxyAddress] = useState<string>('')
  const [newImplementationAddress, setImplementationAddress] = useState<string>('')
  const [proxyAdminAddress, setProxyAdminAddress] = useState<string>('')
  const { web3, safe } = providers

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

  // validation

  const isEmptyOrAddress = (address: string) => {
    const isEmpty = !address
    const isAddress = web3.utils.isAddress(address)

    return isEmpty || isAddress
  }

  const validateInput = (address: string) => {
    return isEmptyOrAddress(address) ? {} : { error: 'Invalid address' }
  }

  const validateForm = () => {
    const isProxyValid = web3.utils.isAddress(proxyAddress)
    const isNewImplementationValid = web3.utils.isAddress(newImplementationAddress)
    const isAdminValid = isEmptyOrAddress(proxyAdminAddress)

    return isProxyValid && isNewImplementationValid && isAdminValid
  }

  return (
    <ThemeProvider theme={theme}>
      <WidgetWrapper>
        <Title size='xs'>Upgrade proxy implementation</Title>

        <Section>
          <div>
            <TextField
              id='proxy-addres'
              label='Proxy address'
              value={proxyAddress}
              style={{ marginTop: 10 }}
              meta={ validateInput(proxyAddress) }
              onChange={e => setProxyAddress(e.target.value)}
            />
          </div>
          <div>
            <TextField
              id='implementation-address'
              label='New implementation address'
              value={newImplementationAddress}
              meta={ validateInput(newImplementationAddress) }
              style={{ marginTop: 10 }}
              onChange={e => setImplementationAddress(e.target.value)}
            />
          </div>
          <div>
            <TextField
              id='admin-address'
              label='ProxyAdmin address (optional)'
              value={proxyAdminAddress}
              meta={ validateInput(proxyAdminAddress) }
              style={{ marginTop: 10 }}
              onChange={e => setProxyAdminAddress(e.target.value)}
            />
          </div>
        </Section>

        <ButtonContainer>
          <Button
            size='lg'
            color='primary'
            variant='contained'
            onClick={ sendTx }
            disabled={ ! validateForm() }
          >
            Propose upgrade
          </Button>
        </ButtonContainer>
      </WidgetWrapper>
    </ThemeProvider>
  )
}

export default DefenderSafe
