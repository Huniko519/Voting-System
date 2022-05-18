require('colors');
const fs = require('fs');
const abiVoting = require("../artifacts/contracts/Voting.sol/Voting.json");

/* const hre = require("hardhat"); */

async function main() {
	const signer = await ethers.getSigner();
	const network = await signer.provider._networkPromise;
	const chainId = network.chainId;
	const rpc = 'http://127.0.0.1:7545'
	
	console.log('Starting ICICB' + ('(' + String(chainId).red + ')') + ' by ', signer.address.yellow);

	console.log('Deploying voting contract...'.blue);
	const Voting = await ethers.getContractFactory("Voting");
	const voting = await Voting.deploy();
	const votingAddress = voting.address;
	console.log('\tVoting\t' + votingAddress.green);

	console.log('writing abis and addresses...'.blue);
	/* -------------- writing... -----------------*/
	fs.writeFileSync(`./src/config/config.json`,  	 JSON.stringify({
		voting: votingAddress,
		rpc
	}, null, 4));
	fs.writeFileSync(`./src/config/abis/voting.json`,  	 JSON.stringify(abiVoting.abi, null, 4));
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
