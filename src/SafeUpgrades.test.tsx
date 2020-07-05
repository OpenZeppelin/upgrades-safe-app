import React from 'react'
import { act } from 'react-dom/test-utils'
import { mount, ReactWrapper } from 'enzyme'
import 'jest-canvas-mock'

import SafeUpgrades from './SafeUpgrades'
import EthereumBridge from './ethereum/EthereumBridge'
import { addressBook, externallyManagedProxy, externallyManagedProxyAdmin, unmanagedProxyAdmin, safe, safeManagedProxy, previousImplementation, newImplementation } from './Mocks'


describe("SafeUpgrades", () => {
  let ethereum: EthereumBridge
  let wrapper: ReactWrapper
  let proxyInput: ReactWrapper
  let implementationInput: ReactWrapper

  beforeEach(() => {
    ethereum = new EthereumBridge()
    ethereum.detect = jest.fn()
    ethereum.getCode = jest.fn()
    ethereum.hasBytecode = jest.fn()

    safe.sdk.sendTransactions = jest.fn()

    wrapper = mount(<SafeUpgrades safe={ safe } ethereum={ ethereum } />)

    proxyInput = wrapper.find('input[name="proxy"]').at(0)
    implementationInput = wrapper.find('input[name="new-implementation"]').at(0)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  const getInputError = (input: string) : ReactWrapper => {
    return wrapper.find(`#${ input }-input-error`).at(0)
  }

  // proxy input validation

  it('fails if the proxy input is not a valid address', async () => {
    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.notAnAddress } })
    })

    wrapper.update()

    expect(getInputError('proxy').text()).toBe("Contract or address expected")
  })


  it('fails if the proxy address is an external owned account', async () => {
    ethereum.hasBytecode.mockResolvedValue(false)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.notAProxy } })
    })

    wrapper.update()

    expect(getInputError('proxy').text()).toBe("There is no contract in this address")
  })


  it('fails if the proxy address is not EIP 1967 compatible', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(null)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.notAProxy } })
    })

    wrapper.update()

    expect(getInputError('proxy').text()).toBe("This contract is not an EIP 1967 compatible proxy")
  })


  it('fails if the proxy is not managed by the Safe', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(externallyManagedProxy)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.notAProxy } })
    })

    wrapper.update()

    expect(getInputError('proxy').text()).toBe("This proxy is not managed by this Safe")
  })


  it('fails if the proxyAdmin is not managed by the Safe', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(externallyManagedProxyAdmin)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
    })

    wrapper.update()

    expect(getInputError('proxy').text()).toBe("This proxy's admin is not managed by this Safe")
  })


  it('fails if the proxyAdmin is not managed by any address', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(unmanagedProxyAdmin)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
    })

    wrapper.update()

    expect(getInputError('proxy').text()).toBe("This proxy's admin is not managed by any address")
  })

  // implementation input

  it('fails if the implementation input is not a valid address', () => {
    act(() => {
      implementationInput.props().onChange({ target: { value: addressBook.notAnAddress } })
    })

    wrapper.update()

    expect(getInputError('new-implementation').text()).toBe("Contract or address expected")
  })


  it('fails if the implementation address has no bytecode', async () => {
    ethereum.getCode.mockResolvedValue('0x')

    await act(async () => {
      implementationInput.props().onChange({ target: { value: addressBook.newImplementation } })
    })

    wrapper.update()

    expect(getInputError('new-implementation').text()).toBe("There is no contract in this address")
  })


  it('fails if the implementation address is the current proxy implementation', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect
      .mockResolvedValueOnce(safeManagedProxy)
      .mockResolvedValueOnce(null)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
    })

    wrapper.update()

    await act(async () => {
      implementationInput.props().onChange({ target: { value: addressBook.previousImplementation } })
    })

    wrapper.update()

    expect(getInputError('proxy').get()).toBe(undefined)
    expect(getInputError('new-implementation').text()).toBe("Proxy already points to this implementation")
  })


  it('fails if the implementation input is a proxy', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(safeManagedProxy)

    await act(async () => {
      implementationInput.props().onChange({ target: { value: addressBook.proxy } })
    })

    wrapper.update()

    expect(getInputError('new-implementation').text()).toBe("New implementation can't be a proxy contract")
  })

  // form validation

  it('renders submit button disabled by default', () => {
    expect(wrapper.find('button[name="submit"]').prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if proxy is valid but implementation is empty', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(safeManagedProxy)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
      implementationInput.props().onChange({ target: { value: '' } })
    })

    wrapper.update()

    expect(getInputError('proxy').get()).toBe(undefined)
    expect(getInputError('new-implementation').get()).toBe(undefined)
    expect(wrapper.find('button[name="submit"]').prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if implementation is valid but proxy is empty', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(null)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: '' } })
      implementationInput.props().onChange({ target: { value: addressBook.newImplementation } })
    })

    wrapper.update()

    expect(getInputError('proxy').get()).toBe(undefined)
    expect(getInputError('new-implementation').get()).toBe(undefined)
    expect(wrapper.find('button[name="submit"]').prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if proxy is valid but implementation is not', async () => {
    ethereum.hasBytecode.mockResolvedValue(false)
    ethereum.detect.mockResolvedValue(safeManagedProxy)

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
      implementationInput.props().onChange({ target: { value: addressBook.newImplementation } })
    })

    wrapper.update()

    expect(getInputError('proxy').get()).toBe(undefined)
    expect(getInputError('new-implementation').get()).toBe(undefined)
    expect(wrapper.find('button[name="submit"]').prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if implementation is valid but proxy is not', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect
      .mockResolvedValueOnce(externallyManagedProxy) // proxy
      .mockResolvedValueOnce(null) // implementation

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
      implementationInput.props().onChange({ target: { value: addressBook.newImplementation } })
    })

    wrapper.update()

    expect(getInputError('proxy').get()).toBe(undefined)
    expect(getInputError('new-implementation').get()).toBe(undefined)
    expect(wrapper.find('button[name="submit"]').prop('disabled')).toBe(true)
  })


  it('renders submit button enabled if proxy and implementation are valid', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect
      .mockResolvedValueOnce(safeManagedProxy) // proxy
      .mockResolvedValueOnce(null) // implementation

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
      implementationInput.props().onChange({ target: { value: addressBook.newImplementation } })
    })

    wrapper.update()

    expect(getInputError('proxy').get()).toBe(undefined)
    expect(getInputError('new-implementation').get()).toBe(undefined)
    expect(wrapper.find('button[name="submit"]').prop('disabled')).toBe(false)
  })


  it('submits transaction to Safe', async () => {
    const tx = ethereum.buildUpgradeTransaction(addressBook.proxy, addressBook.newImplementation, undefined)

    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect
      .mockResolvedValueOnce(safeManagedProxy) // proxy
      .mockResolvedValueOnce(null) // implementation

    await act(async () => {
      proxyInput.props().onChange({ target: { value: addressBook.proxy } })
      implementationInput.props().onChange({ target: { value: addressBook.newImplementation } })
    })

    wrapper.update()

    await act(async () => {
      wrapper.find('button[name="submit"]').props().onClick()
    })

    expect(safe.sdk.sendTransactions).toBeCalledWith([tx])
  })
})
