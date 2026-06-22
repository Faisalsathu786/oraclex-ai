const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Network:", hre.network.name);

  // Deploy AccessManager
  const AccessManager = await hre.ethers.getContractFactory("OracleXAccessManager");
  const accessManager = await AccessManager.deploy(250); // 2.5% fee
  await accessManager.waitForDeployment();
  const amAddr = await accessManager.getAddress();
  console.log("AccessManager:", amAddr);

  // Deploy Treasury
  const Treasury = await hre.ethers.getContractFactory("OracleXTreasury");
  const treasury = await Treasury.deploy(amAddr);
  await treasury.waitForDeployment();
  const trAddr = await treasury.getAddress();
  console.log("Treasury:", trAddr);

  // Deploy Market implementation
  const Market = await hre.ethers.getContractFactory("OracleXMarket");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const mkAddr = await market.getAddress();
  console.log("Market Impl:", mkAddr);

  // Deploy Factory
  const Factory = await hre.ethers.getContractFactory("OracleXFactory");
  const factory = await Factory.deploy(amAddr, mkAddr, trAddr);
  await factory.waitForDeployment();
  const facAddr = await factory.getAddress();
  console.log("Factory:", facAddr);

  // Setup: grant moderator to deployer
  await accessManager.addModerator(deployer.address);

  // Create test market
  const endDate = Math.floor(Date.now() / 1000) + 86400 * 30;
  const tx = await factory.createMarket(
    "Who wins the Cricket World Cup 2026?",
    "Predict the winner of the upcoming Cricket World Cup.",
    "Sports", "",
    ["Pakistan", "India", "Australia", "England"],
    endDate
  );
  const receipt = await tx.wait();
  console.log("Test market created. Tx:", receipt.hash);

  console.log("\n=== Deployment Summary ===");
  console.log("AccessManager:", amAddr);
  console.log("Treasury:", trAddr);
  console.log("Market:", mkAddr);
  console.log("Factory:", facAddr);
}

main().catch(console.error);
