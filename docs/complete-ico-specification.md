# Complete ICO Development Specification for Codex Agent

## Project Overview
Develop a comprehensive crypto gaming platform ICO with multi-chain deployment, focusing on Polygon (MATIC) as the primary network. The platform will host skill-based games with crypto betting, tournaments, and an integrated token economy.

## Token Specifications

### Primary Token (GTK - GameToken)
- **Name**: GameToken
- **Symbol**: GTK  
- **Total Supply**: 2,100,000,000 GTK (2.1 billion tokens)
- **Decimals**: 18
- **Primary Network**: Polygon (MATIC)
- **Token Standard**: ERC-20 compatible
- **Contract Type**: Upgradeable proxy pattern for future enhancements

### Token Distribution (2.1 billion total)
```
ICO Sale: 40% (840,000,000 GTK)
Team & Advisors: 15% (315,000,000 GTK) - 24 month vesting
Marketing & Partnerships: 10% (210,000,000 GTK)
Development & Operations: 15% (315,000,000 GTK)
Game Rewards Pool: 15% (315,000,000 GTK)
Reserve Fund: 5% (105,000,000 GTK)
```

### Advanced Token Burning Mechanism

#### Tournament Revenue Burning (50% Auto-Burn)
```solidity
// Automatic burning of 50% tournament revenue
contract TournamentBurning {
    event TournamentRevenueBurn(uint256 amount, uint256 tournamentId);
    
    function processTournamentRevenue(uint256 revenue, uint256 tournamentId) external {
        uint256 burnAmount = revenue * 50 / 100; // 50% burn
        uint256 treasuryAmount = revenue - burnAmount;
        
        // Burn tokens equivalent to 50% of revenue
        _burn(address(this), burnAmount);
        
        // Transfer remaining to treasury
        _transfer(address(this), treasury, treasuryAmount);
        
        emit TournamentRevenueBurn(burnAmount, tournamentId);
    }
}
```

#### Multi-Source Burning Mechanisms
1. **Tournament Revenue Burns**: 50% of all tournament entry fees automatically burned
2. **Platform Fee Burns**: 25% of platform transaction fees burned quarterly
3. **NFT Minting Burns**: 1,000 GTK burned per rare NFT minted
4. **Upgrade Burns**: Token burning for game asset upgrades
5. **Governance Burns**: Proposal submission requires 10,000 GTK burn

#### Deflationary Schedule
```
Year 1: Target 200M tokens burned (9.5% supply reduction)
Year 2: Target 180M tokens burned (additional 8.6%)
Year 3: Target 150M tokens burned (additional 7.1%)
Year 4: Target 120M tokens burned (additional 5.7%)
Year 5: Target 100M tokens burned (additional 4.8%)

Total 5-year burn target: 750M tokens (35.7% of initial supply)
Final circulating supply target: ~1.35B tokens
```

## Smart Contract Architecture

