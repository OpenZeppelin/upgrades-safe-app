import { ethers, Contract } from 'ethers'
import { Provider } from 'ethers/providers'
import { Eip1967 } from './Eip1967'
import { Transaction } from '../types'
import Address from './Address'

const AdminUpgradeabilityProxyABI = require('./abis/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('./abis/ProxyAdmin.json')


export default class EthereumBridge {
  private static _providerInstance: Provider

  public static set provider(prov: Provider) {
    this._providerInstance = prov
  }

  public static get provider(): Provider {
    if (this._providerInstance === undefined) {
      const w: any = window

      // Out of curiosity: is this the provider injected by metamask, or does safe inject one?
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

  public buildUpgradeTransaction(proxyAddress: string, newImplementationAddress: string, proxyAdminAddress: string | undefined) : Transaction {
    if (proxyAdminAddress === undefined) {
      return {
        to: proxyAddress,
        value: 0,
        data: this.encodeProxyTx(newImplementationAddress)
      }
    } else {
      return {
        to: proxyAdminAddress,
        value: 0,
        data: this.encodeProxyAdminTx(proxyAddress, newImplementationAddress)
      }
    }

    // Question: how does the safe sdk decide upon gas and gasprice when sending a tx?
    // Do we need to set it ourselves, or safe takes care of it?
  }

  private encodeProxyAdminTx(proxyAddress: string, newImplementationAddress: string) : string {
    const proxyAdminInterface = new ethers.utils.Interface(ProxyAdminABI)
    return proxyAdminInterface.functions.upgrade.encode([ proxyAddress, newImplementationAddress ])
  }

  private encodeProxyTx(newImplementationAddress: string) : string {
    const proxyAddressInterface = new ethers.utils.Interface(AdminUpgradeabilityProxyABI)
    return proxyAddressInterface.functions.upgradeTo.encode([ newImplementationAddress ])
  }
}
