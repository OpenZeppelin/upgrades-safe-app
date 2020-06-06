import Web3 from 'web3'
import { AdminUpgradeabilityProxy } from './contracts/AdminUpgradeabilityProxy'
import { ProxyAdmin } from './contracts/ProxyAdmin'

const AdminUpgradeabilityProxyABI = require('./contracts/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('./contracts/ProxyAdmin.json')

const w: any = window
const web3 = new Web3(w.ethereum)
w.ethereum.enable()

interface Transaction {
  to: string
  data: string
  value: number
}


export const buildTransaction = (proxyAddress: string, newImplementationAddress: string, proxyAdminAddress: string) : Transaction => {
  const { Contract } = web3.eth
  const value = 0
  let to 
  let data

  if (proxyAdminAddress) {
    const proxyAdmin: ProxyAdmin = new Contract(ProxyAdminABI, proxyAdminAddress)
    to = proxyAdminAddress
    data = proxyAdmin.methods
      .upgrade(proxyAddress, newImplementationAddress)
      .encodeABI()
  } else {
    const proxy: AdminUpgradeabilityProxy = new Contract(AdminUpgradeabilityProxyABI, proxyAddress)
    to = proxyAddress
    data = proxy.methods
      .upgradeTo(newImplementationAddress)
      .encodeABI()
  }

  return { to, data, value }
}


export const getCode = async (address: string) : Promise<string> => {
  if (! web3.utils.isAddress(address)) throw new Error('Invalid address')
  return await web3.eth.getCode(address)
}
