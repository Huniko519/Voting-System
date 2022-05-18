require('colors');
const fs = require('fs');
const abiVoting = require("../artifacts/contracts/IRC20.sol/IRC20.json");

const hre = require("hardhat");

async function main() {
	const signer = await hre.ethers.getSigner();
	const network = await signer.provider._networkPromise;
	const chainId = network.chainId;
	const rpc = 'http://127.0.0.1:7545'
	
	console.log('Starting ERC20 deploying' + ('(' + String(chainId).red + ')') + ' by ', signer.address.yellow);

	console.log('Deploying ERC20 contract...'.blue);
	const Voting = await hre.ethers.getContractFactory("IRC20");
	const voting = await Voting.deploy("Tether USD", "USDT", 18);
	const mintAmount = BigInt(100) * BigInt(1e18)
	const tx = await voting.mint("0x" + mintAmount.toString(16))
	await tx.wait();
	const votingAddress = voting.address;
	console.log('\tVoting\t' + votingAddress.green);

	console.log('writing abis and addresses...'.blue);
	/* -------------- writing... -----------------*/
	fs.writeFileSync(`./src/config/config.json`,  	 JSON.stringify({
		usdt: votingAddress,
		rpc
	}, null, 4));
	fs.writeFileSync(`./src/config/abis/irc20.json`,  	 JSON.stringify(abiVoting.abi, null, 4));
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
