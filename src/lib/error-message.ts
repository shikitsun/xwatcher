/** Turns anything thrown or rejected into a message fit for the UI. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string" && error.trim() !== "") return error;
  return "Unexpected error";
}
