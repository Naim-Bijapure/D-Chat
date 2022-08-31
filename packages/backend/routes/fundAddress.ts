import { ethers, Signer, Wallet } from "ethers";
import { Router } from "express";

const router = Router();

global.fundedAddresses = {};

// define the home page route
router.get("/", async (req, res) => {
    const address = req.query.address;
    const signer: Wallet = global.walletSigner;
    let mainAccountBalance: any = await signer.provider.getBalance(process.env.ACCOUNT_ADDRESS);
    mainAccountBalance = ethers.utils.formatEther(mainAccountBalance.toString());

    let addressBalance: any = await signer.provider.getBalance(address as string);
    addressBalance = ethers.utils.formatEther(addressBalance.toString());
    // console.log("addressBalance: ", Math.round(addressBalance));

    //     transfer balance
    if (
        mainAccountBalance > 0 &&
        Math.round(addressBalance) === 0 &&
        global.fundedAddresses[address as string] === undefined
    ) {
        let sendTx = signer.sendTransaction({
            from: process.env.ACCOUNT_ADDRESS,
            to: address as string,
            value: ethers.utils.parseEther("2"),
            gasLimit: 100000,
        });
        let rcpt = await (await sendTx).wait();
        console.log("rcpt: ", rcpt);
        global.fundedAddresses[address as string] = true;
        res.status(200).json({ msg: "FUNDED" });
    } else {
        res.status(200).json({ msg: "NOT_FUNDED" });
    }
});

export default router;