### 1. Main GTK Token Contract (Polygon)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract GameToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, PausableUpgradeable {
    
    uint256 public constant MAX_SUPPLY = 2100000000 * 10**18; // 2.1B tokens
    uint256 public totalBurned;
    
    // Burning mechanism addresses
    address public tournamentBurner;
    address public platformBurner;
    address public governanceBurner;
    
    // Events
    event TokensBurned(address indexed burner, uint256 amount, string reason);
    event BurnerAddressUpdated(address indexed newBurner, string burnerType);
    
    function initialize() public initializer {
        __ERC20_init("GameToken", "GTK");
        __Ownable_init();
        __Pausable_init();
        
        // Mint initial supply to deployer
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    // Tournament revenue burning (50% automatic)
    function burnFromTournament(uint256 amount) external {
        require(msg.sender == tournamentBurner, "Only tournament burner");
        _burn(address(this), amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount, "Tournament Revenue");
    }
    
    // Platform fee burning (quarterly)
    function burnFromPlatform(uint256 amount) external {
        require(msg.sender == platformBurner, "Only platform burner");
        _burn(address(this), amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount, "Platform Fees");
    }
    
    // Manual governance burns
    function burnFromGovernance(uint256 amount) external {
        require(msg.sender == governanceBurner, "Only governance burner");
        _burn(msg.sender, amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount, "Governance Action");
    }
    
    // Set burner addresses (only owner)
    function setBurnerAddress(address _burner, string memory _type) external onlyOwner {
        if (keccak256(bytes(_type)) == keccak256("tournament")) {
            tournamentBurner = _burner;
        } else if (keccak256(bytes(_type)) == keccak256("platform")) {
            platformBurner = _burner;
        } else if (keccak256(bytes(_type)) == keccak256("governance")) {
            governanceBurner = _burner;
        }
        emit BurnerAddressUpdated(_burner, _type);
    }
    
    // Emergency pause
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Get current circulating supply
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    // Get total burned amount
    function getTotalBurned() external view returns (uint256) {
        return totalBurned;
    }
}
```

### 2. ICO Presale Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GameTokenICO is ReentrancyGuard, Ownable {
    
    IERC20 public gameToken;
    IERC20 public usdtToken; // USDT on Polygon
    
    // Sale phases
    enum SalePhase { PRIVATE, SEED, PRESALE, PUBLIC }
    SalePhase public currentPhase = SalePhase.PRIVATE;
    
    // Phase configurations
    struct PhaseConfig {
        uint256 tokenPrice;      // Price in USDT (6 decimals)
        uint256 minPurchase;     // Minimum purchase in USDT
        uint256 maxPurchase;     // Maximum purchase in USDT
        uint256 bonusPercent;    // Bonus percentage (e.g., 50 = 50%)
        uint256 allocation;      // Total tokens allocated for this phase
        uint256 sold;           // Tokens sold in this phase
        bool active;            // Phase active status
    }
    
    mapping(SalePhase => PhaseConfig) public phaseConfigs;
    mapping(address => uint256) public contributions; // User contributions in USDT
    mapping(address => uint256) public tokenBalance;  // User token balance
    
    uint256 public totalRaised; // Total USDT raised
    uint256 public totalTokensSold;
    
    event TokensPurchased(address indexed buyer, uint256 usdtAmount, uint256 tokenAmount, SalePhase phase);
    event PhaseChanged(SalePhase newPhase);
    
    constructor(address _gameToken, address _usdtToken) {
        gameToken = IERC20(_gameToken);
        usdtToken = IERC20(_usdtToken);
        
        // Initialize phases
        phaseConfigs[SalePhase.PRIVATE] = PhaseConfig({
            tokenPrice: 40000,        // $0.04 (4 cents)
            minPurchase: 10000000000, // $10,000 USDT
            maxPurchase: 100000000000, // $100,000 USDT
            bonusPercent: 50,         // 50% bonus
            allocation: 210000000 * 10**18, // 210M tokens
            sold: 0,
            active: true
        });
        
        phaseConfigs[SalePhase.SEED] = PhaseConfig({
            tokenPrice: 60000,        // $0.06 (6 cents)
            minPurchase: 5000000000,  // $5,000 USDT
            maxPurchase: 50000000000, // $50,000 USDT
            bonusPercent: 35,         // 35% bonus
            allocation: 210000000 * 10**18, // 210M tokens
            sold: 0,
            active: false
        });
        
        phaseConfigs[SalePhase.PRESALE] = PhaseConfig({
            tokenPrice: 80000,        // $0.08 (8 cents)
            minPurchase: 1000000000,  // $1,000 USDT
            maxPurchase: 10000000000, // $10,000 USDT
            bonusPercent: 25,         // 25% bonus
            allocation: 210000000 * 10**18, // 210M tokens
            sold: 0,
            active: false
        });
        
        phaseConfigs[SalePhase.PUBLIC] = PhaseConfig({
            tokenPrice: 100000,       // $0.10 (10 cents)
            minPurchase: 100000000,   // $100 USDT
            maxPurchase: 5000000000,  // $5,000 USDT
            bonusPercent: 15,         // 15% bonus
            allocation: 210000000 * 10**18, // 210M tokens
            sold: 0,
            active: false
        });
    }
    
    function buyTokens(uint256 usdtAmount) external nonReentrant {
        PhaseConfig storage phase = phaseConfigs[currentPhase];
        require(phase.active, "Current phase is not active");
        require(usdtAmount >= phase.minPurchase, "Below minimum purchase");
        require(contributions[msg.sender] + usdtAmount <= phase.maxPurchase, "Exceeds maximum purchase");
        
        // Calculate tokens (accounting for USDT 6 decimals and token 18 decimals)
        uint256 baseTokens = (usdtAmount * 10**18) / (phase.tokenPrice * 10**6 / 10**6);
        uint256 bonusTokens = (baseTokens * phase.bonusPercent) / 100;
        uint256 totalTokens = baseTokens + bonusTokens;
        
        require(phase.sold + totalTokens <= phase.allocation, "Exceeds phase allocation");
        
        // Transfer USDT from buyer
        require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        
        // Update tracking
        contributions[msg.sender] += usdtAmount;
        tokenBalance[msg.sender] += totalTokens;
        phase.sold += totalTokens;
        totalRaised += usdtAmount;
        totalTokensSold += totalTokens;
        
        emit TokensPurchased(msg.sender, usdtAmount, totalTokens, currentPhase);
    }
    
    function claimTokens() external nonReentrant {
        uint256 amount = tokenBalance[msg.sender];
        require(amount > 0, "No tokens to claim");
        
        tokenBalance[msg.sender] = 0;
        require(gameToken.transfer(msg.sender, amount), "Token transfer failed");
    }
    
    function setPhase(SalePhase _phase) external onlyOwner {
        // Deactivate current phase
        phaseConfigs[currentPhase].active = false;
        
        // Activate new phase
        currentPhase = _phase;
        phaseConfigs[_phase].active = true;
        
        emit PhaseChanged(_phase);
    }
    
    function withdrawFunds() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(owner(), balance), "Withdrawal failed");
    }
    
    function emergencyWithdrawTokens() external onlyOwner {
        uint256 balance = gameToken.balanceOf(address(this));
        require(gameToken.transfer(owner(), balance), "Emergency withdrawal failed");
    }
}
```

