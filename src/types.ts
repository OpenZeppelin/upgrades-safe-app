import { SafeInfo, SdkInstance } from '@gnosis.pm/safe-apps-sdk'
import { Result } from './Result'
import EthereumBridge from './ethereum/EthereumBridge'
import Address from './ethereum/Address'


// I'm not sure about this type, as the boolean ends up being redundant (success/failure is encoded in ok/err)
// Perhaps it may make more sense to either use a tuple (bool, string) or use a Result<void, string> (not sure how that'll behave when constructing an instance though)
export type Validation = Result<boolean, string>

// Rename to AddressValidator?
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
