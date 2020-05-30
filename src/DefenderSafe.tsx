import React, { useState } from 'react'

import proxyABI from './abis/AdminUpgradeabilityProxy'
import proxyAdminABI from './abis/ProxyAdmin'

import { Button, Title, Section, TextField } from '@gnosis.pm/safe-react-components'
import { WidgetWrapper, ButtonContainer } from './components'
import { ThemeProvider } from 'styled-components'
import theme from './customTheme'


const DefenderSafe = (props: any) => {
  const [proxyAddress, setProxyAddress] = useState<string>('')
  const [newImplementationAddress, setImplementationAddress] = useState<string>('')
  const [proxyAdminAddress, setProxyAdminAddress] = useState<string>('')
  const { web3, safe } = props.providers

  const handleSubmit = () => {
    buildTx()
  }

  const isValidAddress = (address: string) => {
    const isEmpty = !address
    const isAddress = web3.utils.isAddress(address)

    return isEmpty || isAddress
  }

  const validateInput = (address: string) => {
    if (! isValidAddress(address)) {
      return {
        error: 'Invalid address'
      }
    }
  }

  const isValidForm = () => {
    const isProxyValid = web3.utils.isAddress(proxyAddress)
    const isNewImplementationValid = web3.utils.isAddress(newImplementationAddress)
    const isAdminValid = isValidAddress(proxyAdminAddress)

    return isProxyValid && isNewImplementationValid && isAdminValid
  }

  const buildTx = () => {
    const { Contract } = web3.eth
    const value = 0
    let to 
    let data

    if (proxyAdminAddress) {
      const proxyAdmin = new Contract(proxyAdminABI, proxyAdminAddress)
      to = proxyAdminAddress
      data = proxyAdmin.methods
        .upgrade(proxyAddress, newImplementationAddress)
        .encodeABI()

    } else {
      const proxy = new Contract(proxyABI, proxyAddress)
      to = proxyAddress
      data = proxy.methods
        .upgradeTo(newImplementationAddress)
        .encodeABI()

    }

    const tx = { to, value, data }
    console.log(tx)
    safe.sdk.sendTransactions([tx])
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
            onClick={ handleSubmit }
            disabled={ ! isValidForm() }
          >
            Propose upgrade
          </Button>
        </ButtonContainer>
      </WidgetWrapper>
    </ThemeProvider>
  )
}

export default DefenderSafe
