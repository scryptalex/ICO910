import { ethers, upgrades } from "hardhat";

async function main() {
  const USDT_ADDRESS = process.env.USDT_ADDRESS || "0x0000000000000000000000000000000000000000";

  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await upgrades.deployProxy(GameToken, [], { initializer: "initialize" });
  await gameToken.waitForDeployment();
  console.log("GameToken deployed:", await gameToken.getAddress());

  const ICO = await ethers.getContractFactory("GameTokenICO");
  const gtkAddr = await gameToken.getAddress();
  const ico = await ICO.deploy(gtkAddr, USDT_ADDRESS);
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
