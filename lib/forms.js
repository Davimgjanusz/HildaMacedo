/** Exibe nos campos do formulário os erros devolvidos pela validação Zod do servidor. */
export function applyServerErrors(result, setError) {
    for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0])
            setError(field, { type: "server", message: messages[0] });
    }
}
