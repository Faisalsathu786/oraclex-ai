const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const AccessManager = await ethers.getContractFactory("OracleXAccessManager");
  const accessManager = await AccessManager.deploy(250);
  await accessManager.waitForDeployment();
  const am = await accessManager.getAddress();
  console.log("AccessManager:", am);

  const Treasury = await ethers.getContractFactory("OracleXTreasury");
  const treasury = await Treasury.deploy(am);
  await treasury.waitForDeployment();
  const tr = await treasury.getAddress();
  console.log("Treasury:", tr);

  const Market = await ethers.getContractFactory("OracleXMarket");
  const marketImpl = await Market.deploy();
  await marketImpl.waitForDeployment();
  const mk = await marketImpl.getAddress();
  console.log("Market Impl:", mk);

  const Factory = await ethers.getContractFactory("OracleXFactory");
  const factory = await Factory.deploy(am, mk, tr);
  await factory.waitForDeployment();
  const fac = await factory.getAddress();
  console.log("Factory:", fac);

  // Grant moderator to deployer
  await accessManager.addModerator(deployer.address);
  console.log("Moderator added");

  // Create test market
  const endDate = Math.floor(Date.now() / 1000) + 86400 * 30;
  const tx = await factory.createMarket(
    "Who wins the Cricket World Cup 2026?",
    "Predict the winner", "Sports", "",
    ["Pakistan", "India", "Australia", "England"], endDate
  );
  console.log("Market created:", tx.hash);

  console.log("\n=== Addresses ===");
  console.log("AccessManager =", am);
  console.log("Treasury =", tr);
  console.log("Market =", mk);
  console.log("Factory =", fac);
}

main().catch(console.error);
