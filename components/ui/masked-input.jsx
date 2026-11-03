import { Controller } from "react-hook-form";
import { Input } from "./form-controls";

/**
 * Campo de texto com máscara, ligado ao React Hook Form.
 * A máscara é aplicada a cada tecla; o valor guardado no formulário já vem mascarado.
 */
export function MaskedInput({ control, name, mask, ...props }) {
    return (<Controller control={control} name={name} render={({ field }) => (<Input {...props} name={field.name} ref={field.ref} value={field.value ?? ""} onBlur={field.onBlur} onChange={(e) => field.onChange(mask(e.target.value))}/>)}/>);
}
