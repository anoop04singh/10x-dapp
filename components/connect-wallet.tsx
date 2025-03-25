"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ConnectWalletProps {
  onConnect: (account: string, provider: ethers.BrowserProvider) => void
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet found. Please install MetaMask.")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", [])

      // Check if we're on Sepolia
      const network = await provider.getNetwork()
      if (network.chainId !== 11155111n) {
        // Sepolia chainId
        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // 0xaa36a7 is hex for 11155111 (Sepolia)
          })
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Testnet",
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://sepolia.infura.io/v3/"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            })
          } else {
            throw switchError
          }
        }
      }

      onConnect(accounts[0], provider)
    } catch (err: any) {
      console.error("Error connecting to wallet:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={connectWallet} disabled={isConnecting} className="w-full max-w-xs">
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      <p className="text-xs text-muted-foreground">You'll need MetaMask and Sepolia testnet ETH</p>
    </div>
  )
}

