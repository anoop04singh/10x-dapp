"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectWallet } from "@/components/connect-wallet"
import { DonorRegistration } from "@/components/donor-registration"
import { ReceiverRegistration } from "@/components/receiver-registration"
import { MatchingDashboard } from "@/components/matching-dashboard"
import { OrganDonorABI } from "@/lib/abi"

export default function Home() {
  const [account, setAccount] = useState("")
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Contract address on Sepolia testnet
  const contractAddress = "0x54bDc44AC11c0956F44e04F2d2b811d0Fa154B77" // User's deployed contract address

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(provider)

          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0].address)
            setIsConnected(true)

            // Initialize contract
            const contract = new ethers.Contract(contractAddress, OrganDonorABI, provider.getSigner())
            setContract(contract)
          }
        } catch (error) {
          console.error("Error connecting to wallet:", error)
        }
      }
    }

    checkConnection()
  }, [])

  const handleConnect = async (connectedAccount: string, provider: ethers.BrowserProvider) => {
    setAccount(connectedAccount)
    setProvider(provider)
    setIsConnected(true)

    // Initialize contract with signer
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, OrganDonorABI, signer)
    setContract(contract)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Organ Donor Registry</CardTitle>
            <CardDescription>Register as a donor or recipient on the Sepolia blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <p className="text-muted-foreground text-center max-w-md">
                  Connect your wallet to access the organ donor registry on Sepolia testnet
                </p>
                <ConnectWallet onConnect={handleConnect} />
              </div>
            ) : (
              <Tabs defaultValue="donor" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="donor">Donor Registration</TabsTrigger>
                  <TabsTrigger value="receiver">Receiver Registration</TabsTrigger>
                  <TabsTrigger value="matching">Match Donors</TabsTrigger>
                </TabsList>
                <TabsContent value="donor">
                  <DonorRegistration contract={contract} account={account} />
                </TabsContent>
                <TabsContent value="receiver">
                  <ReceiverRegistration contract={contract} account={account} />
                </TabsContent>
                <TabsContent value="matching">
                  <MatchingDashboard contract={contract} account={account} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-xs text-muted-foreground">
              {isConnected
                ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
                : "Not connected"}
            </p>
            <p className="text-xs text-muted-foreground">Sepolia Testnet</p>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

