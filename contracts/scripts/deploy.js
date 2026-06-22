require("@nomicfoundation/hardhat-ethers");

async function main() {
  // Use the private key from env instead of getSigners
  const { Wallet } = require("ethers");
  const hre = require("hardhat");
  const provider = hre.ethers.provider;
  const wallet = new Wallet(process.env.DEPLOYER_KEY, provider);
  console.log("Deploying with account:", wallet.address);

  // Deploy AccessManager
  const AccessManager = await hre.ethers.getContractFactory("OracleXAccessManager", wallet);
  const accessManager = await AccessManager.deploy(250);
  await accessManager.waitForDeployment();
  const am = await accessManager.getAddress();
  console.log("AccessManager:", am);

  // Deploy Treasury
  const Treasury = await hre.ethers.getContractFactory("OracleXTreasury", wallet);
  const treasury = await Treasury.deploy(am);
  await treasury.waitForDeployment();
  const tr = await treasury.getAddress();
  console.log("Treasury:", tr);

  // Deploy Market impl
  const Market = await hre.ethers.getContractFactory("OracleXMarket", wallet);
  const marketImpl = await Market.deploy();
  await marketImpl.waitForDeployment();
  const mk = await marketImpl.getAddress();
  console.log("Market:", mk);

  // Deploy Factory
  const Factory = await hre.ethers.getContractFactory("OracleXFactory", wallet);
  const factory = await Factory.deploy(am, mk, tr);
  await factory.waitForDeployment();
  const fac = await factory.getAddress();
  console.log("Factory:", fac);

  // Grant moderator
  const tx1 = await accessManager.addModerator(wallet.address);
  await tx1.wait();
  console.log("Moderator granted");

  // Create test market
  const endDate = Math.floor(Date.now() / 1000) + 86400 * 30;
  const tx2 = await factory.createMarket(
    "Who wins the Cricket World Cup 2026?",
    "Predict the winner", "Sports", "",
    ["Pakistan", "India", "Australia", "England"], endDate
  );
  await tx2.wait();
  console.log("Test market created:", tx2.hash);

  console.log("\nAccessManager =", am);
  console.log("Treasury =", tr);
  console.log("Market =", mk);
  console.log("Factory =", fac);
}

main().catch(console.error);
