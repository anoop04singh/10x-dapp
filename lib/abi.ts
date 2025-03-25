export const OrganDonorABI = [
  // Donor Registration
  "function registerDonor(string name, uint256 age, string bloodType, string organType, string contactInfo) external",
  "function getDonor(uint256 donorId) external view returns (string name, uint256 age, string bloodType, string organType, string contactInfo, bool isMatched)",
  "function getDonorCount() external view returns (uint256)",

  // Receiver Registration
  "function registerReceiver(string name, uint256 age, string bloodType, string organNeeded, uint256 urgencyLevel, string medicalHistory, string contactInfo) external",
  "function getReceiver(uint256 receiverId) external view returns (string name, uint256 age, string bloodType, string organNeeded, uint256 urgencyLevel, string contactInfo, bool isMatched)",
  "function getReceiverCount() external view returns (uint256)",

  // Matching
  "function createMatch(uint256 donorId, uint256 receiverId) external",
  "function getMatch(uint256 matchId) external view returns (uint256 donorId, uint256 receiverId, uint256 timestamp)",
  "function getMatchCount() external view returns (uint256)",
]

