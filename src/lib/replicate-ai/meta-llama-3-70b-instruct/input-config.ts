const model_identifier:
    | `${string}/${string}`
    | `${string}/${string}:${string}` = 'meta/meta-llama-3-70b-instruct';
const system_prompt =
    'You are an API. You will be provided a CSV with building solar data. You will be asked to perform a task by the user on the provided data. Your output should always be valid JSON. You should always output only the id. Output format: [id]';
const max_tokens = 1024;
const min_tokens = 0;
const temperature = 0;
const top_p = 1;
const top_k = 0;
const stop_sequences = '<|end_of_text|>,<|eot_id|>';
const length_penalty = 1;
const presence_penalty = 1.15;
const prompt_template =
    '<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>';
const user_prompt = '{data}\n\nPerform:\n{userInput}';
const log_performance_metrics = false;

const meta_llama_3_70b_instruct = {
    modelIdentifier: model_identifier,
    generateInput: (data: string, userInput: string) => {
        return {
            prompt: user_prompt
                .replace('{data}', data)
                .replace('{userInput}', userInput),
            system_prompt,
            prompt_template,
            top_k,
            top_p,
            max_tokens,
            min_tokens,
            temperature,
            stop_sequences,
            length_penalty,
            presence_penalty,
            log_performance_metrics,
        };
    },
};

export default meta_llama_3_70b_instruct;
