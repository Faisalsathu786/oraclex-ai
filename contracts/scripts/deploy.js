async function main() {
  const hre = require("hardhat");
  const privateKey = process.env.PK || "0x0c1dfe99762ae15dcaa1713cbc1b750165a62bb310a148aeea1bf9be8eae3589";
  const { Wallet } = require("ethers");
  const provider = hre.ethers.provider;
  const wallet = new Wallet(privateKey, provider);
  console.log("Deployer:", wallet.address);

  // 1. AccessManager
  const AM = await hre.ethers.getContractFactory("OracleXAccessManager", wallet);
  const am = await AM.deploy(250);
  await am.waitForDeployment();
  const amAddr = await am.getAddress();
  console.log("AccessManager:", amAddr);

  // 2. Treasury
  const TR = await hre.ethers.getContractFactory("OracleXTreasury", wallet);
  const tr = await TR.deploy(amAddr);
  await tr.waitForDeployment();
  const trAddr = await tr.getAddress();
  console.log("Treasury:", trAddr);

  // 3. Market
  const MK = await hre.ethers.getContractFactory("OracleXMarket", wallet);
  const mk = await MK.deploy();
  await mk.waitForDeployment();
  const mkAddr = await mk.getAddress();
  console.log("Market:", mkAddr);

  // 4. Factory
  const FA = await hre.ethers.getContractFactory("OracleXFactory", wallet);
  const fa = await FA.deploy(amAddr, mkAddr, trAddr);
  await fa.waitForDeployment();
  const faAddr = await fa.getAddress();
  console.log("Factory:", faAddr);

  // 5. Grant moderator
  await (await am.addModerator(wallet.address)).wait();
  console.log("Moderator granted");

  // 6. Test market
  const endDate = Math.floor(Date.now() / 1000) + 86400 * 30;
  const tx = await fa.createMarket(
    "Who wins the Cricket World Cup 2026?", "Predict the winner",
    "Sports", "", ["Pakistan", "India", "Australia", "England"], endDate
  );
  console.log("Test market created:", tx.hash);

  console.log("\n--- ADDRESSES ---");
  console.log(amAddr, trAddr, mkAddr, faAddr);
}

main().catch(console.error);
