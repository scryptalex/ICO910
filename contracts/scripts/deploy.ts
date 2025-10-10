import { ethers, upgrades } from "hardhat";

async function main() {
  let usdtAddress = process.env.USDT_ADDRESS || "";

  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await upgrades.deployProxy(GameToken, [], { initializer: "initialize" });
  await gameToken.waitForDeployment();
  console.log("GameToken deployed:", await gameToken.getAddress());

  // If no USDT provided (or set to 'mock'), deploy a MockUSDT with large supply (testnet)
  if (!usdtAddress || usdtAddress.toLowerCase() === "mock") {
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const initialSupply = ethers.parseUnits("1000000000", 6); // 1,000,000,000 USDT (6 decimals)
    const mock = await MockUSDT.deploy(initialSupply);
    await mock.waitForDeployment();
    usdtAddress = await mock.getAddress();
    console.log("MockUSDT deployed:", usdtAddress);
  }

  const ICO = await ethers.getContractFactory("GameTokenICO");
  const gtkAddr = await gameToken.getAddress();
  const ico = await ICO.deploy(gtkAddr, usdtAddress);
  await ico.waitForDeployment();
  console.log("ICO deployed:", await ico.getAddress());

  const Tournament = await ethers.getContractFactory("TournamentManager");
  const tournament = await Tournament.deploy(gtkAddr);
  await tournament.waitForDeployment();
  console.log("Tournament deployed:", await tournament.getAddress());

  await (await gameToken.setBurnerAddress(await tournament.getAddress(), "tournament")).wait();

  const icoAllocation = ethers.parseUnits("840000000", 18);
  await (await gameToken.transfer(await ico.getAddress(), icoAllocation)).wait();

  console.log("Setup completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
