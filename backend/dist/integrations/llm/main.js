import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';
export const LLMProvider = {
    Anthropic: LlmProvider.Anthropic,
    OpenAI: LlmProvider.OpenAI,
    Gemini: LlmProvider.Google,
};
export const getInstance = (options) => {
    const provider = options?.provider || process.env.LLM_PROVIDER || LlmProvider.Google;
    return new Llm({ provider });
};
