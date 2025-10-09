// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract GameTokenICO is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable gameToken; // GTK (18 decimals)
    IERC20 public immutable usdtToken; // USDT (6 decimals)

    enum SalePhase { PRIVATE, SEED, PRESALE, PUBLIC }
    SalePhase public currentPhase = SalePhase.PRIVATE;

    struct PhaseConfig {
        uint256 tokenPrice;   // Price per token in USDT (6 decimals). e.g. 40_000 = $0.04
        uint256 minPurchase;  // Min contribution in USDT (6 decimals)
        uint256 maxPurchase;  // Max contribution in USDT (6 decimals)
        uint256 bonusPercent; // Bonus percentage
        uint256 allocation;   // Tokens allocated for this phase (18 decimals)
        uint256 sold;         // Tokens sold in this phase (18 decimals)
        bool active;          // Whether phase is active
    }

    mapping(SalePhase => PhaseConfig) public phaseConfigs;
    mapping(address => uint256) public contributions; // USDT (6 decimals)
    mapping(address => uint256) public tokenBalance;  // GTK (18 decimals)

    uint256 public totalRaised;       // USDT (6 decimals)
    uint256 public totalTokensSold;   // GTK (18 decimals)

    event TokensPurchased(address indexed buyer, uint256 usdtAmount, uint256 tokenAmount, SalePhase phase);
    event PhaseChanged(SalePhase newPhase);

    constructor(address _gameToken, address _usdtToken) {
        require(_gameToken != address(0) && _usdtToken != address(0), "zero addr");
        gameToken = IERC20(_gameToken);
        usdtToken = IERC20(_usdtToken);

        phaseConfigs[SalePhase.PRIVATE] = PhaseConfig({
            tokenPrice: 40_000,               // $0.04
            minPurchase: 10_000_000_000,      // $10,000
            maxPurchase: 100_000_000_000,     // $100,000
            bonusPercent: 50,                 // 50%
            allocation: 210_000_000 * 1e18,   // 210M
            sold: 0,
            active: true
        });

        phaseConfigs[SalePhase.SEED] = PhaseConfig({
            tokenPrice: 60_000,               // $0.06
            minPurchase: 5_000_000_000,       // $5,000
            maxPurchase: 50_000_000_000,      // $50,000
            bonusPercent: 35,                 // 35%
            allocation: 210_000_000 * 1e18,
            sold: 0,
            active: false
        });

        phaseConfigs[SalePhase.PRESALE] = PhaseConfig({
            tokenPrice: 80_000,               // $0.08
            minPurchase: 1_000_000_000,       // $1,000
            maxPurchase: 10_000_000_000,      // $10,000
            bonusPercent: 25,                 // 25%
            allocation: 210_000_000 * 1e18,
            sold: 0,
            active: false
        });

        phaseConfigs[SalePhase.PUBLIC] = PhaseConfig({
            tokenPrice: 100_000,              // $0.10
            minPurchase: 100_000_000,         // $100
            maxPurchase: 5_000_000_000,       // $5,000
            bonusPercent: 15,                 // 15%
            allocation: 210_000_000 * 1e18,
            sold: 0,
            active: false
        });
    }

    function buyTokens(uint256 usdtAmount) external nonReentrant {
        PhaseConfig storage phase = phaseConfigs[currentPhase];
        require(phase.active, "phase inactive");
        require(usdtAmount >= phase.minPurchase, "below min");
        require(contributions[msg.sender] + usdtAmount <= phase.maxPurchase, "exceeds max");

        // tokens = usdtAmount(1e6) * 1e18 / tokenPrice(1e6)
        uint256 baseTokens = (usdtAmount * 1e18) / phase.tokenPrice;
        uint256 bonusTokens = (baseTokens * phase.bonusPercent) / 100;
        uint256 totalTokens = baseTokens + bonusTokens;

        require(phase.sold + totalTokens <= phase.allocation, "phase cap");

        usdtToken.safeTransferFrom(msg.sender, address(this), usdtAmount);

        contributions[msg.sender] += usdtAmount;
        tokenBalance[msg.sender] += totalTokens;
        phase.sold += totalTokens;
        totalRaised += usdtAmount;
        totalTokensSold += totalTokens;

        emit TokensPurchased(msg.sender, usdtAmount, totalTokens, currentPhase);
    }

    function claimTokens() external nonReentrant {
        uint256 amount = tokenBalance[msg.sender];
        require(amount > 0, "nothing to claim");
        tokenBalance[msg.sender] = 0;
        gameToken.safeTransfer(msg.sender, amount);
    }

    function setPhase(SalePhase phase) external onlyOwner {
        phaseConfigs[currentPhase].active = false;
        currentPhase = phase;
        phaseConfigs[phase].active = true;
        emit PhaseChanged(phase);
    }

    function withdrawFunds(address to) external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        usdtToken.safeTransfer(to, balance);
    }

    function emergencyWithdrawTokens(address to) external onlyOwner {
        uint256 balance = gameToken.balanceOf(address(this));
        gameToken.safeTransfer(to, balance);
    }
}

