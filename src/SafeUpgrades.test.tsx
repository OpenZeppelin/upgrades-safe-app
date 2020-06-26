import React from 'react'
import { act } from 'react-dom/test-utils'
import { mount, ReactWrapper } from 'enzyme'

import SafeUpgrades from './SafeUpgrades'
import EthereumBridge from './ethereum/EthereumBridge'
import { addressBook, externallyManagedProxy, externallyManagedProxyAdmin, unmanagedProxyAdmin, safe, safeManagedProxy, previousImplementation, newImplementation } from './Mocks'

jest.mock('./ethereum/EthereumBridge')

describe("SafeUpgrades", () => {
  let ethereum: EthereumBridge
  let wrapper: ReactWrapper
  let proxyInput: ReactWrapper
  let proxyLabel: ReactWrapper
  let implementationInput: ReactWrapper
  let implementationLabel: ReactWrapper
  let submitButton: ReactWrapper

  beforeEach(() => {
    ethereum = new EthereumBridge()
    wrapper = mount(<SafeUpgrades safe={ safe } ethereum={ ethereum } />)

    proxyInput = wrapper.find('input[name="proxy"]').at(0)
    proxyLabel = wrapper.find('label').at(0)

    implementationInput = wrapper.find('input[name="new-implementation"]').at(0)
    implementationLabel = wrapper.find('label').at(1)

    submitButton = wrapper.find('button')
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // proxy input validation

  it('fails if the proxy input is not a valid address', () => {
    act(() => {
      proxyInput.simulate('change', { target: { value: addressBook.notAnAddress } })
    })

    expect(proxyLabel.text()).toBe("Contract or address expected")
  })


  it('fails if the proxy address is not EIP 1967 compatible', async () => {
    ethereum.detect.mockResolvedValue(null)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.notAProxy } })
    })

    expect(proxyLabel.text()).toBe("This proxy is not EIP 1967 compatible")
  })


  it('fails if the proxy is not managed by the Safe', async () => {
    ethereum.detect.mockResolvedValue(externallyManagedProxy)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.notAProxy } })
    })

    expect(proxyLabel.text()).toBe("This proxy is not managed by this Safe")
  })


  it('fails if the proxyAdmin is not managed by the Safe', async () => {
    ethereum.detect.mockResolvedValue(externallyManagedProxyAdmin)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.proxy } })
    })

    expect(proxyLabel.text()).toBe("This proxy's admin is not managed by this Safe")
  })


  it('fails if the proxyAdmin is not managed by any address', async () => {
    ethereum.detect.mockResolvedValue(unmanagedProxyAdmin)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.proxy } })
    })

    expect(proxyLabel.text()).toBe("This proxy's admin is not managed by any address")
  })

  // implementation input

  it('fails if the implementation input is not a valid address', () => {
    act(() => {
      implementationInput.simulate('change', { target: { value: addressBook.notAnAddress } })
    })

    expect(implementationLabel.text()).toBe("Contract or address expected")
  })


  it('fails if the implementation address has no bytecode', async () => {
    ethereum.getCode.mockResolvedValue('0x')

    await act(async () => {
      implementationInput.simulate('change', { target: { value: addressBook.newImplementation } })
    })

    expect(implementationLabel.text()).toBe("This implementation has no bytecode")
  })


  it('fails if the implementation address is the current proxy implementation', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect
      .mockResolvedValueOnce(safeManagedProxy)
      .mockResolvedValueOnce(null)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.proxy } })
    })

    await act(async () => {
      implementationInput.simulate('change', { target: { value: addressBook.previousImplementation } })
    })

    expect(proxyLabel.text()).toBe("Proxy address")
    expect(implementationLabel.text()).toBe("Proxy already points to this implementation")
  })


  it('fails if the implementation input is a proxy', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect.mockResolvedValue(safeManagedProxy)

    await act(async () => {
      implementationInput.simulate('change', { target: { value: addressBook.proxy } })
    })

    expect(implementationLabel.text()).toBe("New implementation can't be a proxy contract")
  })

  // form validation

  it('renders submit button disabled by default', () => {
    expect(submitButton.prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if proxy is valid but implementation is empty', async () => {
    ethereum.detect.mockResolvedValue(safeManagedProxy)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.proxy } })
      implementationInput.simulate('change', { target: { value: '' } })
    })

    expect(proxyLabel.text()).toBe("Proxy address")
    expect(implementationLabel.text()).toBe("New implementation address")
    expect(submitButton.prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if implementation is valid but proxy is empty', async () => {
    ethereum.detect.mockResolvedValue(null)
    ethereum.hasBytecode.mockResolvedValue(true)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: '' } })
      implementationInput.simulate('change', { target: { value: addressBook.newImplementation } })
    })

    expect(proxyLabel.text()).toBe("Proxy address")
    expect(implementationLabel.text()).toBe("New implementation address")
    expect(submitButton.prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if proxy is valid but implementation is not', async () => {
    ethereum.detect.mockResolvedValue(safeManagedProxy)
    ethereum.hasBytecode.mockResolvedValue(false)

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.proxy } })
      implementationInput.simulate('change', { target: { value: addressBook.newImplementation } })
    })

    expect(proxyLabel.text()).toBe("Proxy address")
    expect(implementationLabel.text()).not.toBe("New implementation address")
    expect(submitButton.prop('disabled')).toBe(true)
  })


  it('renders submit button disabled if implementation is valid but proxy is not', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect
      .mockResolvedValueOnce(externallyManagedProxy) // proxy
      .mockResolvedValueOnce(null) // implementation

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.proxy } })
      implementationInput.simulate('change', { target: { value: addressBook.newImplementation } })
    })

    expect(proxyLabel.text()).not.toBe("Proxy address")
    expect(implementationLabel.text()).toBe("New implementation address")
    expect(submitButton.prop('disabled')).toBe(true)
  })


  it('renders submit button enabled if proxy and implementation are valid', async () => {
    ethereum.hasBytecode.mockResolvedValue(true)
    ethereum.detect
      .mockResolvedValueOnce(safeManagedProxy) // proxy
      .mockResolvedValueOnce(null) // implementation

    await act(async () => {
      proxyInput.simulate('change', { target: { value: addressBook.proxy } })
      implementationInput.simulate('change', { target: { value: addressBook.newImplementation } })
    })

    expect(proxyLabel.text()).toBe("Proxy address")
    expect(implementationLabel.text()).toBe("New implementation address")
    expect(submitButton.prop('disabled')).toBe(true)
  })


  it('submits transaction to Safe', async () => {
    // safe.sdk.sendTransactions = jest.fn()
    // ethereum.hasBytecode.mockResolvedValue(true)
    // ethereum.detect
    //   .mockResolvedValueOnce(safeManagedProxy) // proxy
    //   .mockResolvedValueOnce(null) // implementation

    // act(() => {
    //   proxyInput.simulate('change', { target: { value: addressBook.notAnAddress } })
    // })

    // await act(async () => {
    //   proxyInput.props().onChange({ target: { value: 'asd' } })

    //   // implementationInput.simulate('change', { target: { value: addressBook.newImplementation } })
    //   // submitButton.props().onClick()
    // })

    // console.log(1, proxyInput.props())


    // const tx = undefined
    // expect(safe.sdk.sendTransactions).toBeCalledWith([tx])
  })
})
