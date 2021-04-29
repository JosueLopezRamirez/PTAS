// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { Field, VariableValue, VarDefinition, ValidationResult, dataTypes, Validation } from './FormBuilder';


interface ValidationResponse {
    passed: boolean;
    messages: string[];
}

const validateField = (v: VarDefinition, value: string | null): ValidationResult => {
    if (!value && v.required) {
        return { passed: false, message: `Value of field ${v.title} is required.` }
    }
    if (v.onValidate) {
        return v.onValidate(value);
    }
    return { passed: true, message: "" }
}

const CheckValidation = (fieldInfo: Field, value: VariableValue): ValidationResponse => {
    const t = fieldInfo.vars?.map(v => validateField(v, value[v.fieldName]));
    return { passed: t?.every(x => x.passed) || false, messages: t?.map(x => x.message) || [] };

}

const CheckOneValidation = (f: Field, vd: Validation, v: dataTypes): ValidationResult | null => {
    switch (vd.type) {
        case 'required':
            if (!v) return { message: vd.message || `Field ${f.fieldName} is required.`, passed: false }
            break;
        case 'minlength':
            if (`${v}`.length > (vd.params?.length as number))
                return { message: vd.message || `Field ${f.fieldName} must be at least ${vd.params?.length} characters long.`, passed: false }
            break;
        case 'maxlength':
            if (`${v}`.length < (vd.params?.length as number))
                return { message: vd.message || `Field ${f.fieldName} must be less than ${vd.params?.length} characters long.`, passed: false }
            break;
        case 'max':
            {
                const errorResult = {
                    message: vd.message || `Field ${f.fieldName} must be less than ${vd.params?.max}.`, passed: false
                };
                if (f.type === 'number' && (v as number) > (vd.params?.max as number))
                    return errorResult;
                if (f.type === 'date' && (v as Date) > (vd.params?.max as Date))
                    return errorResult;
                if (f.type === 'textbox' && (v as string) > (vd.params?.max as string))
                    return errorResult;
                break;
            }
        case 'min':
            {
                const errorResult = {
                    message: `Field ${f.fieldName} must be greater than ${vd.params?.max}.`, passed: false
                };
                if (f.type === 'number' && (v as number) < (vd.params?.max as number))
                    return errorResult;
                if (f.type === 'date' && (v as Date) < (vd.params?.max as Date))
                    return errorResult;
                if (f.type === 'textbox' && (v as string) < (vd.params?.max as string))
                    return errorResult;
                break;
            }
        default:
            break;
    }

    return null;
}

const CheckFieldForErrors = (fieldInfo: Field, value: dataTypes): ValidationResult[] => {
    return (fieldInfo.validations || []).map(vd => CheckOneValidation(fieldInfo, vd, value)).filter(xx => xx !== null) as ValidationResult[];
}

export { CheckValidation, CheckFieldForErrors }