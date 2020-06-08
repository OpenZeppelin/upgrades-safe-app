import { SafeInfo, SdkInstance } from '@gnosis.pm/safe-apps-sdk'
import { Result } from './Result'
import Address from './Address'

export interface SafeProvider {
  sdk: SdkInstance,
  info: SafeInfo | undefined
}

export type Validation = Result<boolean, string>
export type Validator = (address: Address) => Promise<Validation>

export interface Input {
  address: string,
  setAddress(address: string) : void
  isValid: boolean
  meta: object
}