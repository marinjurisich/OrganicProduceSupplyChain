pragma solidity ^0.8.0;

contract Test {

    uint public counter;

    constructor() {
        counter = 0;
    }

    function increment() public {
        counter++;
    }
}