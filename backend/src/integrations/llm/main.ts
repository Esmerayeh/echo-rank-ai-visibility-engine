import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';

export const LLMProvider = {
  Anthropic: LlmProvider.Anthropic,
  OpenAI: LlmProvider.OpenAI,
  Gemini: LlmProvider.Google,
} as const;

export type LLMProvider = typeof LLMProvider[keyof typeof LLMProvider];

export const getInstance = (options?: { provider?: LlmProvider }) => {
  const provider = options?.provider || (process.env.LLM_PROVIDER as LlmProvider) || LlmProvider.Google;
  return new Llm({ provider });
};