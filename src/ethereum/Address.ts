import { Result, ok, err } from '../Result'
import { hexZeroPad, getAddress } from 'ethers/utils'


export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export default class Address {
  private address: string

  /**
   *
   * @param address must be a valid address. Use `parse` factory method instead if you're unsure of this.
   */
  private constructor(address: string) {
    this.address = address
  }

  public static parse(address: string): Result<Address, string> {
    if (address.length === 0) {
      return err('Contract or address expected')
    }

    try {
      const parsedAddress = getAddress(address)
      return ok(new Address(parsedAddress))
    } catch {
      return err('Contract or address expected')
    }
  }

  public static fromUint256(uint256: string): Address {
    const padded = hexZeroPad(uint256.toString(), 32)
    const address = padded.replace('0x000000000000000000000000', '0x')
    return new Address(getAddress(address))
  }

  /***
   * When you know it's a valid address and don't want to deal
   * with potential malformed stuff... (for example, in tests)
   */
  public static unsafeCreate(address: string): Address {
    return new Address(address)
  }

  public toString(): string {
    return this.address
  }

  public isZeroAddress(): boolean {
    return !this.address || this.address === ZERO_ADDRESS
  }

  public isEquivalent(address: string): boolean {
    return this.address.toLowerCase() === address.toLowerCase()
  }
}