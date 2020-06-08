import { ethers, Contract } from 'ethers'
import { Provider } from 'ethers/providers'
import Address from './Address'
import { Eip1967 } from './Eip1967'

import { AdminUpgradeabilityProxy } from './contracts/AdminUpgradeabilityProxy'
import { ProxyAdmin } from './contracts/ProxyAdmin'

const AdminUpgradeabilityProxyABI = require('./contracts/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('./contracts/ProxyAdmin.json')


interface Transaction {
  to: string
  data: string
  value: number
}


export default class EthereumBridge {
  private static _providerInstance: Provider

  public static set provider(prov: Provider) {
    this._providerInstance = prov
  }

  public static get provider(): Provider {
    if (this._providerInstance === undefined) {
      const w: any = window

      if (w.ethereum) {
        this._providerInstance = new ethers.providers.Web3Provider(w.ethereum)
      } else {
        this._providerInstance = ethers.getDefaultProvider()
      }
    }

    return this._providerInstance
  }

  public async getStorageAt(address: Address, position: string): Promise<string> {
    return EthereumBridge.provider.getStorageAt(address.toString(), position)
  }

  public getContract(address: Address, abi: Array<any>): Contract {
    return new Contract(address.toString(), abi, EthereumBridge.provider)
  }

  public async getCode(address: Address) : Promise<string> {
    return await EthereumBridge.provider.getCode(address.toString())
  }

  public async hasBytecode(address: Address) : Promise<boolean> {
    const code = await this.getCode(address)
    return code !== '0x'
  }

  public async detect(address: Address) : Promise<Eip1967 | null> {
    return await Eip1967.detect(this, address)
  }

  public buildUpgradeTransaction(proxyAddress: string, newImplementationAddress: string) : Transaction {
    const value = 0
    let to = ""
    let data = ""

    // if (proxyAdminAddress) {
    //   const proxyAdmin: ProxyAdmin = new Contract(ProxyAdminABI, proxyAdminAddress)
    //   to = proxyAdminAddress
    //   data = proxyAdmin.methods
    //     .upgrade(proxyAddress, newImplementationAddress)
    //     .encodeABI()
    // } else {
    //   const proxy: AdminUpgradeabilityProxy = new Contract(AdminUpgradeabilityProxyABI, proxyAddress)
    //   to = proxyAddress
    //   data = proxy.methods
    //     .upgradeTo(newImplementationAddress)
    //     .encodeABI()
    // }

    return { to, data, value }
  }
}

