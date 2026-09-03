import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Curation and URL-extraction need it -- see .env.example."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const CURATION_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
