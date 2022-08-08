# Decentralized Chat
A Chat Dapp that is built on the Lukso network and leverages the Lukso Standards Proposals(LSPs) and Universal Profies to create a highly decentralized chat application the is blockchain based.

# Tech Stack
 🏗 Scaffold-Eth-next Typescript
 erc725.js
 lsp-contracts.js

## Typescript

This is the typescript repo of scaffold.eth with foundry, rainbowkit , wagmi hooks and nextjs.

The directories that you'll use are:

```bash
packages/next-ts/
packages/foundry-ts/
```

## Quick Start

Running the app

# NOTE !! : Rename .env.example file to .env file

- using only single .env file
- .env file at project root is required.

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

#### Template Configurations

##### Foundry configs

1. this template requires .env file rename **.env.example** file to **.env** file and add required id's
2. define created contracts inside `packages/foundry-ts/configs/index.ts` DEPLOY_CONTRACTS array
   ![2022-06-12_23-01](https://user-images.githubusercontent.com/22323693/173245694-eaf7b02e-2831-49ad-ab93-326470f6c589.png)

3. write test cases inside test folder follow [foundry doc](https://book.getfoundry.sh/forge/writing-tests.html)

4. installing forge packages
   follow [forge doc](https://book.getfoundry.sh/projects/dependencies.html)

##### Front end configs

1. contract setup
   go inside `packages/next-ts/components/configs/appContract.config.ts` file

- inside appContract.config.ts file add your contract json, and typechain factory module

2. target networks setup

- to define rainbow kit targeted networks inside .env file

- deployed contract's json file saved as ` foundry_contracts.json` file inside contracts dirctory

3. load a contract with hook

- to load a contract inside a component use useAppLoadContract() hook defined inside `packages/hooks/useAppLoadContract`
  ![2022-06-12_23-20](https://user-images.githubusercontent.com/22323693/173246408-9351e8ba-4b67-4a29-961f-3118359a641a.png)

4. to deploy web app on vercel.

- run `yarn vercel:deploy`
- fill up the vercel credentials and push the site

