import { hexlify, bigNumberify, id } from 'ethers/utils'
import Address from './Address'
import EthereumBridge from './EthereumBridge'
import duckTypedProxyAdmin from './contracts/DuckTypedProxyAdmin.json'
import { Contract, ManagedContract, ProxyAdmin } from './Contract'

// Implementation storage
const IMPLEMENTATION_LABEL = 'eip1967.proxy.implementation'
const DEPRECATED_IMPLEMENTATION_LABEL = 'org.zeppelinos.proxy.implementation'
const IMPLEMENTATION_LABEL_HASH = hexlify(bigNumberify(id(IMPLEMENTATION_LABEL)).sub(1))
const DEPRECATED_IMPLEMENTATION_LABEL_ID = id(DEPRECATED_IMPLEMENTATION_LABEL)

// ProxyAdmin storage
const ADMIN_LABEL = 'eip1967.proxy.admin'
const DEPRECATED_ADMIN_LABEL = 'org.zeppelinos.proxy.admin'
const ADMIN_LABEL_HASH = hexlify(bigNumberify(id(ADMIN_LABEL)).sub(1))
const DEPRECATED_ADMIN_LABEL_ID = id(DEPRECATED_ADMIN_LABEL)

export class Eip1967 {
  label: 'EIP 1967' = 'EIP 1967'
  proxy: ManagedContract
  implementation: Contract

  constructor(proxy: ManagedContract, implementation: Contract) {
    this.proxy = proxy
    this.implementation = implementation
  }

  public static async detect(bridge: EthereumBridge, address: Address): Promise<Eip1967 | null> {
    // Decode implementation address from slot
    const implementationAddress = await this.detectImplementationAddress(bridge, address)
    if (implementationAddress.isZeroAddress()) return null

    // Decode admin address from slot
    const adminAddress = await this.detectAdminAddress(bridge, address)
    if (adminAddress.isZeroAddress()) return null

    // Determine if address is a ProxyAdmin contract
    const proxyAdmin = await this.detectProxyAdmin(bridge, address, adminAddress, implementationAddress)

    return new Eip1967(
      {
        type: 'Proxy',
        address: address,
        admin: proxyAdmin || { type: 'Unknown', address: adminAddress },
      },
      {
        type: 'Unknown',
        address: implementationAddress,
      },
    )
  }

  private static async detectProxyAdmin(
    bridge: EthereumBridge,
    address: Address,
    proxyAdminAddress: Address,
    implementationAddress: Address,
  ): Promise<ProxyAdmin | (ProxyAdmin & ManagedContract) | null> {
    try {
      const maybeProxyAdmin = bridge.getContract(proxyAdminAddress, duckTypedProxyAdmin)
      const readImplementation = await maybeProxyAdmin.getProxyImplementation(address.toString())
      if (!implementationAddress.isEquivalent(readImplementation)) return null

      const readProxyAdmin = await maybeProxyAdmin.getProxyAdmin(address.toString())
      if (!proxyAdminAddress.isEquivalent(readProxyAdmin)) return null

      const owner = await maybeProxyAdmin.owner()
      const ownerAddress = Address.fromUint256(owner)

      return {
        type: 'ProxyAdmin',
        address: proxyAdminAddress,
        admin: {
          address: ownerAddress,
          type: 'Unknown'
        }
      }
    } catch {
      return null
    }
  }


  private static async detectAdminAddress(bridge: EthereumBridge, address: Address): Promise<Address> {
    return await this.getStorageAtNewOrDeprecatedSlot(bridge, address, ADMIN_LABEL_HASH, DEPRECATED_ADMIN_LABEL_ID)
  }

  private static async detectImplementationAddress(bridge: EthereumBridge, address: Address): Promise<Address> {
    return await this.getStorageAtNewOrDeprecatedSlot(
      bridge,
      address,
      IMPLEMENTATION_LABEL_HASH,
      DEPRECATED_IMPLEMENTATION_LABEL_ID,
    )
  }

  private static async getStorageAtNewOrDeprecatedSlot(
    bridge: EthereumBridge,
    address: Address,
    newSlot: string,
    deprecatedSlot: string,
  ): Promise<Address> {
    let storage = await bridge.getStorageAt(address, newSlot)
    if (storage === '0x0') {
      storage = await bridge.getStorageAt(address, deprecatedSlot)
    }
    return Address.fromUint256(storage)
  }
}