import React, { useEffect, useState } from 'react'
import ReactGA from 'react-ga'
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import EthereumBridge from './ethereum/EthereumBridge'

import SafeUpgrades from './SafeUpgrades'
import CircularProgress from '@material-ui/core/CircularProgress'


const App: React.FC = () => {
  const [safeInfo, setSafeInfo] = useState<SafeInfo>()
  const ethereum = new EthereumBridge()
  const safe = {
    sdk: initSdk([/.*localhost.*/]),
    info: safeInfo
  }

  useEffect(() => {
    safe.sdk.addListeners({ onSafeInfo: setSafeInfo })
    return () => safe.sdk.removeListeners()
  }, [safe.sdk])

  useEffect(() => {
    ReactGA.initialize('UA-85043059-8')
    ReactGA.set({ anonymizeIp: true })
  }, []);

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