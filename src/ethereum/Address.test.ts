import Address, { ZERO_ADDRESS } from './Address'

describe('parse', () => {
  test('parse a valid checksum address string', () => {
    const parsed = Address.parse('0xb13286cC2d0e4f0b1b1829048c128337BF1DAb60')
    expect(parsed.isOk()).toBeTruthy()

    parsed.map((address) => {
      expect(address.toString()).toEqual('0xb13286cC2d0e4f0b1b1829048c128337BF1DAb60')
    })
  })

  test('parse a valid no-checksum address string', () => {
    const parsed = Address.parse('0xb13286cC2d0e4f0b1b1829048c128337BF1DAb60'.toLowerCase())
    expect(parsed.isOk()).toBeTruthy()

    parsed.map((address) => {
      expect(address.toString()).toEqual('0xb13286cC2d0e4f0b1b1829048c128337BF1DAb60')
    })
  })

  test('fail an empty string', () => {
    const parsed = Address.parse('')
    expect(parsed.isErr()).toBeTruthy()
  })

  test('fail an invalid address', () => {
    const parsed = Address.parse('not a valid address')
    expect(parsed.isErr()).toBeTruthy()
  })

  test('fail an address that does not checksum', () => {
    const parsed = Address.parse('0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d')
    expect(parsed.isErr()).toBeTruthy()
  })
})

test('isZeroAddress', () => {
  expect(Address.unsafeCreate(ZERO_ADDRESS).isZeroAddress()).toBeTruthy()
  expect(Address.unsafeCreate('0xb13286cC2d0e4f0b1b1829048c128337BF1DAb60').isZeroAddress()).toBeFalsy()
})