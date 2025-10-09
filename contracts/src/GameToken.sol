// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract GameToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    uint256 public constant MAX_SUPPLY = 2100000000 * 10**18; // 2.1B tokens
    uint256 public totalBurned;

    address public tournamentBurner;
    address public platformBurner;
    address public governanceBurner;

    event TokensBurned(address indexed burner, uint256 amount, string reason);
    event BurnerAddressUpdated(address indexed newBurner, string burnerType);

    function initialize() public initializer {
        __ERC20_init("GameToken", "GTK");
        __ERC20Burnable_init();
        __Ownable_init();
        __Pausable_init();
        _mint(_msgSender(), MAX_SUPPLY);
    }

    function burnFromTournament(uint256 amount) external whenNotPaused {
        require(_msgSender() == tournamentBurner, "Only tournament burner");
        _burn(_msgSender(), amount);
        totalBurned += amount;
        emit TokensBurned(_msgSender(), amount, "Tournament Revenue");
    }

    function burnFromPlatform(uint256 amount) external whenNotPaused {
        require(_msgSender() == platformBurner, "Only platform burner");
        _burn(_msgSender(), amount);
        totalBurned += amount;
        emit TokensBurned(_msgSender(), amount, "Platform Fees");
    }

    function burnFromGovernance(uint256 amount) external whenNotPaused {
        require(_msgSender() == governanceBurner, "Only governance burner");
        _burn(_msgSender(), amount);
        totalBurned += amount;
        emit TokensBurned(_msgSender(), amount, "Governance Action");
    }

    function setBurnerAddress(address burner, string memory burnerType) external onlyOwner {
        bytes32 t = keccak256(bytes(burnerType));
        if (t == keccak256("tournament")) {
            tournamentBurner = burner;
        } else if (t == keccak256("platform")) {
            platformBurner = burner;
        } else if (t == keccak256("governance")) {
            governanceBurner = burner;
        } else {
            revert("Unknown burner type");
        }
        emit BurnerAddressUpdated(burner, burnerType);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    function getTotalBurned() external view returns (uint256) {
        return totalBurned;
    }
}

