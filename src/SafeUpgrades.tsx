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

import styles from './css/style.module.css'; 

const SafeUpgrades: React.FC<SafeUpgradesProps> = ({ safe, ethereum }) => {
  const [proxyAdminAddress, setProxyAdminAddress] = useState<string | undefined>()
  const [currentImplementationAddress, setCurrentImplementationAddress] = useState<string | undefined>()


  const proxyInput = useAddressInput(async (address: Address) : Promise<Validation> => {
    setProxyAdminAddress(undefined)
    setCurrentImplementationAddress(undefined)

    const Eip1967 = await ethereum.detect(address)
    if (Eip1967 === null) {
      return err('This proxy is not EIP 1967 compatible')
    }

    const safeAddress = safe.info?.safeAddress || ''
    const { proxy, implementation } = Eip1967
    const { admin } = proxy

    if (isProxyAdmin(admin)) {

      if (isManaged(admin)) {
        if ( ! admin.admin.address.isEquivalent(safeAddress)) {
          return err("This proxy's admin is not managed by this Safe")
        }

        setProxyAdminAddress(admin.address.toString())

      } else {
        return err("This proxy's admin is not managed by any address")
      }

    } else if ( ! admin.address.isEquivalent(safeAddress)) {
      return err('This proxy is not managed by this Safe')
    }

    setCurrentImplementationAddress(implementation.address.toString())
    return ok(undefined)
  })


  const newImplementationInput = useAddressInput(async (address: Address) : Promise<Validation> => {
    if (currentImplementationAddress && address.isEquivalent(currentImplementationAddress)) {
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

    return ok(undefined)
  })


  const sendTransaction = () : void => {
    const tx = ethereum.buildUpgradeTransaction(proxyInput.address, newImplementationInput.address, proxyAdminAddress)
    safe.sdk.sendTransactions([tx])
  }


  return (
    <ThemeProvider theme={theme}>
      <WidgetWrapper>
        <div className={styles.card}>
          <div className={styles.header}>
            <h4>Upgrade proxy implementation</h4>
            <Button
                size='md'
                color='primary'
                variant='contained'
                onClick={ sendTransaction }
                disabled={ ! (proxyInput.isValid && newImplementationInput.isValid) }
              >
                Propose
            </Button>
            <button type="button">Propose</button>
            <button type="button" disabled>Propose</button>
           </div>
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
          <div className={styles.details}>
            <div className={styles.header}>
              <p>upgrade information</p>
            </div>
            <ul className={styles.nobullet}>
              <li className={styles.success}>
                <p className={styles.title}>This broxy is EIP 1967 compatible</p>
              </li>
              <li className={styles.error}>
                <p className={styles.title}>New implementation can’t be a proxy contract</p>
                <p className={styles.description}>The new implementation can’t be a proxy contract</p>
              </li>
              <li className={styles.note}>
                <p className={styles.title}>Some generic tip goes here</p>
                <p className={styles.description}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </li>
            </ul>
          </div>
        </div>
        <p>Powered by OpenZeppelin | Defender</p>
      </WidgetWrapper>
    </ThemeProvider>
  )
}


export default SafeUpgrades
