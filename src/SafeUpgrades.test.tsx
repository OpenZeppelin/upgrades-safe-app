import SafeUpgrades from './SafeUpgrades'


// proxy input validation

it('fails if the proxy input is not a valid address', () => {
})


it('fails if the proxy address is not EIP 1967 compatible', () => {
})


it('fails if the proxy is not managed by the Safe', () => {
})


it('fails if the proxyAdmin is not managed by the Safe', () => {
})


it('fails if the proxy is not managed by any address', () => {
})

// implementation input

it('fails if the implementation input is not a valid address', () => {
})


it('fails if the implementation address has no bytecode', () => {
})


it('fails if the implementation address is the current proxy implementation', () => {
})


it('fails if the implementation input is a proxy', () => {
})

// form validation

it('renders error messages to the user', () => {
})


it('renders submit button disabled by default', () => {
})


it('renders submit button disabled if proxy or implementation are empty', () => {
})


it('renders submit button disabled if proxy or implementation are invalid', () => {
})


it('renders submit button enabled if proxy and implementation are valid', () => {
})


it('submits transaction to Safe', () => {
})
