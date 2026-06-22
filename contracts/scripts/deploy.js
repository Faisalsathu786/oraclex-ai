const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Network:", hre.network.name);

  const AccessManager = await ethers.getContractFactory("OracleXAccessManager");
  const accessManager = await upgrades.deployProxy(AccessManager, [deployer.address, 250], {
    initializer: "initialize",
    kind: "uups"
  });
  await accessManager.waitForDeployment();
  const accessManagerAddress = await accessManager.getAddress();
  console.log("AccessManager:", accessManagerAddress);

  const Treasury = await ethers.getContractFactory("OracleXTreasury");
  const treasury = await upgrades.deployProxy(Treasury, [accessManagerAddress], {
    initializer: "initialize",
    kind: "uups"
  });
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury:", treasuryAddress);

  const Market = await ethers.getContractFactory("OracleXMarket");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("Market Impl:", marketAddress);

  const Factory = await ethers.getContractFactory("OracleXFactory");
  const factory = await upgrades.deployProxy(Factory, [accessManagerAddress, marketAddress, treasuryAddress], {
    initializer: "initialize",
    kind: "uups"
  });
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("Factory:", factoryAddress);

  // Create test market
  const outcomes = ["Pakistan", "India", "Australia", "England"];
  const endDate = Math.floor(Date.now() / 1000) + 86400 * 30;
  const tx = await factory.createMarket(
    "Who wins the Cricket World Cup?",
    "Predict the winner of the upcoming Cricket World Cup 2026",
    "Sports",
    "",
    outcomes,
    "https://example.com/results",
    endDate
  );
  const receipt = await tx.wait();
  console.log("Test market created");

  console.log("\n=== Deployment Summary ===");
  console.log("AccessManager:", accessManagerAddress);
  console.log("Treasury:", treasuryAddress);
  console.log("Market Implementation:", marketAddress);
  console.log("Factory:", factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
