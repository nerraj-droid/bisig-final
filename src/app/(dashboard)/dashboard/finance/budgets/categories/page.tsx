import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PlusCircle, FileDown, RefreshCw } from "lucide-react";

export default function BudgetCategoriesPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Budget Categories</h1>
                    <p className="text-muted-foreground">
                        Manage budget categories according to the Chart of Accounts standard.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" asChild>
                        <Link href="/dashboard/finance/budgets/categories/new">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Add Category</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                <TopLevelCategoriesCard />
            </div>
        </div>
    );
}

function TopLevelCategoriesCard() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Top-Level Categories</CardTitle>
                <CardDescription>
                    Major budget classification categories
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <CategoryItem
                        code="1000"
                        name="REVENUES"
                        description="Income sources"
                        href="/dashboard/finance/budgets/categories?parentId=1000"
                    />
                    <CategoryItem
                        code="2000"
                        name="EXPENSES"
                        description="Expenditure categories"
                        href="/dashboard/finance/budgets/categories?parentId=2000"
                    />
                    <CategoryItem
                        code="3000"
                        name="ASSETS"
                        description="Barangay assets"
                        href="/dashboard/finance/budgets/categories?parentId=3000"
                    />
                    <CategoryItem
                        code="4000"
                        name="LIABILITIES"
                        description="Obligations and debts"
                        href="/dashboard/finance/budgets/categories?parentId=4000"
                    />
                    <CategoryItem
                        code="5000"
                        name="EQUITY"
                        description="Net assets"
                        href="/dashboard/finance/budgets/categories?parentId=5000"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function CategoryItem({
    code,
    name,
    description,
    href,
}: {
    code: string;
    name: string;
    description: string;
    href: string;
}) {
    return (
        <div className="rounded-md border p-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center">
                        <span className="font-mono text-sm font-semibold text-muted-foreground mr-2">{code}</span>
                        <span className="font-semibold">{name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={href}>View Subcategories</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
} 