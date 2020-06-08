import { SafeInfo, SdkInstance } from '@gnosis.pm/safe-apps-sdk'
import { Result } from './Result'
import EthereumBridge from './ethereum/EthereumBridge'
import Address from './ethereum/Address'


export type Validation = Result<boolean, string>
export type Validator = (address: Address) => Promise<Validation>

export interface SafeProvider {
  sdk: SdkInstance,
  info: SafeInfo | undefined
}

export interface SafeUpgradesProps {
  safe: SafeProvider,
  ethereum: EthereumBridge
}

export interface Input {
  address: string,
  setAddress(address: string) : void
  isValid: boolean
  meta: object
}

export interface Transaction {
  to: string
  data: string
  value: number
}
