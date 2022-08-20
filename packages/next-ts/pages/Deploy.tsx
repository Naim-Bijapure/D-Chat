import { LSPFactory } from "@lukso/lsp-factory.js";
import { ethers, Signer } from "ethers";
import type { NextPage } from "next";
import { useNetwork, useProvider } from "wagmi";

import account from "../contracts/account.json";
import { Vault__factory } from "../contracts/contract-types";

// up address
// 0xe0207dAdFE5f6F5a6ce0a3C7660d592124d9D56A
// vault address
// 0x0D46e40d2BFf4aBae72539fa61EC6Ecb6174505B
/**----------------------
 * TEMP DEPLOYMENT
 * ---------------------*/

const Deploy: NextPage = () => {
  const provider = useProvider();
  const { chain: activeChain } = useNetwork();

  const RPC_ENDPOINT: string = activeChain?.rpcUrls ? activeChain?.rpcUrls.default : "";
  const CHAIN_ID: number = activeChain?.id ? activeChain?.id : 0;

  const onCommonUPandVault: () => any = async (): Promise<any> => {
    console.log("onCreateUP: started ");

    const commonSigner = new ethers.Wallet(account.privateKey, provider); // <---- custom signer from EOA account

    /** ----------------------
     *
     *TO CREATE UP
     * ---------------------*/
    const lspFactory = new LSPFactory(RPC_ENDPOINT, {
      deployKey: account.privateKey,
      chainId: CHAIN_ID,
    });

    // @ts-ignore
    async function createUniversalProfile(): any {
      const deployedContracts = await lspFactory.UniversalProfile.deploy({
        // controllerAddresses: [mainAddress as string], // our EOA that will be controlling the UP
        controllerAddresses: [account.address], // our EOA that will be controlling the UP
        lsp3Profile: {
          name: "this is main common profile",
          description: "a common profile",
          tags: ["Public Profile cool test"],
          links: [
            {
              title: "My Website",
              url: "https://naimbijapure.eth",
            },
          ],
        },
        // @ts-ignore
        LSP4TokenName: "coool",
      });
      console.log("createUniversalProfile:done ");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return deployedContracts;
    }
    const output = await createUniversalProfile();
    // console.log("output: ", output);

    const upAddress = output["LSP0ERC725Account"]["address"] as string;
    // create a common up
    // setCommonUPandVault({ ...commonUPandVault, upAddress });

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

  return (
    <>
      <div className="">
        <button className="btn btn-primary" onClick={onCommonUPandVault}>
          Create UP and Vault
        </button>
      </div>
    </>
  );
};

export default Deploy;
