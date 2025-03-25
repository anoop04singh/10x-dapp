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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface DonorRegistrationProps {
  contract: ethers.Contract | null
  account: string
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.string().refine(
    (val) => {
      const num = Number.parseInt(val)
      return !isNaN(num) && num >= 18 && num <= 100
    },
    { message: "Age must be between 18 and 100." },
  ),
  bloodType: z.string().min(1, { message: "Please select a blood type." }),
  organType: z.string().min(1, { message: "Please select an organ type." }),
  contactInfo: z.string().min(10, { message: "Contact information is required." }),
  consent: z.boolean().refine((val) => val === true, { message: "You must consent to donation." }),
})

export function DonorRegistration({ contract, account }: DonorRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      bloodType: "",
      organType: "",
      contactInfo: "",
      consent: false,
    },
  })

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
      const donorData = {
        name: values.name,
        age: Number.parseInt(values.age),
        bloodType: values.bloodType,
        organType: values.organType,
        contactInfo: values.contactInfo,
      }

      console.log("Registering donor with data:", donorData)

      // Call contract method to register donor
      const tx = await contract.registerDonor(
        donorData.name,
        donorData.age,
        donorData.bloodType,
        donorData.organType,
        donorData.contactInfo,
      )

      toast({
        title: "Transaction Submitted",
        description: "Your donor registration is being processed on the blockchain. Transaction hash: " + tx.hash,
      })

      // Wait for transaction to be mined
      await tx.wait()

      toast({
        title: "Registration Successful",
        description: "You have been registered as an organ donor on the blockchain.",
      })

      // Reset form
      form.reset()
    } catch (error: any) {
      console.error("Error registering donor:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering you as a donor.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium">Donor Registration</h3>
        <p className="text-sm text-muted-foreground">Register as an organ donor on the blockchain</p>
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
            name="organType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organ Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organ type" />
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

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I consent to be registered as an organ donor</FormLabel>
                  <FormDescription>
                    By checking this box, you confirm your willingness to donate your selected organ.
                  </FormDescription>
                </div>
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
              "Register as Donor"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

