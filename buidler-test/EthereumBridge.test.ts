import { expect } from "chai"
import { ethers } from "@nomiclabs/buidler"
import { Contract } from "ethers"

import { isProxyAdmin } from "../src/ethereum/Contract"
import EthereumBridge from "../src/ethereum/EthereumBridge"
import { Eip1967 } from "../src/ethereum/Eip1967"
import Address from "../src/ethereum/Address"
import { addressBook } from "../src/Mocks"

const AdminUpgradeabilityProxyABI = require('../src/ethereum/abis/AdminUpgradeabilityProxy.json')
const ProxyAdminABI = require('../src/ethereum/abis/ProxyAdmin.json')


describe("EthereumBridge", () => {
  EthereumBridge.provider = ethers.provider
  let greeter: Contract
  let ethereumBridge: EthereumBridge

  beforeEach(async () => {
    ethereumBridge = new EthereumBridge()
    const Greeter = await ethers.getContractFactory("Greeter")
    greeter = await Greeter.deploy()
  })

  it("detects contract is not upgradeable", async () => {
    const features = await ethereumBridge.detect(
      Address.unsafeCreate(greeter.address)
    )
    
    expect(features).to.be.null
  })

  it("detects contract is upgradeable and has a ProxyAdmin as admin", async () => {
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin")
    const proxyAdmin = await ProxyAdmin.deploy()

    const AdminUpgradeabilityProxy = await ethers.getContractFactory("AdminUpgradeabilityProxy")
    const adminProxy = await AdminUpgradeabilityProxy.deploy(greeter.address, proxyAdmin.address, [])
    
    const features = await ethereumBridge.detect(
      Address.unsafeCreate(adminProxy.address)
    )

    expect(features).to.be.not.null

    const {
      label,
      implementation,
      proxy
    } = features as Eip1967

    expect(label).to.eql("EIP 1967")
    expect(implementation.address.isEquivalent(greeter.address)).to.be.true
    expect(proxy.admin.address.isEquivalent(proxyAdmin.address)).to.be.true
  })

  it("detects a Proxy's admin is not a ProxyAdmin", async () => {
    const FakeProxyAdmin = await ethers.getContractFactory("FakeProxyAdmin")
    const fakeProxyAdmin = await FakeProxyAdmin.deploy()

    const AdminUpgradeabilityProxy = await ethers.getContractFactory("AdminUpgradeabilityProxy")
    const adminProxy = await AdminUpgradeabilityProxy.deploy(greeter.address, fakeProxyAdmin.address, [])
    
    const features = await ethereumBridge.detect(
      Address.unsafeCreate(adminProxy.address)
    )

    const { proxy } = features as Eip1967
    expect(isProxyAdmin(proxy.admin)).to.be.false
  })

  it("builds upgrade transaction for non-ProxyAdmin owned Proxy", () => {
    const proxyInterface = new ethers.utils.Interface(AdminUpgradeabilityProxyABI)
    const { proxy, newImplementation } = addressBook

    const tx = ethereumBridge.buildUpgradeTransaction(proxy, newImplementation, undefined)
    const txData = proxyInterface.parseTransaction(tx)

    expect(tx.to).to.be.equal(proxy)
    expect(txData.args).to.eql([ newImplementation ])
    expect(txData.signature).to.be.equal('upgradeTo(address)')
  })

  it("builds upgrade transaction for ProxyAdmin owned Proxy", () => {
    const proxyAdminInterface = new ethers.utils.Interface(ProxyAdminABI)
    const { proxy, proxyAdmin, newImplementation } = addressBook

    const tx = ethereumBridge.buildUpgradeTransaction(proxy, newImplementation, proxyAdmin)
    const txData = proxyAdminInterface.parseTransaction(tx)

    expect(tx.to).to.be.equal(proxyAdmin)
    expect(txData.args).to.eql([ proxy, newImplementation ])
    expect(txData.signature).to.be.equal('upgrade(address,address)')
  })
})
