import { ethers, Contract } from 'ethers'
import { Provider } from 'ethers/providers'
import { Eip1967 } from './Eip1967'
import { Transaction } from '../types'
import Address from './Address'

const AdminUpgradeabilityProxyABI = require('./abis/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('./abis/ProxyAdmin.json')


export default class EthereumBridge {
  private static _providerInstance: Provider
  private static _network: string

  public static set provider(prov: Provider) {
    this._providerInstance = prov
  }

  public static set network(_network: string | undefined) {
    this._network = _network || ''
  }

  public static get provider(): Provider {
    const { REACT_APP_INFURA_KEY } = process.env

    if (this._providerInstance === undefined) {
      if (REACT_APP_INFURA_KEY) {
        this._providerInstance = new ethers.providers.InfuraProvider(EthereumBridge._network, REACT_APP_INFURA_KEY)
        console.log(this._network, REACT_APP_INFURA_KEY)
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
  }

  private encodeProxyAdminTx(proxyAddress: string, newImplementationAddress: string) : string {
    const proxyAdminInterface = new ethers.utils.Interface(ProxyAdminABI)
    return proxyAdminInterface.functions.upgrade.encode([ proxyAddress, newImplementationAddress ])
  }

  private encodeProxyTx(newImplementationAddress: string) : string {
    const proxyInterface = new ethers.utils.Interface(AdminUpgradeabilityProxyABI)
    return proxyInterface.functions.upgradeTo.encode([ newImplementationAddress ])
  }
}
