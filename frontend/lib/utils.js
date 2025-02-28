import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Existing cn function
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Add this new formatDate function
export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options); // Format for India (you can change)
}
