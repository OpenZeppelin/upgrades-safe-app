import { SafeInfo, SdkInstance } from '@gnosis.pm/safe-apps-sdk'

export interface SafeProvider {
  sdk: SdkInstance,
  info: SafeInfo | undefined
}
