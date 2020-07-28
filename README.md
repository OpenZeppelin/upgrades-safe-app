# OpenZeppelin | Upgrades Safe App

Simple Gnosis Safe App that allows the user to upgrade a contract owned by the multisig by entering the proxy address and a new implementation.

## Development
Install dependencies and run the local development server by running

```bash
$ yarn
$ yarn start
```

This will open a new tab in your browser pointing to `https://localhost:3000` where you will be able to interact with the app in development mode, meaning that it won't receive the [Gnosis SDK object](https://github.com/gnosis/safe-apps-sdk) thus it will not be able to actually send transactions to it.

In order to interact with a real Safe SDK, you will need to deploy the app to IPFS (see below).

## Testing
To test logic components, run:

```bash
$ yarn test:buidler
```

To test the UI, run:

```bash
$ yarn test:ui
```

And to test the whole suite, run:

```bash
$ yarn test
```

## Deployment

### 1. Run the IPFS daemon

To deploy the app you first need to [install the ipfs client](https://docs.ipfs.io/install/) and then run the daemon

```bash
$ ipfs daemon
```
> Notice that if you don't run the daemon, you will be deploying the app to a local IPFS network and you won't be able to use it in your Safe (see note below)

### 2. Deploy to IPFS mainnet

Then, you're ready to deploy your app to the network

```bash
$ yarn deploy

...
added QmaNmCcABUwSfgmXg6zgukcNjjg8ot3SdqKSoxFLGEddbr build
```

We then use the hash of our `build` folder to create a link with the form of `https://ipfs.io/ipfs/<BUILD-HASH>`. Using our example deployment it would look like this:

```
https://ipfs.io/ipfs/QmaNmCcABUwSfgmXg6zgukcNjjg8ot3SdqKSoxFLGEddbr
```

Finally, we add the Safe App IPFS link to our Gnosis Safe as explained in the [official guide](https://help.gnosis-safe.io/en/articles/4022030-add-a-custom-safe-app).

> Note: although we could deploy the app to a local version of the IPFS network, it would require to also run a local instance of the [Gnosis Safe react app](https://github.com/gnosis/safe-react) and modify it to accept local IPFS links which ends up being more cumbersome than just deploying it to IPFS' public mainnet.
