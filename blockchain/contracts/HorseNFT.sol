// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HorseNFT is ERC721URIStorage, Ownable {

    uint256 private _tokenIdCounter;
    uint256 public platformFee = 25;
    address public platformOwner;

    struct Horse {
        uint256 tokenId;
        string name;
        string breed;
        uint256 age;
        uint256 price;
        string ipfsHash;
        address payable owner;
        bool isForSale;
    }

    struct Auction {
    uint256 tokenId;
    address payable seller;
    uint256 startingPrice;
    uint256 highestBid;
    address payable highestBidder;
    uint256 endTime;
    bool isActive;
    bool isEnded;
}

    mapping(uint256 => Horse) public horses;
    mapping(uint256 => bool) public tokenExists;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;

    event HorseMinted(uint256 indexed tokenId, string name, address indexed owner, string tokenURI);
    event HorseListed(uint256 indexed tokenId, address indexed owner, uint256 price);
    event HorseSold(uint256 indexed tokenId, address indexed previousOwner, address indexed newOwner, uint256 price);
    event HorsePriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);

    event AuctionStarted(
    uint256 indexed tokenId,
    address indexed seller,
    uint256 startingPrice,
    uint256 endTime
);

event BidPlaced(
    uint256 indexed tokenId,
    address indexed bidder,
    uint256 amount
);

event AuctionEnded(
    uint256 indexed tokenId,
    address indexed winner,
    uint256 amount
);

event AuctionCancelled(
    uint256 indexed tokenId,
    address indexed seller
);

    modifier onlyHorseOwner(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender, "Not the horse owner");
        _;
    }

    modifier horseExists(uint256 _tokenId) {
        require(tokenExists[_tokenId], "Horse does not exist");
        _;
    }

    constructor() ERC721("HorseChain", "HORSE") Ownable(msg.sender) {
        platformOwner = msg.sender;
        _tokenIdCounter = 0;
    }

    function mintHorse(
        string memory _name,
        string memory _breed,
        uint256 _age,
        uint256 _price,
        string memory _ipfsHash,
        string memory _tokenURI
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        horses[newTokenId] = Horse({
            tokenId: newTokenId,
            name: _name,
            breed: _breed,
            age: _age,
            price: _price,
            ipfsHash: _ipfsHash,
            owner: payable(msg.sender),
            isForSale: true
        });

        tokenExists[newTokenId] = true;

        emit HorseMinted(newTokenId, _name, msg.sender, _tokenURI);
        emit HorseListed(newTokenId, msg.sender, _price);

        return newTokenId;
    }

    function buyHorse(uint256 _tokenId)
        public
        payable
        horseExists(_tokenId)
    {
        Horse storage horse = horses[_tokenId];

        require(horse.isForSale, "Horse is not for sale");
        require(msg.sender != horse.owner, "You already own this horse");
        require(msg.value >= horse.price, "Insufficient payment");

        address payable previousOwner = horse.owner;
        uint256 salePrice = horse.price;

        uint256 fee = (salePrice * platformFee) / 1000;
        uint256 sellerAmount = salePrice - fee;

        horse.owner = payable(msg.sender);
        horse.isForSale = false;

        _transfer(previousOwner, msg.sender, _tokenId);

        previousOwner.transfer(sellerAmount);
        payable(platformOwner).transfer(fee);

        if (msg.value > salePrice) {
            payable(msg.sender).transfer(msg.value - salePrice);
        }

        emit HorseSold(_tokenId, previousOwner, msg.sender, salePrice);
    }

    function updatePrice(uint256 _tokenId, uint256 _newPrice)
        public
        horseExists(_tokenId)
        onlyHorseOwner(_tokenId)
    {
        require(_newPrice > 0, "Price must be greater than 0");
        uint256 oldPrice = horses[_tokenId].price;
        horses[_tokenId].price = _newPrice;
        emit HorsePriceUpdated(_tokenId, oldPrice, _newPrice);
    }

    function toggleSaleStatus(uint256 _tokenId)
        public
        horseExists(_tokenId)
        onlyHorseOwner(_tokenId)
    {
        horses[_tokenId].isForSale = !horses[_tokenId].isForSale;
    }

    function getHorsesForSale() public view returns (Horse[] memory) {
        uint256 total = _tokenIdCounter;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (tokenExists[i] && horses[i].isForSale) count++;
        }

        Horse[] memory forSale = new Horse[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (tokenExists[i] && horses[i].isForSale) {
                forSale[index] = horses[i];
                index++;
            }
        }
        return forSale;
    }

    function getHorsesByOwner(address _owner) public view returns (uint256[] memory) {
        uint256 total = _tokenIdCounter;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (tokenExists[i] && ownerOf(i) == _owner) count++;
        }

        uint256[] memory owned = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (tokenExists[i] && ownerOf(i) == _owner) {
                owned[index] = i;
                index++;
            }
        }
        return owned;
    }

    // ─── Start Auction ────────────────────────────────────