### 3. Tournament Management Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TournamentManager {
    IERC20 public gameToken;
    address public tokenBurner; // Address authorized to burn tokens
    
    struct Tournament {
        uint256 id;
        string name;
        uint256 entryFee;        // Entry fee in GTK tokens
        uint256 prizePool;       // Total prize pool
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isCompleted;
        address[] participants;
        mapping(address => bool) hasJoined;
    }
    
    mapping(uint256 => Tournament) public tournaments;
    uint256 public tournamentCounter;
    
    // 50% of tournament revenue gets burned
    uint256 public constant BURN_PERCENTAGE = 50;
    
    event TournamentCreated(uint256 indexed tournamentId, string name, uint256 entryFee);
    event PlayerJoined(uint256 indexed tournamentId, address indexed player);
    event TournamentCompleted(uint256 indexed tournamentId, address[] winners);
    event RevenueBurned(uint256 indexed tournamentId, uint256 amount);
    
    function createTournament(
        string memory _name,
        uint256 _entryFee,
        uint256 _maxParticipants,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        tournamentCounter++;
        
        Tournament storage newTournament = tournaments[tournamentCounter];
        newTournament.id = tournamentCounter;
        newTournament.name = _name;
        newTournament.entryFee = _entryFee;
        newTournament.maxParticipants = _maxParticipants;
        newTournament.startTime = _startTime;
        newTournament.endTime = _endTime;
        newTournament.isActive = true;
        
        emit TournamentCreated(tournamentCounter, _name, _entryFee);
    }
    
    function joinTournament(uint256 _tournamentId) external {
        Tournament storage tournament = tournaments[_tournamentId];
        
        require(tournament.isActive, "Tournament not active");
        require(!tournament.hasJoined[msg.sender], "Already joined");
        require(tournament.currentParticipants < tournament.maxParticipants, "Tournament full");
        require(block.timestamp < tournament.startTime, "Registration closed");
        
        // Transfer entry fee from player
        require(gameToken.transferFrom(msg.sender, address(this), tournament.entryFee), "Fee transfer failed");
        
        // Add to tournament
        tournament.participants.push(msg.sender);
        tournament.hasJoined[msg.sender] = true;
        tournament.currentParticipants++;
        tournament.prizePool += tournament.entryFee;
        
        emit PlayerJoined(_tournamentId, msg.sender);
    }
    
    function completeTournament(uint256 _tournamentId, address[] memory _winners, uint256[] memory _payouts) external onlyOwner {
        Tournament storage tournament = tournaments[_tournamentId];
        
        require(tournament.isActive, "Tournament not active");
        require(block.timestamp >= tournament.endTime, "Tournament not ended");
        require(_winners.length == _payouts.length, "Winners and payouts mismatch");
        
        uint256 totalPayout = 0;
        for (uint256 i = 0; i < _payouts.length; i++) {
            totalPayout += _payouts[i];
        }
        
        // Calculate burn amount (50% of total revenue)
        uint256 burnAmount = (tournament.prizePool * BURN_PERCENTAGE) / 100;
        uint256 availableForPrizes = tournament.prizePool - burnAmount;
        
        require(totalPayout <= availableForPrizes, "Payout exceeds available funds");
        
        // Distribute prizes
        for (uint256 i = 0; i < _winners.length; i++) {
            require(gameToken.transfer(_winners[i], _payouts[i]), "Prize transfer failed");
        }
        
        // Burn 50% of tournament revenue
        require(gameToken.transfer(tokenBurner, burnAmount), "Burn transfer failed");
        
        tournament.isActive = false;
        tournament.isCompleted = true;
        
        emit TournamentCompleted(_tournamentId, _winners);
        emit RevenueBurned(_tournamentId, burnAmount);
    }
}
```

## Website Development Specifications

### Frontend Architecture
```
Technology Stack:
- Framework: Next.js 14 with TypeScript
- Styling: Tailwind CSS + Custom Gaming Theme
- Web3: ethers.js v6 + wagmi hooks
- State Management: Zustand
- Animations: Framer Motion
- Charts: Recharts for tokenomics
- Icons: Heroicons + Custom gaming icons
```

### Required Pages & Components

#### 1. Landing Page (/)
```typescript
// Core sections to implement
const LandingPageSections = {
  Header: {
    logo: "Gaming Platform Logo",
    navigation: ["Games", "Tokenomics", "Roadmap", "Whitepaper", "Community"],
    ctaButton: "Join Presale"
  },
  
  Hero: {
    headline: "Crypto Gaming Revolution",
    subline: "Skill-based gaming with crypto rewards",
    fundingProgress: {
      raised: "realtime from contract",
      target: "$15,000,000",
      percentage: "calculated",
      nextPriceIn: "countdown timer"
    },
    tokenPurchaseWidget: {
      amountInput: "USDT amount",
      tokenOutput: "GTK received",
      connectWallet: "MetaMask/WalletConnect",
      buyButton: "Purchase Tokens"
    }
  },
  
  Games: {
    gameList: ["Backgammon", "Tic-Tac-Toe", "Sea Battle", "Chess", "Poker"],
    liveStats: {
      activePlayers: "from API",
      gamesPlayed: "daily count",
      totalWinnings: "cumulative"
    }
  },
  
  Tokenomics: {
    supplyChart: "2.1B total supply visualization",
    distributionPie: "ICO, team, rewards breakdown",
    burnMechanism: "50% tournament revenue burn explanation",
    burnSchedule: "5-year deflationary timeline"
  },
  
  Roadmap: {
    phases: [
      "Q4 2024: Foundation & Smart Contracts",
      "Q1 2025: ICO & Community Building", 
      "Q2 2025: Platform Launch & Games",
      "Q3 2025: Mobile App & Tournaments",
      "Q4 2025: Advanced Features & Scaling"
    ]
  }
}
```

#### 2. Token Purchase Page (/buy)
```typescript
const TokenPurchasePage = {
  walletConnection: {
    supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
    networkCheck: "Ensure Polygon network",
    balanceDisplay: "USDT/MATIC balance"
  },
  
  purchaseWidget: {
    phaseSelector: "Current phase display",
    amountInput: "USDT amount with validation",
    tokenCalculation: "Real-time GTK calculation with bonus",
    gasFeeEstimate: "Polygon gas estimation",
    transactionButton: "Execute purchase",
    transactionStatus: "Pending/Success/Failed states"
  },
  
  phaseInformation: {
    currentPhase: "Private/Seed/Presale/Public",
    pricePerToken: "$0.04 - $0.10 based on phase",
    bonusPercentage: "50% - 15% based on phase",
    remainingTokens: "Phase allocation remaining",
    nextPhaseCountdown: "Time until next phase"
  }
}
```

#### 3. Dashboard Page (/dashboard)
```typescript
const UserDashboard = {
  portfolio: {
    gtkBalance: "User GTK token balance",
    usdValue: "Current USD value",
    purchaseHistory: "All ICO purchases",
    vestingSchedule: "If applicable for team/advisors"
  },
  
  gaming: {
    tournamentHistory: "Past tournament participation",
    winnings: "Total winnings accumulated", 
    ranking: "Platform ranking/level",
    achievements: "Gaming achievements earned"
  },
  
  staking: {
    stakedAmount: "GTK tokens staked",
    rewards: "Staking rewards earned",
    stakingOptions: "Different staking pools"
  }
}
```

### Smart Contract Integration

#### Web3 Connection Setup
```typescript
// wagmi configuration
import { configureChains, createConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const { chains, publicClient } = configureChains(
  [polygon],
  [/* RPC providers */]
)

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'your-project-id'
      }
    })
  ],
  publicClient
})
```

#### Contract Interaction Hooks
```typescript
// Custom hooks for contract interactions
export const useTokenPurchase = () => {
  const { writeAsync: purchaseTokens } = useContractWrite({
    address: ICO_CONTRACT_ADDRESS,
    abi: IcoABI,
    functionName: 'buyTokens'
  })

  const buyTokens = async (usdtAmount: string) => {
    try {
      const tx = await purchaseTokens({
        args: [parseUnits(usdtAmount, 6)] // USDT has 6 decimals
      })
      return tx
    } catch (error) {
      console.error('Purchase failed:', error)
      throw error
    }
  }

  return { buyTokens }
}

