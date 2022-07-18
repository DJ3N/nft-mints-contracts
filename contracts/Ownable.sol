// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

contract Ownable{

    address public owner;

    modifier onlyOwner(){
        require(msg.sender == owner, "NOT AUTHORIZED");
        _;
    }

    constructor()
    {
        owner = msg.sender;
    }

}