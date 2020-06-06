import React, { useEffect, useState } from 'react'
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk'

import SafeUpgrades from './SafeUpgrades'
import CircularProgress from '@material-ui/core/CircularProgress'


const App: React.FC = () => {
  const [safeInfo, setSafeInfo] = useState<SafeInfo>()
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
      {( safe.info
        ? <SafeUpgrades safe={ safe } />
        : <>
          Loading...<br />
          <CircularProgress />
        </>
      )}
    </div>
  )
}

export default App