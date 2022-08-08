# Decentralized Chat
A Chat Dapp that is built on the Lukso network and leverages the Lukso Standards Proposals(LSPs) and Universal Profies to create a highly decentralized chat application the is blockchain based.

# Tech Stack
 - 🏗 Scaffold-Eth-next Typescript<br />
 - erc725.js<br />
 - lsp-contracts.js<br />

## Typescript

This is the typescript repo of scaffold.eth with foundry, rainbowkit , wagmi hooks and nextjs.

The directories that you'll use are:

```bash
packages/next-ts/
packages/foundry-ts/
```

## Quick Start

Running the app

0. print all the basic project commands
   ```bash
   yarn scafold:help
   ```
1. install foundry and  project dependencies

   ```bash
   yarn install

   yarn setup
   ```

   it will install or update foundry

2. start a foundry node `open a new command prompt`

   ```bash
   yarn chain
   ```

3. run the app, `open a new command prompt`

   ```bash
   # build foundry & external contracts types
   yarn contracts:build
   # deploy your foundry contracts
   yarn deploy --network xx (without --network it will deploy on localhost)
   # start the app
   yarn dev
   ```

4. deploy on vercel.

```bash
 yarn vercel:deploy
 ## (login vercel  at first time)
```
