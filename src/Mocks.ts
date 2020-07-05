import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import Address from './ethereum/Address'


export const addressBook = {
  safe: '0x1E6876a6C2757de611c9F12B23211dBaBd1C9028',
  proxy: '0xDF82c9014F127243CE1305DFE54151647d74B27A',

  proxyAdmin: '0x4c8FE856BFfE7ACFe679e790c2541130a038a917',
  otherAdmin: '0xF466Affa6fed5DeF438592Ad34b1782e40BB22D7',
  
  previousImplementation: '0x48317e7bF015ECdAaa1c957b5e8526eD4B40202e',
  newImplementation: '0xb970ab7e46f37235D6F878eE37eEaEcfd2046eC2',

  notAProxy: '0x881004772bd8C091095d2Ff5aa6Dc9995059313A',
  notAnAddress: 'not an address'
}


const safeInfo: SafeInfo = {
  safeAddress: addressBook.safe,
  network: 'rinkeby',
  ethBalance: '0'
}


export const safe = {
  sdk: initSdk([/.*localhost.*/]),
  info: safeInfo
}


export const previousImplementation = {
  type: 'Unknown',
  address: Address.unsafeCreate(addressBook.previousImplementation)
}


export const newImplementation = {
  type: 'Unknown',
  address: Address.unsafeCreate(addressBook.newImplementation)
}


const baseEip1967 = {
  label: 'EIP 1967',
  implementation: previousImplementation
}


export const safeManagedProxy = {
  ... baseEip1967,
  proxy: {
    type: 'Proxy',
    address: Address.unsafeCreate(addressBook.proxy),
    admin: {
      type: 'Unknown',
      address: Address.unsafeCreate(addressBook.safe)
    }
  }
}


export const externallyManagedProxy = {
  ... baseEip1967,
  proxy: {
    type: 'Proxy',
    address: Address.unsafeCreate(addressBook.proxy),
    admin: {
      type: 'Unknown',
      address: Address.unsafeCreate(addressBook.otherAdmin)
    }
  }
}


export const externallyManagedProxyAdmin = {
  ... baseEip1967,
  proxy: {
    type: 'Proxy',
    address: Address.unsafeCreate(addressBook.proxy),
    admin: {
      type: 'ProxyAdmin',
      address: Address.unsafeCreate(addressBook.proxyAdmin),
      admin: {
        type: 'Unknown',
        address: Address.unsafeCreate(addressBook.otherAdmin)
      }
    }
  }
}


export const unmanagedProxyAdmin = {
  ... baseEip1967,
  proxy: {
    type: 'Proxy',
    address: Address.unsafeCreate(addressBook.proxy),
    admin: {
      type: 'ProxyAdmin',
      address: Address.unsafeCreate(addressBook.proxyAdmin),
    }
  }
}
