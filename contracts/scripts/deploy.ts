import { ethers, upgrades } from "hardhat";

async function main() {
  const USDT_ADDRESS = process.env.USDT_ADDRESS || "0x0000000000000000000000000000000000000000";

  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await upgrades.deployProxy(GameToken, [], { initializer: "initialize" });
  await gameToken.deployed();
  console.log("GameToken deployed:", gameToken.address);

  const ICO = await ethers.getContractFactory("GameTokenICO");
  const ico = await ICO.deploy(gameToken.address, USDT_ADDRESS);
  await ico.deployed();
  console.log("ICO deployed:", ico.address);

  const Tournament = await ethers.getContractFactory("TournamentManager");
  const tournament = await Tournament.deploy(gameToken.address);
  await tournament.deployed();
  console.log("Tournament deployed:", tournament.address);

  await (await gameToken.setBurnerAddress(tournament.address, "tournament")).wait();

  const icoAllocation = ethers.utils.parseUnits("840000000", 18);
  await (await gameToken.transfer(ico.address, icoAllocation)).wait();

  console.log("Setup completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

