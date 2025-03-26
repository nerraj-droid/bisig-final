"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapProvider } from "@/components/map/map-context"
import { LocationPicker } from "@/components/map/location-picker"

const formSchema = z.object({
    houseNo: z.string().min(1, "House number is required"),
    street: z.string().min(1, "Street is required"),
    barangay: z.string().min(1, "Barangay is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    type: z.enum(["SINGLE_FAMILY", "MULTI_FAMILY", "EXTENDED_FAMILY", "SINGLE_PERSON", "NON_FAMILY", "OTHER"]),
    status: z.enum(["ACTIVE", "INACTIVE", "RELOCATED", "MERGED", "ARCHIVED"]),
    notes: z.string().optional(),
})

export function HouseholdForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            houseNo: "",
            street: "",
            barangay: "",
            city: "",
            province: "",
            zipCode: "",
            latitude: null,
            longitude: null,
            type: "SINGLE_FAMILY",
            status: "ACTIVE",
            notes: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true)
            const response = await fetch("/api/households", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error("Failed to create household")
            }

            const household = await response.json()
            router.push(`/dashboard/households/${household.id}`)
            router.refresh()
        } catch (error) {
            console.error("Error creating household:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="houseNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>House Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter house number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Street</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter street name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="barangay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Barangay</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter barangay" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter city" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Province</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter province" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter ZIP code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Household Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select household type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
                                        <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
                                        <SelectItem value="EXTENDED_FAMILY">Extended Family</SelectItem>
                                        <SelectItem value="SINGLE_PERSON">Single Person</SelectItem>
                                        <SelectItem value="NON_FAMILY">Non-Family</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="RELOCATED">Relocated</SelectItem>
                                        <SelectItem value="MERGED">Merged</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add any additional notes about the household"
                                    className="h-32"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div className="h-[400px] rounded-md border">
                        <MapProvider>
                            <LocationPicker
                                label="Location"
                                description="Click on the map to set the household location or enter coordinates manually"
                                value={form.getValues("latitude") && form.getValues("longitude") ? {
                                    latitude: form.getValues("latitude") as number,
                                    longitude: form.getValues("longitude") as number
                                } : null}
                                onChange={(location) => {
                                    if (location) {
                                        form.setValue("latitude", location.latitude)
                                        form.setValue("longitude", location.longitude)
                                    } else {
                                        form.setValue("latitude", null)
                                        form.setValue("longitude", null)
                                    }
                                }}
                                error={form.formState.errors.latitude?.message || form.formState.errors.longitude?.message}
                            />
                        </MapProvider>
                    </div>
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Household"}
                </Button>
            </form>
        </Form>
    )
} 