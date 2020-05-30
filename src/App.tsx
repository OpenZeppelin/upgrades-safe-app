import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk'

import DefenderSafe from './DefenderSafe'
import CircularProgress from '@material-ui/core/CircularProgress'


const App: React.FC = () => {
  const [safeInfo, setSafeInfo] = useState<SafeInfo>()
  const web3 = new Web3()
  const safe = {
    sdk: initSdk([/.*localhost.*/]),
    info: safeInfo
  }

  useEffect(() => {
    safe.sdk.addListeners({ onSafeInfo: setSafeInfo })
    return () => safe.sdk.removeListeners()
  }, [safe.sdk])

  return (
    <div>
      {( ! safe.info
        ? <DefenderSafe providers={{ web3, safe }} />
        : <>
          Loading...<br />
          <CircularProgress />
        </>
      )}
    </div>
  )
}

export default App