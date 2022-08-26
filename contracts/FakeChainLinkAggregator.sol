// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FakeChainLinkAggregator is AggregatorV3Interface{

    int256 currentAnswer;
    uint8 dec = 8;

    function decimals() external view returns (uint8){
        return dec;
    }

    function description() external pure returns (string memory){
        return "HI";
    }

    function version() external pure returns (uint256){
        return 5;
    }

    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _roundId,
            currentAnswer,
            0,
            0,
            0
        );
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            0,
            currentAnswer,
            0,
            0,
            0
        );
    }

    function setCurrentPrice(int256 _newAnswer) external {
        currentAnswer = _newAnswer;
    }

    function setDecimals(uint8 _newDecimals) external {
        dec = _newDecimals;
    }
}