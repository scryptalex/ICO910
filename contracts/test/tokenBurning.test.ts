import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Token Burning", function () {
  it("burns 50% of tournament revenue", async function () {
    const [owner, player, winner] = await ethers.getSigners();

    const GameToken = await ethers.getContractFactory("GameToken");
    const gtk = await upgrades.deployProxy(GameToken, [], { initializer: "initialize" });
    await gtk.waitForDeployment();

    const Tournament = await ethers.getContractFactory("TournamentManager");
    const gtkAddress = await gtk.getAddress();
    const tmt = await Tournament.deploy(gtkAddress);
    await tmt.waitForDeployment();

    await gtk.setBurnerAddress(await tmt.getAddress(), "tournament");

    // Fund player with some GTK
    await gtk.transfer(player.address, ethers.parseUnits("1000", 18));

    // Create tournament
    const now = (await ethers.provider.getBlock("latest"))!.timestamp;
    await tmt.connect(owner).createTournament("Test", ethers.parseUnits("100", 18), 10, now + 3600, now + 7200);

    // Player approves and joins
    await gtk.connect(player).approve(await tmt.getAddress(), ethers.parseUnits("100", 18));
    await tmt.connect(player).joinTournament(1);

    // Fast forward to end
    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 8000]);
    await ethers.provider.send("evm_mine", []);

    // Complete tournament: payout 50, burn 50
    await tmt.completeTournament(1, [winner.address], [ethers.parseUnits("50", 18)]);

    // The tournament contract burned 50 GTK
    // No direct totalBurned hook except via GameToken getters
    const burnedFn = await gtk.getTotalBurned();
    expect(burnedFn).to.equal(ethers.parseUnits("50", 18));
  });
});
