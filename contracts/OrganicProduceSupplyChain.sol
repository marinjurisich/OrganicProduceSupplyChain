pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract OrganicProduceSupplyChain is AccessControl {

    struct Produce {
        uint id;
        string name;
        address currentOwner;
        uint amount;
    }

    struct History {
        address owner;
        uint256 timestamp;
        string status;
    }

    bytes32 public constant ROLE_FARMER = keccak256("ROLE_FARMER");
    bytes32 public constant ROLE_AGGREGATOR = keccak256("ROLE_AGGREGATOR");
    bytes32 public constant ROLE_RETAILER = keccak256("ROLE_RETAILER");

    Produce[] public allProduce;
    uint256 public produceCount = 0;
    mapping(uint256 => History[]) public histories;
    mapping (address => string) users;
    mapping (address => uint256[]) public usersProduce;
    address[] public farmers;
    address[] public aggregators;
    address[] public retailers;

    event ProduceCreated(string name, address owner, uint amount, uint256 timestamp, string status);
    event ProduceTransferred(uint id, address oldOwner, address newOwner, uint256 timestamp, string status);
    event ProduceSoldToCustomer(uint id, address owner, uint timestamp, string status);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createProduce(string memory _name, uint _amount) public onlyRole(ROLE_FARMER) {
        
        Produce memory newProduce = Produce(produceCount, _name, msg.sender, _amount);
        allProduce.push(newProduce);
        usersProduce[msg.sender].push(produceCount);

        History memory newHistory;
        newHistory.owner = msg.sender;
        newHistory.timestamp = block.timestamp;
        newHistory.status = "Created";
        histories[produceCount].push(newHistory);

        emit ProduceCreated(_name, msg.sender, _amount, block.timestamp, "Created");
        ++produceCount;
    }

    function getUserProduce() public view returns (Produce[] memory) {
        uint256[] storage produceIds = usersProduce[msg.sender];
        Produce[] memory produces = new Produce[](produceIds.length);
        for (uint256 i = 0; i < produceIds.length; i++) {
            produces[i] = allProduce[produceIds[i]];
        }
        return produces;
    }

    function transferProduceToAggregator(uint _produceId, address _newOwner) public onlyRole(ROLE_FARMER) {
        Produce storage produce = allProduce[_produceId];
        require(msg.sender == produce.currentOwner, "Only the current owner can transfer produce");

        address previousOwner = produce.currentOwner;
        allProduce[_produceId].currentOwner = _newOwner;
        History memory history;
        history.owner = _newOwner;
        history.timestamp = block.timestamp;
        history.status = "Transferred to an aggregator";
        histories[_produceId].push(history);

        usersProduce[_newOwner].push(_produceId);

        emit ProduceTransferred(_produceId, previousOwner, _newOwner, block.timestamp, "Transferred to an aggregator");
    }

    function transferProduceToRetailer(uint _produceId, address _newOwner) public onlyRole(ROLE_AGGREGATOR) {
        Produce storage produce = allProduce[_produceId];
        require(msg.sender == produce.currentOwner, "Only the current owner can transfer produce");

        address previousOwner = produce.currentOwner;
        allProduce[_produceId].currentOwner = _newOwner;
        History memory history;
        history.owner = _newOwner;
        history.timestamp = block.timestamp;
        history.status = "Transferred to a retailer";
        histories[_produceId].push(history);

        usersProduce[_newOwner].push(_produceId);

        emit ProduceTransferred(_produceId, previousOwner, _newOwner, block.timestamp, "Transferred to a retailer");
    }

    function soldToCustomer(uint _produceId) public onlyRole(ROLE_RETAILER) {
        Produce storage produce = allProduce[_produceId];
        require(msg.sender == produce.currentOwner, "Only the current owner can transfer produce");

        History memory history;
        history.owner = produce.currentOwner;
        history.timestamp = block.timestamp;
        history.status = "Sold to a customer";
        histories[_produceId].push(history);

        produce.currentOwner = address(0);

        emit ProduceSoldToCustomer(_produceId, produce.currentOwner, block.timestamp, "Sold to a customer");
    }

    function getAllProduce() public view returns (Produce[] memory) {
        return allProduce;
    }

    function getProduceHistory(uint _id) public view returns (History[] memory) {
        return histories[_id];
    }

    function getUsername(address _user) public view returns (string memory) {
        return users[_user];
    }

    function addUser(address _user, string memory _name) public {

        users[_user] = _name;

        if (hasRole(ROLE_FARMER, _user)) {
            farmers.push(_user);
        } else if (hasRole(ROLE_AGGREGATOR, _user)) {
            aggregators.push(_user);
        } else if (hasRole(ROLE_RETAILER, _user)) {
            retailers.push(_user);
        }
    }

    function grantRole(bytes32 _role, address _account, string memory _username) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _grantRole(_role, _account);

        addUser(_account, _username);
    }

    function revokeRole(bytes32 role, address account) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _revokeRole(role, account);
    }

    function getAllFarmers() public view returns (address[] memory, string[] memory) {
        string[] memory names = new string[](farmers.length);

        for (uint i = 0; i < farmers.length; i++) {
            names[i] = users[farmers[i]];
        }
        return (farmers, names);
    }

    function getAllAggregators() public view returns (address[] memory, string[] memory) {
        string[] memory names = new string[](aggregators.length);
        
        for (uint i = 0; i < aggregators.length; i++) {
            names[i] = users[aggregators[i]];
        }
        return (aggregators, names);
    }

    function getAllRetailers() public view returns (address[] memory, string[] memory) {
        string[] memory names = new string[](retailers.length);
        
        for (uint i = 0; i < retailers.length; i++) {
            names[i] = users[retailers[i]];
        }
        return (retailers, names);
    }

}