function startAuction(
    uint256 _tokenId,
    uint256 _startingPrice,
    uint256 _durationInHours
) public horseExists(_tokenId) onlyHorseOwner(_tokenId) {
    require(!auctions[_tokenId].isActive, "Auction already active");
    require(_startingPrice > 0, "Starting price must be > 0");
    require(_durationInHours > 0, "Duration must be > 0");

    uint256 endTime = block.timestamp + (_durationInHours * 1 hours);

    auctions[_tokenId] = Auction({
        tokenId: _tokenId,
        seller: payable(msg.sender),
        startingPrice: _startingPrice,
        highestBid: 0,
        highestBidder: payable(address(0)),
        endTime: endTime,
        isActive: true,
        isEnded: false
    });

    horses[_tokenId].isForSale = false;

    emit AuctionStarted(_tokenId, msg.sender, _startingPrice, endTime);
}

// ─── Place Bid ────────────────────────────────────────
function placeBid(uint256 _tokenId) public payable horseExists(_tokenId) {
    Auction storage auction = auctions[_tokenId];

    require(auction.isActive, "No active auction");
    require(block.timestamp < auction.endTime, "Auction has ended");
    require(msg.sender != auction.seller, "Seller cannot bid");
    require(
        msg.value > auction.highestBid &&
        msg.value >= auction.startingPrice,
        "Bid too low"
    );

    // Refund previous highest bidder
    if (auction.highestBidder != address(0)) {
        pendingReturns[_tokenId][auction.highestBidder] += auction.highestBid;
    }

    auction.highestBid = msg.value;
    auction.highestBidder = payable(msg.sender);

    emit BidPlaced(_tokenId, msg.sender, msg.value);
}

// ─── Accept Bid (Seller ends auction) ────────────────
function acceptBid(uint256 _tokenId)
    public
    horseExists(_tokenId)
    onlyHorseOwner(_tokenId)
{
    Auction storage auction = auctions[_tokenId];

    require(auction.isActive, "No active auction");
    require(auction.highestBidder != address(0), "No bids placed");

    address payable winner = auction.highestBidder;
    uint256 winningBid = auction.highestBid;

    auction.isActive = false;
    auction.isEnded = true;

    // Transfer NFT to winner
    horses[_tokenId].owner = winner;
    horses[_tokenId].isForSale = false;
    _transfer(msg.sender, winner, _tokenId);

    // Calculate fees
    uint256 fee = (winningBid * platformFee) / 1000;
    uint256 sellerAmount = winningBid - fee;

    // Transfer payments
    auction.seller.transfer(sellerAmount);
    payable(platformOwner).transfer(fee);

    emit AuctionEnded(_tokenId, winner, winningBid);
}

// ─── Cancel Auction ───────────────────────────────────
function cancelAuction(uint256 _tokenId)
    public
    horseExists(_tokenId)
    onlyHorseOwner(_tokenId)
{
    Auction storage auction = auctions[_tokenId];

    require(auction.isActive, "No active auction");
    require(auction.highestBidder == address(0), "Cannot cancel with active bids");

    auction.isActive = false;
    horses[_tokenId].isForSale = true;

    emit AuctionCancelled(_tokenId, msg.sender);
}

// ─── Withdraw Refund ──────────────────────────────────
function withdrawRefund(uint256 _tokenId) public {
    uint256 amount = pendingReturns[_tokenId][msg.sender];
    require(amount > 0, "No refund available");

    pendingReturns[_tokenId][msg.sender] = 0;
    payable(msg.sender).transfer(amount);
}

// ─── Get Auction Info ─────────────────────────────────
function getAuction(uint256 _tokenId)
    public
    view
    returns (Auction memory)
{
    return auctions[_tokenId];
}

    function getTotalHorses() public view returns (uint256) {
        return _tokenIdCounter;
    }
}