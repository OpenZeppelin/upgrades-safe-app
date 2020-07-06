import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config"

usePlugin("@nomiclabs/buidler-ethers")
usePlugin("@nomiclabs/buidler-waffle")

const config: BuidlerConfig = {
  solc: {
    version: "0.6.8"
  },
  paths: {
    tests: './buidler-test'
  }
}

export default config
