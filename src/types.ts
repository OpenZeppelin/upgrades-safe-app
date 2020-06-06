import { SafeInfo, SdkInstance } from '@gnosis.pm/safe-apps-sdk'

export interface SafeProvider {
  sdk: SdkInstance,
  info: SafeInfo | undefined
}

export type Validator = (address: string) => void

export interface Input {
  address: string,
  setAddress(address: string) : void
  isValid: boolean
  meta: object
}