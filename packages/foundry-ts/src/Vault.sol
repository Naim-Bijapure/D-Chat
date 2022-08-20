pragma solidity >=0.8.0 <0.9.0;

// SPDX-License-Identifier: MIT

import "@lukso/lsp-smart-contracts/contracts/LSP9Vault/LSP9Vault.sol";

contract Vault is LSP9Vault {
  //   contract Vault {
  constructor(address _newOwner) LSP9Vault(_newOwner) {}

  //   constructor() {}

  //   string public purpose = "default purpose";

  //   function setPurpose(string memory _purpose) public {
  //     purpose = _purpose;
  //   }
  receive() external payable {}
}
