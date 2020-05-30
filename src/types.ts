import Web3 from 'web3'
import { SafeInfo, SdkInstance } from '@gnosis.pm/safe-apps-sdk'

export interface Providers {
  web3: Web3
  safe: {
    sdk: SdkInstance,
    info: SafeInfo | undefined
  }
}