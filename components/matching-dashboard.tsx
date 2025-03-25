"use client"

import { useState, useEffect } from "react"
import type { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, UserCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MatchingDashboardProps {
  contract: ethers.Contract | null
  account: string
}

interface Donor {
  id: string
  name: string
  age: number
  bloodType: string
  organType: string
  contactInfo: string
  isMatched: boolean
}

interface Receiver {
  id: string
  name: string
  age: number
  bloodType: string
  organNeeded: string
  urgencyLevel: number
  contactInfo: string
  isMatched: boolean
}

export function MatchingDashboard({ contract, account }: MatchingDashboardProps) {
  const [donors, setDonors] = useState<Donor[]>([])
  const [receivers, setReceivers] = useState<Receiver[]>([])
  const [selectedDonor, setSelectedDonor] = useState<string>("")
  const [selectedReceiver, setSelectedReceiver] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMatching, setIsMatching] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (contract) {
      fetchDonorsAndReceivers()
    }
  }, [contract])

  // Replace the fetchDonorsAndReceivers function with this updated version that properly fetches from the contract
  const fetchDonorsAndReceivers = async () => {
    setIsLoading(true)
    try {
      if (!contract) {
        throw new Error("Contract not initialized")
      }

      // Fetch donors from the contract
      const donorCount = await contract.getDonorCount()
      const fetchedDonors: Donor[] = []

      for (let i = 0; i < donorCount; i++) {
        try {
          const donor = await contract.getDonor(i)
          fetchedDonors.push({
            id: i.toString(),
            name: donor[0], // name
            age: Number(donor[1]), // age
            bloodType: donor[2], // bloodType
            organType: donor[3], // organType
            contactInfo: donor[4], // contactInfo
            isMatched: donor[5], // isMatched
          })
        } catch (error) {
          console.error(`Error fetching donor ${i}:`, error)
        }
      }

      // Fetch receivers from the contract
      const receiverCount = await contract.getReceiverCount()
      const fetchedReceivers: Receiver[] = []

      for (let i = 0; i < receiverCount; i++) {
        try {
          const receiver = await contract.getReceiver(i)
          fetchedReceivers.push({
            id: i.toString(),
            name: receiver[0], // name
            age: Number(receiver[1]), // age
            bloodType: receiver[2], // bloodType
            organNeeded: receiver[3], // organNeeded
            urgencyLevel: Number(receiver[4]), // urgencyLevel
            contactInfo: receiver[5], // contactInfo
            isMatched: receiver[6], // isMatched
          })
        } catch (error) {
          console.error(`Error fetching receiver ${i}:`, error)
        }
      }

      setDonors(fetchedDonors)
      setReceivers(fetchedReceivers)

      // Log the data for debugging
      console.log("Fetched donors:", fetchedDonors)
      console.log("Fetched receivers:", fetchedReceivers)
    } catch (error) {
      console.error("Error fetching donors and receivers:", error)
      toast({
        title: "Error",
        description: "Failed to load donors and receivers from the contract",
        variant: "destructive",
      })

      // Reset to empty arrays instead of using test data
      setDonors([])
      setReceivers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!contract || !selectedDonor || !selectedReceiver) {
      toast({
        title: "Error",
        description: "Please select both a donor and receiver to match",
        variant: "destructive",
      })
      return
    }

    setIsMatching(true)
    try {
      // Call contract method to create a match
      const tx = await contract.createMatch(selectedDonor, selectedReceiver)

      toast({
        title: "Transaction Submitted",
        description: "Your matching request is being processed on the blockchain.",
      })

      // Wait for transaction to be mined
      await tx.wait()

      toast({
        title: "Match Successful",
        description: "The donor and receiver have been successfully matched.",
      })

      // Refresh the data
      fetchDonorsAndReceivers()

      // Reset selections
      setSelectedDonor("")
      setSelectedReceiver("")
    } catch (error: any) {
      console.error("Error creating match:", error)
      toast({
        title: "Match Failed",
        description: error.message || "There was an error creating the match.",
        variant: "destructive",
      })
    } finally {
      setIsMatching(false)
    }
  }

  const isValidMatch = (donorId: string, receiverId: string) => {
    const donor = donors.find((d) => d.id === donorId)
    const receiver = receivers.find((r) => r.id === receiverId)

    if (!donor || !receiver) return false
    if (donor.isMatched || receiver.isMatched) return false

    // Check if blood types are compatible
    // This is a simplified check - real compatibility would be more complex
    return donor.bloodType === receiver.bloodType && donor.organType === receiver.organNeeded
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium">Match Donors with Receivers</h3>
        <p className="text-sm text-muted-foreground">Create matches between compatible donors and receivers</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={fetchDonorsAndReceivers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Donors</CardTitle>
                <CardDescription>Select a donor to match with a receiver</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a donor" />
                  </SelectTrigger>
                  <SelectContent>
                    {donors
                      .filter((donor) => !donor.isMatched)
                      .map((donor) => (
                        <SelectItem key={donor.id} value={donor.id}>
                          {donor.name} - {donor.bloodType} - {donor.organType}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedDonor && (
                  <div className="mt-4 space-y-2 rounded-md border p-3">
                    {(() => {
                      const donor = donors.find((d) => d.id === selectedDonor)
                      if (!donor) return null

                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{donor.name}</span>
                            <Badge>{donor.bloodType}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">Age: {donor.age}</div>
                          <div className="text-sm">
                            Organ: <span className="font-medium capitalize">{donor.organType}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waiting Receivers</CardTitle>
                <CardDescription>Select a receiver to match with a donor</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedReceiver} onValueChange={setSelectedReceiver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a receiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {receivers
                      .filter((receiver) => !receiver.isMatched)
                      .map((receiver) => (
                        <SelectItem key={receiver.id} value={receiver.id}>
                          {receiver.name} - {receiver.bloodType} - {receiver.organNeeded}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedReceiver && (
                  <div className="mt-4 space-y-2 rounded-md border p-3">
                    {(() => {
                      const receiver = receivers.find((r) => r.id === selectedReceiver)
                      if (!receiver) return null

                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{receiver.name}</span>
                            <Badge>{receiver.bloodType}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">Age: {receiver.age}</div>
                          <div className="text-sm">
                            Needed: <span className="font-medium capitalize">{receiver.organNeeded}</span>
                          </div>
                          <div className="text-sm">
                            Urgency: <span className="font-medium">{receiver.urgencyLevel}/10</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <Button
            className="w-full"
            disabled={
              isMatching || !selectedDonor || !selectedReceiver || !isValidMatch(selectedDonor, selectedReceiver)
            }
            onClick={handleMatch}
          >
            {isMatching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Match...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Create Match
              </>
            )}
          </Button>
          {selectedDonor && selectedReceiver && !isValidMatch(selectedDonor, selectedReceiver) && (
            <p className="text-sm text-destructive text-center">
              These donor and receiver are not compatible. Please select a different pair.
            </p>
          )}
          // Replace the existing matches section with this updated version
          <div className="rounded-md border p-4">
            <h4 className="font-medium mb-2">Existing Matches</h4>
            {donors.filter((d) => d.isMatched).length === 0 && receivers.filter((r) => r.isMatched).length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches have been created yet.</p>
            ) : (
              <div className="space-y-2">
                {donors
                  .filter((d) => d.isMatched)
                  .map((donor, index) => {
                    // Find a matching receiver
                    const matchedReceiver = receivers.find(
                      (r) =>
                        r.isMatched &&
                        r.organNeeded.toLowerCase() === donor.organType.toLowerCase() &&
                        r.bloodType.toLowerCase() === donor.bloodType.toLowerCase(),
                    )

                    if (!matchedReceiver) return null

                    return (
                      <div key={`match-${index}`} className="rounded-md border p-2 text-sm">
                        <div className="flex justify-between">
                          <span>
                            <span className="font-medium">{donor.name}</span> (Donor)
                          </span>
                          <span>
                            <span className="font-medium">{matchedReceiver.name}</span> (Receiver)
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>
                            {donor.bloodType} • {donor.organType}
                          </span>
                          <span>Urgency: {matchedReceiver.urgencyLevel}/10</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

