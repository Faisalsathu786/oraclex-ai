const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Network:", hre.network.name);

  // Deploy AccessManager
  const AccessManager = await ethers.getContractFactory("OracleXAccessManager");
  const accessManager = await upgrades.deployProxy(AccessManager, [deployer.address, 250], {
    initializer: "initialize",
    kind: "uups"
  });
  await accessManager.waitForDeployment();
  const accessManagerAddress = await accessManager.getAddress();
  console.log("OracleXAccessManager deployed to:", accessManagerAddress);

  // Deploy Treasury
  const Treasury = await ethers.getContractFactory("OracleXTreasury");
  const treasury = await upgrades.deployProxy(Treasury, [accessManagerAddress], {
    initializer: "initialize",
    kind: "uups"
  });
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("OracleXTreasury deployed to:", treasuryAddress);

  // Deploy Market implementation (not upgradeable itself)
  const Market = await ethers.getContractFactory("OracleXMarket");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("OracleXMarket implementation deployed to:", marketAddress);

  // Deploy Factory
  const Factory = await ethers.getContractFactory("OracleXFactory");
  const factory = await upgrades.deployProxy(Factory, [accessManagerAddress, marketAddress, treasuryAddress], {
    initializer: "initialize",
    kind: "uups"
  });
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("OracleXFactory deployed to:", factoryAddress);

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("AccessManager:", accessManagerAddress);
  console.log("Treasury:", treasuryAddress);
  console.log("Market Implementation:", marketAddress);
  console.log("Factory:", factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
