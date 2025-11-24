export const fetchDefinition = async (word, modelConfig, promptTemplate) => {
    if (!modelConfig) {
        throw new Error("No model configuration provided.");
    }

    const { endpointUrl, modelName, apiKey } = modelConfig;
    const prompt = promptTemplate.replace('{word}', word);

    const payload = {
        model: modelName,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        stream: false
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMsg = response.statusText;
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMsg = errorData.error?.message || errorData.error || JSON.stringify(errorData);
            } else {
                const errorText = await response.text();
                errorMsg = errorText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            throw new Error("Invalid response format from API.");
        }

    } catch (error) {
        console.error("API Call Error:", error);
        throw error;
    }
};
