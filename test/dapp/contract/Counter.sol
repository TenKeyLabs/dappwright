pragma solidity >= 0.8.16;
contract Counter {
    uint256 public count;

    function increase() external {
        count++;
    }
}