export const useTokenBalance = (address: string) => {
  const { data: balance } = useContractRead({
    address: GTK_TOKEN_ADDRESS,
    abi: TokenABI,
    functionName: 'balanceOf',
    args: [address],
    watch: true
  })

  return { 
    balance: balance ? formatUnits(balance, 18) : '0',
    rawBalance: balance
  }
}

export const useBurnStats = () => {
  const { data: totalBurned } = useContractRead({
    address: GTK_TOKEN_ADDRESS,
    abi: TokenABI,
    functionName: 'getTotalBurned',
    watch: true
  })

  const { data: circulatingSupply } = useContractRead({
    address: GTK_TOKEN_ADDRESS,
    abi: TokenABI,
    functionName: 'circulatingSupply',
    watch: true
  })

  return {
    totalBurned: totalBurned ? formatUnits(totalBurned, 18) : '0',
    circulatingSupply: circulatingSupply ? formatUnits(circulatingSupply, 18) : '0',
    burnPercentage: totalBurned && circulatingSupply 
      ? ((Number(formatUnits(totalBurned, 18)) / 2100000000) * 100).toFixed(2)
      : '0'
  }
}
```

### Gaming Platform Integration

#### Tournament System
```typescript
interface Tournament {
  id: number
  name: string
  game: 'backgammon' | 'tic-tac-toe' | 'sea-battle' | 'chess' | 'poker'
  entryFee: string // GTK amount
  prizePool: string // GTK amount  
  maxParticipants: number
  currentParticipants: number
  startTime: Date
  endTime: Date
  status: 'upcoming' | 'active' | 'completed'
}

