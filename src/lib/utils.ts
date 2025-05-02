import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (Philippine Peso)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats bytes into human-readable format
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.5 KB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Get icon name based on file type
 * @param fileType MIME type of the file
 * @returns Icon name to use
 */
export function getFileIconByType(fileType: string): string {
  if (!fileType) return "file";

  if (fileType.includes("image")) {
    return "image";
  } else if (fileType.includes("pdf")) {
    return "file-text";
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return "file-text";
  } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
    return "file-spreadsheet";
  } else if (fileType.includes("video")) {
    return "video";
  } else if (fileType.includes("audio")) {
    return "music";
  } else if (fileType.includes("zip") || fileType.includes("compressed")) {
    return "archive";
  } else {
    return "file";
  }
}
