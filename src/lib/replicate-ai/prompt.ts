import Replicate from 'replicate';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function prompt(
    model_identifier: `${string}/${string}` | `${string}/${string}:${string}`,
    input: Record<string, any>
): Promise<string[]> {
    return replicate
        .run(model_identifier, {
            input,
        })
        .then((output) => {
            if (Array.isArray(output)) {
                const outputString = output.join('').trim();
                console.debug('prompt output', outputString);
                return JSON.parse(outputString);
            } else {
                throw new Error('Invalid output');
            }
        })
        .catch((error) => {
            console.error(error);
            throw new Error(error);
        });
}
