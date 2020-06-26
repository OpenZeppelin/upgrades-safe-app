import { expect } from "chai"
import { ethers } from "@nomiclabs/buidler"
import { Contract } from "ethers"

import { isProxyAdmin } from "../src/ethereum/Contract"

import EthereumBridge from "../src/ethereum/EthereumBridge"
import Address from "../src/ethereum/Address"
import { Eip1967 } from "../src/ethereum/Eip1967"

describe("Eip1967", () => {
  let greeter: Contract
  const detector = (address: Address) => Eip1967.detect(new EthereumBridge(), address)

  beforeEach(async () => {
    EthereumBridge.provider = ethers.provider
    const Greeter = await ethers.getContractFactory("Greeter")
    greeter = await Greeter.deploy()
  })

  it("detects contract is not upgradeable", async () => {
    const features = await detector(
      Address.unsafeCreate(greeter.address)
    )
    
    expect(features).to.be.null
  })

  it("detects contract is upgradeable and has a ProxyAdmin as admin", async () => {
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin")
    const proxyAdmin = await ProxyAdmin.deploy()

    const AdminUpgradeabilityProxy = await ethers.getContractFactory("AdminUpgradeabilityProxy")
    const adminProxy = await AdminUpgradeabilityProxy.deploy(greeter.address, proxyAdmin.address, [])
    
    const features = await detector(
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
    
    const features = await detector(
      Address.unsafeCreate(adminProxy.address)
    )

    const { proxy } = features as Eip1967
    expect(isProxyAdmin(proxy.admin)).to.be.false
  })
})