const TournamentList: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  
  // Fetch tournaments from contract
  useEffect(() => {
    fetchTournaments()
  }, [])
  
  const joinTournament = async (tournamentId: number, entryFee: string) => {
    try {
      // First approve GTK spending
      const approveTx = await approve({
        args: [TOURNAMENT_CONTRACT_ADDRESS, parseUnits(entryFee, 18)]
      })
      await approveTx.wait()
      
      // Then join tournament
      const joinTx = await joinTournament({
        args: [tournamentId]
      })
      await joinTx.wait()
      
      toast.success('Successfully joined tournament!')
    } catch (error) {
      toast.error('Failed to join tournament')
    }
  }
  
  return (
    <div className="tournament-grid">
      {tournaments.map(tournament => (
        <TournamentCard 
          key={tournament.id} 
          tournament={tournament}
          onJoin={joinTournament}
        />
      ))}
    </div>
  )
}
```

## Deployment & Infrastructure

### Smart Contract Deployment Script
```javascript
// Hardhat deployment script
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Deploy GTK Token
  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await upgrades.deployProxy(GameToken, [], {
    initializer: 'initialize'
  });
  await gameToken.deployed();
  console.log("GameToken deployed to:", gameToken.address);
  
  // Deploy ICO Contract
  const ICO = await ethers.getContractFactory("GameTokenICO");
  const ico = await ICO.deploy(gameToken.address, USDT_ADDRESS);
  await ico.deployed();
  console.log("ICO deployed to:", ico.address);
  
  // Deploy Tournament Manager
  const Tournament = await ethers.getContractFactory("TournamentManager");
  const tournament = await Tournament.deploy(gameToken.address);
  await tournament.deployed();
  console.log("Tournament deployed to:", tournament.address);
  
  // Setup permissions
  await gameToken.setBurnerAddress(tournament.address, "tournament");
  
  // Transfer ICO tokens
  const icoAllocation = ethers.utils.parseUnits("840000000", 18); // 840M tokens
  await gameToken.transfer(ico.address, icoAllocation);
  
  console.log("Deployment completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_GTK_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_ICO_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Testing Requirements

### Smart Contract Tests
```javascript
// Test suite for token burning mechanism
describe("Token Burning", function () {
  it("Should burn 50% of tournament revenue", async function () {
    const entryFee = ethers.utils.parseUnits("100", 18);
    const expectedBurn = entryFee.div(2);
    
    // Join tournament
    await tournament.joinTournament(1);
    
    // Complete tournament
    await tournament.completeTournament(1, [winner], [prize]);
    
    const burnedAmount = await gameToken.getTotalBurned();
    expect(burnedAmount).to.equal(expectedBurn);
  });
  
  it("Should reduce circulating supply after burns", async function () {
    const initialSupply = await gameToken.totalSupply();
    
    // Perform burn operation
    await gameToken.burnFromGovernance(ethers.utils.parseUnits("1000000", 18));
    
    const newSupply = await gameToken.totalSupply();
    expect(newSupply).to.be.lt(initialSupply);
  });
});
```

### Frontend Tests
```typescript
// Component tests for token purchase
describe('TokenPurchase', () => {
  test('calculates correct token amount with bonus', () => {
    const usdtAmount = '1000'
    const phase = 'PRIVATE' // 50% bonus
    const expectedTokens = calculateTokensWithBonus(usdtAmount, phase)
    
    render(<TokenPurchaseWidget />)
    
    fireEvent.change(screen.getByLabelText('USDT Amount'), {
      target: { value: usdtAmount }
    })
    
    expect(screen.getByText(expectedTokens)).toBeInTheDocument()
  })
})
```

## Security & Audit Checklist

### Smart Contract Security
- [ ] Reentrancy protection on all payable functions
- [ ] Integer overflow protection (Solidity 0.8+)
- [ ] Access control on administrative functions
- [ ] Emergency pause mechanism
- [ ] Multi-signature wallet for critical operations
- [ ] Timelock for contract upgrades

### Frontend Security  
- [ ] Input validation on all user inputs
- [ ] XSS protection through proper sanitization
- [ ] CSRF protection on state-changing operations
- [ ] Secure Web3 connection handling
- [ ] Private key never stored or transmitted

### Audit Requirements
1. **Pre-deployment audit** by CertiK or ConsenSys Diligence
2. **Bug bounty program** with $50,000 reward pool
3. **Testnet deployment** for community testing
4. **Code review** by independent security experts

## Go-Live Checklist

### Pre-Launch (T-30 days)
- [ ] All smart contracts deployed and verified
- [ ] Frontend website deployed on production
- [ ] SSL certificates and security headers configured
- [ ] Analytics and monitoring systems active
- [ ] Customer support systems ready

### Launch Day (T-0)
- [ ] Final security check completed
- [ ] Smart contracts transferred to multi-sig wallet
- [ ] Press release distributed
- [ ] Social media campaigns activated
- [ ] Community moderators briefed

### Post-Launch (T+7 days)
- [ ] Daily transaction monitoring
- [ ] User feedback collection and analysis
- [ ] Bug reports triage and resolution
- [ ] Marketing performance review
- [ ] Security monitoring and incident response

This comprehensive specification provides everything needed for a Codex agent to build a complete ICO platform with advanced tokenomics, including the 50% tournament revenue burning mechanism and multi-chain deployment capabilities.