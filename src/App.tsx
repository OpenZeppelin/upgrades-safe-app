import React, { useEffect, useState } from 'react'
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import EthereumBridge from './ethereum/EthereumBridge'

import SafeUpgrades from './SafeUpgrades'
import CircularProgress from '@material-ui/core/CircularProgress'

const ethereum = new EthereumBridge()
const safeSdk = initSdk()

const App: React.FC = () => {
  const [safeInfo, setSafeInfo] = useState<SafeInfo>()
  const safe = {
    sdk: safeSdk,
    info: safeInfo
  }

  useEffect(() => {
    safe.sdk.addListeners({ onSafeInfo: setSafeInfo })
    return () => safe.sdk.removeListeners()
  }, [safe.sdk])

  return (
    <div>
      {( safe.info || process.env.NODE_ENV === 'development'
        ? <SafeUpgrades safe={ safe } ethereum={ ethereum } />
        : <>
          Loading...<br />
          <CircularProgress />
        </>
      )}
    </div>
  )
}

export default App