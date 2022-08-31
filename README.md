
# 🏗 Scaffold-ETH-NextJS: DOmagle Build

## Talk to Strangers in a Decentralized way on Lukso Network

###### LIVE DEMO: https://lukso-chat-naimbijapure7407.vercel.app

###### Youtube video: https://youtu.be/vHEhkRqQcdU

-----

> Start random chats with strangers based on interests, and create direct chats with someone you know from a simple interface! 🚀

![image](https://user-images.githubusercontent.com/5996795/187472210-d2455f08-b1a8-4f52-af21-02a3ef716807.png)

[Hackathon: LUKSO Build UP! #1: Social & DAOs - Chat DApp](https://gitcoin.co/issue/29157) build of an encrypted Chat DApp on Lukso Network using Scaffold-ETH-NextJS framework.

A Chat Dapp that is built on the Lukso network and leverages the Lukso Standards Proposals(LSPs) and Universal Profiles to create a highly decentralized chat application that is blockchain based.

# Built By

- [Naim Bijapure](https://github.com/Naim-Bijapure)
- [LScorpion](https://github.com/ldsanchez)

# Features

- Random Chat based on Interests
- Direct Chat
- Encrypted messages

# Implementation

DOmagle is implemented by using UP and Vault standards

![Architecture](https://user-images.githubusercontent.com/22323693/187588959-8e7b45ec-0938-434c-b9fe-f17d7370185d.png)

## UP and Vault Creation

For DOmagle We create a common UP and Vault using the lspFactory.

- Deploy.tsx

```typescript
/* ---------------------
*       CREATE UP
* ---------------------*/

const lspFactory = new LSPFactory(RPC_ENDPOINT, {
	deployKey: account.privateKey,
	chainId: CHAIN_ID,
});

async function createUniversalProfile(): any {
	const deployedContracts = await lspFactory.UniversalProfile.deploy({
		controllerAddresses: [account.address], // our EOA that will be controlling the UP

		lsp3Profile: {
			name: "DOmagle",
			description: "DOmagle main common profile",
			tags: ["Public Profile cool test"],
			links: [
				{
					title: "DOmagle",
					url: "https://domagle.eth",
				},
			],
		},
		LSP4TokenName: "DOM",
	});

	return deployedContracts;
}

const output = await createUniversalProfile();

const upAddress = output["LSP0ERC725Account"]["address"] as string;

// 1. DEPLOY VAULT
const vault = new Vault__factory(commonSigner as Signer);

// 2. SET THE UP AS OWNER

const deployedVault = await vault.deploy(upAddress);
const owner = await deployedVault.owner();
const vaultAddress = deployedVault.address;

console.log("upAddress: ", upAddress);
console.log("vaultAddress: ", vaultAddress);
console.log("vault: owner ", owner);
};
```


## Grant Permissions

Then we grant users addresess permissions to interact with the vault.

- grantPermission.ts

```typescript
async function grantPersmission(address): Promise<boolean> {
	const UP: ethers.Contract = global.UP;
	const KM: ethers.Contract = global.KM;
	const erc725: ERC725 = global.erc725;
	const walletSigner: Signer = global.walletSigner;

	try {

		/** ----------------------
		* set the call permission
		* ---------------------*/

		const beneficiaryAddress = address; // EOA address of an exemplary person
		const beneficiaryPermissions = erc725?.encodePermissions({

			// ADDPERMISSIONS: true,
			CALL: true,
			// CHANGEOWNER: true,
			// CHANGEPERMISSIONS: true,
			// DELEGATECALL: true,
			// DEPLOY: true,
			// SETDATA: true,
			// SIGN: true,
			// STATICCALL: true,
			// SUPER_CALL: true,
			// SUPER_DELEGATECALL: true,
			// SUPER_SETDATA: true,
			// SUPER_STATICCALL: true,
			// SUPER_TRANSFERVALUE: true,
			// TRANSFERVALUE: true,
		});

		// Encode the data key-value pairs of the permissions to be set

		const data = erc725?.encodeData({
			keyName: "AddressPermissions:Permissions:<address>",
			dynamicKeyParts: beneficiaryAddress,
			value: beneficiaryPermissions,
		});

		const payload = UP.interface.encodeFunctionData("setData(bytes32,bytes)", [data.keys[0], data.values[0]]);

		// Send the transaction via the Key Manager contract

		const tx = await KM.connect(walletSigner).execute(payload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
		const rcpt = await tx.wait();

		/** ----------------------
		*  Add allowed address
		* ---------------------*/

		const allowedAddressData = erc725?.encodeData({
			keyName: "AddressPermissions:AllowedAddresses:<address>",
			dynamicKeyParts: address,
			value: [VAULT_ADDRESS],
		});

		const allowedAddressDataPayload = UP.interface.encodeFunctionData("setData(bytes32[],bytes[])", [
			allowedAddressData?.keys,
			allowedAddressData?.values,
		]);

		const tx1 = await KM.connect(walletSigner).execute(allowedAddressDataPayload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
		const rcpt1 = await tx1.wait();

		return true;

	} catch (error) {

		console.log("error: ", error);
		return false;

	}

}
```


## Chat

On the backend we create a dynamic key for both parties 

- connectUser.ts

```typescript
	const addresses = [toAddress, userAddress].sort();
	connectUsers[userAddress].users = addresses;
	matchedAdress = userAddress;

	// create a dynamic uinque key
	const dynamicKey = ERC725.encodeKeyName(KEY_NAME, [...addresses]);
	connectUsers[userAddress].dynamicKey = dynamicKey;
	connectUsers[userAddress].status = "MATCH";
```


We create and push chatSchema

- ChatView.tsx | DirectChatView.tsx

```typescript
const KEY_NAME = "chat:<string>:<string>";

const chatSchema = {
	name: "chat:<string>:<string>",
	key: "0x",
	keyType: "Mapping",
	valueType: "string[]",
	valueContent: "String",
};

erc725schema.push(chatSchema);
```

Encode and Decode the chat mesages (we use eth-crypto for encryption in the backend)

```typescript
			const msgData = {
				address: address,
				message: chatMessage,
			};

			const reqData = {
				type: "ENCRYPT",
				msgData,
			};

			// encrypt the data
			const { data } = await axios.post(`${BASE_URL}/api/encryptDecryptMsg`, {
				...reqData,
			});

			const encryptedData = data.encryptedData;

			const encodedChatData = erc725?.encodeData({
				keyName: KEY_NAME,
				dynamicKeyParts: [...users],
				value: [...oldData, encryptedData],
			});

			const setDataVaultPayload = vault.interface.encodeFunctionData("setData(bytes32[],bytes[])", [
				encodedChatData?.keys,
				encodedChatData?.values,
			]);

			const vaultExecutePayload = vault.interface.encodeFunctionData("execute", [
				0,
				vault.address as string,
				0,
				setDataVaultPayload,
			]);

			// on execute call

			const tx = await km?.connect(signer as Signer).execute(vaultExecutePayload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
			const rcpt = await tx.wait();
```

# Dapp

## Random Chat

- Find a Random Chat based on interests

![image](https://user-images.githubusercontent.com/5996795/187508586-32170256-66f8-4e55-b0d4-0f2f96063d80.png)

- Then wait for a match

![image](https://user-images.githubusercontent.com/5996795/187510075-b2e43ad1-6e49-4c8a-b756-b48e00d9b843.png)

- Start your conversation with the stranger

![image](https://user-images.githubusercontent.com/5996795/187510380-90735127-2c19-4133-b495-f77e0912a282.png)

## Direct Chat

- When someone gives you their address, you can chat directly

![image](https://user-images.githubusercontent.com/5996795/187510884-c60d5017-bc68-4405-ad18-8f0cf3a5f0a8.png)

![image](https://user-images.githubusercontent.com/5996795/187511220-b92603f2-af82-4736-b37a-690b578c4c88.png)


# Tech Stack

- 🏗 Scaffold-Eth-next Typescript  
- erc725.js  
- lsp-contracts.js
- eth-crypto

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 Scaffold-Eth-NextJS: DOmagle Build

```bash
git clone https://github.com/Naim-Bijapure/D-Chat.git
```

> install packages and setup Foundry: 

```bash
cd D-Chat
yarn install
yarn setup
```

> Start your 👷‍  Anvil chain:

```bash
yarn chain
```

🌱 Remember to generate your account with `yarn generate`, it will be generated in `packages/foundry-ts/generated/account.json` 

> in a second terminal window,:

```bash
cd D-Chat
yarn deploy
```

> in a third terminal window, start your 📱 frontend:

🔏 Edit `packages/next-ts/components/configs/appContract.config.ts` to enable testing on localhost

📝 Edit `packages/next-ts/constants/index.ts` to change your backend

```bash
cd D-Chat
yarn run dev
```

> in a fourth terminal window, 🛰 start the backend:

```bash
cd D-Chat/backend
yarn serve
```

📱 Open http://localhost:3000 to see the app

**Note:** To test locally, you need to deploy UP and Vault, for that go to http://localhost:3000/Deploy and copy UP and Vault addresses from broweser console, and edit `packages/backend/constants/index.ts` with the correspoding values of `UP_ADDRESS`, `VAULT_ADDRESS` and `RCP_URL`

# TO-DO

- Implementing Relayer
- Inttegrating Events with notification services
- Bug Fixes :)

# Deploy it! 🛰

🛰 Use a faucet like https://faucet.l16.lukso.network/ to fund your deployer address 

🚀  Run yarn deploy to deploy to the  network of choice 

🔬 Inspect the block explorer for the network you deployed to... make sure your contract is there.

# 🚢 Ship it! 🚁

📦 Run yarn vercel deploy.

```bash
yarn vercel:deploy
```

# 🏃💨 Speedrun Ethereum

Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
