"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Form validation schema
const formSchema = z.object({
    code: z.string().min(1, "Code is required")
        .regex(/^\d+$/, "Code must contain only numbers"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    parentId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Top-level categories for parent selection
const topLevelCategories = [
    { id: "1000", name: "REVENUES" },
    { id: "2000", name: "EXPENSES" },
    { id: "3000", name: "ASSETS" },
    { id: "4000", name: "LIABILITIES" },
    { id: "5000", name: "EQUITY" },
];

export default function NewBudgetCategoryPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with schema
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            name: "",
            description: "",
            parentId: undefined,
        },
    });

    // Handle form submission
    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);

        try {
            // Convert parentId to number if provided
            const formData = {
                ...data,
                parentId: data.parentId ? parseInt(data.parentId) : null,
            };

            // Submit to API
            const response = await fetch("/api/finance/budget-categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create budget category");
            }

            toast.success("Budget category created successfully");
            router.push("/dashboard/finance/budgets/categories");
        } catch (error) {
            console.error("Error creating budget category:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create budget category");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Budget Category</CardTitle>
                    <CardDescription>
                        Add a new budget category following the Chart of Accounts standard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 1001" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Numeric code following the Chart of Accounts standard
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Local Taxes" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The official name of this budget category
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief description of the category"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Additional details about this category
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a parent category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {topLevelCategories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.id} - {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select a parent category for this item
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Category"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 