import Address from './Address'

export type ContractType = 'Proxy' | 'ProxyAdmin' | 'Unknown'

export interface Contract {
  address: Address
  type: ContractType
}

export interface ManagedContract extends Contract {
  admin: Contract
}

export interface ProxyAdmin extends Contract {
  type: 'ProxyAdmin'
}

export function isProxyAdmin(contract: Contract): contract is ProxyAdmin {
  return contract.type === 'ProxyAdmin'
}

export function isManaged(contract: Contract): contract is ManagedContract {
  return 'admin' in contract
}