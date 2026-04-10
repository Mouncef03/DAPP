// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HorseMarketplace {

    // ─── Structs ──────────────────────────────────────────────
    struct Horse {
        uint256 id;
        string name;
        string breed;
        uint256 age;
        uint256 price;
        string ipfsHash;      // IPFS hash of horse metadata
        address payable owner;
        bool isForSale;
    }

    // ─── State Variables ──────────────────────────────────────
    uint256 private _horseCounter;
    uint256 public platformFee = 25; // 2.5% fee (25/1000)

    address public contractOwner;

    // ─── Mappings ─────────────────────────────────────────────
    mapping(uint256 => Horse) public horses;
    mapping(address => uint256[]) public ownerHorses;

    // ─── Events ───────────────────────────────────────────────
    event HorseListed(
        uint256 indexed id,
        string name,
        address indexed owner,
        uint256 price
    );

    event HorseSold(
        uint256 indexed id,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 price
    );

    event HorsePriceUpdated(
        uint256 indexed id,
        uint256 oldPrice,
        uint256 newPrice
    );

    event HorseRemovedFromSale(
        uint256 indexed id,
        address indexed owner
    );

    // ─── Modifiers ────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Not contract owner");
        _;
    }

    modifier onlyHorseOwner(uint256 _id) {
        require(horses[_id].owner == msg.sender, "Not the horse owner");
        _;
    }

    modifier horseExists(uint256 _id) {
        require(_id > 0 && _id <= _horseCounter, "Horse does not exist");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────
    constructor() {
        contractOwner = msg.sender;
    }

    // ─── Functions ────────────────────────────────────────────

    // List a new horse for sale
    function listHorse(
        string memory _name,
        string memory _breed,
        uint256 _age,
        uint256 _price,
        string memory _ipfsHash
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        _horseCounter++;
        uint256 newHorseId = _horseCounter;

        horses[newHorseId] = Horse({
            id: newHorseId,
            name: _name,
            breed: _breed,
            age: _age,
            price: _price,
            ipfsHash: _ipfsHash,
            owner: payable(msg.sender),
            isForSale: true
        });

        ownerHorses[msg.sender].push(newHorseId);

        emit HorseListed(newHorseId, _name, msg.sender, _price);

        return newHorseId;
    }

    // Buy a horse
    function buyHorse(uint256 _id)
        public
        payable
        horseExists(_id)
    {
        Horse storage horse = horses[_id];

        require(horse.isForSale, "Horse is not for sale");
        require(msg.sender != horse.owner, "You already own this horse");
        require(msg.value >= horse.price, "Insufficient payment");

        address payable previousOwner = horse.owner;
        uint256 salePrice = horse.price;

        // Calculate platform fee
        uint256 fee = (salePrice * platformFee) / 1000;
        uint256 sellerAmount = salePrice - fee;

        // Update horse ownership
        horse.owner = payable(msg.sender);
        horse.isForSale = false;

        // Add to new owner's list
        ownerHorses[msg.sender].push(_id);

        // Transfer payment to seller
        previousOwner.transfer(sellerAmount);

        // Transfer fee to contract owner
        payable(contractOwner).transfer(fee);

        // Refund excess payment
        if (msg.value > salePrice) {
            payable(msg.sender).transfer(msg.value - salePrice);
        }

        emit HorseSold(_id, previousOwner, msg.sender, salePrice);
    }

    // Update horse price
    function updatePrice(uint256 _id, uint256 _newPrice)
        public
        horseExists(_id)
        onlyHorseOwner(_id)
    {
        require(_newPrice > 0, "Price must be greater than 0");
        uint256 oldPrice = horses[_id].price;
        horses[_id].price = _newPrice;
        emit HorsePriceUpdated(_id, oldPrice, _newPrice);
    }

    // Toggle horse sale status
    function toggleSaleStatus(uint256 _id)
        public
        horseExists(_id)
        onlyHorseOwner(_id)
    {
        horses[_id].isForSale = !horses[_id].isForSale;
        if (!horses[_id].isForSale) {
            emit HorseRemovedFromSale(_id, msg.sender);
        }
    }

    // ─── View Functions ───────────────────────────────────────

    // Get all horses for sale
    function getHorsesForSale() public view returns (Horse[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _horseCounter; i++) {
            if (horses[i].isForSale) count++;
        }

        Horse[] memory forSale = new Horse[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _horseCounter; i++) {
            if (horses[i].isForSale) {
                forSale[index] = horses[i];
                index++;
            }
        }
        return forSale;
    }

    // Get horses by owner
    function getHorsesByOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        return ownerHorses[_owner];
    }

    // Get total number of horses
    function getTotalHorses() public view returns (uint256) {
        return _horseCounter;
    }

    // Get contract balance
    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}