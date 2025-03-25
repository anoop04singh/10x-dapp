"use client"

import { useState } from "react"
import type { ethers } from "ethers"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ReceiverRegistrationProps {
  contract: ethers.Contract | null
  account: string
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.string().refine(
    (val) => {
      const num = Number.parseInt(val)
      return !isNaN(num) && num >= 0 && num <= 100
    },
    { message: "Age must be between 0 and 100." },
  ),
  bloodType: z.string().min(1, { message: "Please select a blood type." }),
  organNeeded: z.string().min(1, { message: "Please select an organ type." }),
  urgencyLevel: z.number().min(1).max(10),
  medicalHistory: z.string().min(10, { message: "Please provide a brief medical history." }),
  contactInfo: z.string().min(10, { message: "Contact information is required." }),
})

export function ReceiverRegistration({ contract, account }: ReceiverRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      bloodType: "",
      organNeeded: "",
      urgencyLevel: 5,
      medicalHistory: "",
      contactInfo: "",
    },
  })

  // Update the onSubmit function to better handle contract interactions
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!contract) {
      toast({
        title: "Error",
        description: "Contract not initialized. Please try reconnecting your wallet.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Convert form data to contract parameters
      const receiverData = {
        name: values.name,
        age: Number.parseInt(values.age),
        bloodType: values.bloodType,
        organNeeded: values.organNeeded,
        urgencyLevel: values.urgencyLevel,
        medicalHistory: values.medicalHistory,
        contactInfo: values.contactInfo,
      }

      console.log("Registering receiver with data:", receiverData)

      // Call contract method to register receiver
      const tx = await contract.registerReceiver(
        receiverData.name,
        receiverData.age,
        receiverData.bloodType,
        receiverData.organNeeded,
        receiverData.urgencyLevel,
        receiverData.medicalHistory,
        receiverData.contactInfo,
      )

      toast({
        title: "Transaction Submitted",
        description: "Your receiver registration is being processed on the blockchain. Transaction hash: " + tx.hash,
      })

      // Wait for transaction to be mined
      await tx.wait()

      toast({
        title: "Registration Successful",
        description: "You have been registered as an organ receiver on the blockchain.",
      })

      // Reset form
      form.reset()
    } catch (error: any) {
      console.error("Error registering receiver:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering you as a receiver.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium">Receiver Registration</h3>
        <p className="text-sm text-muted-foreground">Register as an organ receiver on the blockchain</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bloodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organNeeded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organ Needed</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organ needed" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kidney">Kidney</SelectItem>
                    <SelectItem value="liver">Liver</SelectItem>
                    <SelectItem value="heart">Heart</SelectItem>
                    <SelectItem value="lung">Lung</SelectItem>
                    <SelectItem value="pancreas">Pancreas</SelectItem>
                    <SelectItem value="cornea">Cornea</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urgencyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency Level (1-10)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Current: {field.value}</span>
                      <span>High</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>Rate the urgency of your need from 1 (low) to 10 (critical)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicalHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brief Medical History</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a brief summary of relevant medical history"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be stored on the blockchain. Only provide information you're comfortable sharing.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Information</FormLabel>
                <FormControl>
                  <Input placeholder="Email or phone number" {...field} />
                </FormControl>
                <FormDescription>
                  This will be stored on the blockchain. Only provide information you're comfortable sharing.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register as Receiver"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

