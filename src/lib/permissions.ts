import prisma from "./prisma";

type FinancialPermissionType =
    | "canCreateBudget"
    | "canApproveBudget"
    | "canCreateTransaction"
    | "canApproveTransaction"
    | "canViewReports";

/**
 * Check if a user has a specific financial permission
 */
export async function hasFinancialPermission(
    userId: string,
    permissionType: FinancialPermissionType
): Promise<boolean> {
    try {
        // First, check if user is an admin (has all permissions)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (user?.role === "SUPER_ADMIN" || user?.role === "CAPTAIN") {
            return true;
        }

        // Otherwise, check specific permission
        const permission = await prisma.financialPermission.findFirst({
            where: {
                userId,
                [permissionType]: true
            }
        });

        return !!permission;
    } catch (error) {
        console.error(`Error checking permission ${permissionType} for user ${userId}:`, error);
        return false;
    }
}

/**
 * Get transaction amount limit for a user
 * Returns null if no limit is set (for admins) or if there's an error
 */
export async function getTransactionAmountLimit(userId: string): Promise<number | null> {
    try {
        // Check if user is an admin (no limit)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (user?.role === "SUPER_ADMIN" || user?.role === "CAPTAIN") {
            return null; // No limit
        }

        // Get user's transaction limit
        const permission = await prisma.financialPermission.findFirst({
            where: { userId },
            select: { transactionAmountLimit: true }
        });

        return permission?.transactionAmountLimit ? parseFloat(permission.transactionAmountLimit.toString()) : 0;
    } catch (error) {
        console.error(`Error getting transaction limit for user ${userId}:`, error);
        return 0; // Default to zero if there's an error
    }
} 