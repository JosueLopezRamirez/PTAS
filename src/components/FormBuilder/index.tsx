// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import React, { useState, useEffect, useReducer } from 'react';
import { FormValues, FormDefinition, dataTypes } from './FormBuilder';
import FieldDisplay from './FieldDisplay';

interface ValidationError {
  fieldName: string;
  hasError?: boolean;
}

interface ReducerState {
  validationErrors: object;
}

export interface ReducerAction {
  type: string;
  payload?: ValidationError;
}

const initialState: ReducerState = {
  validationErrors: {},
};

// Each field will register it error (or lack there of) in the validationErrors object, using it's fieldname as a key
function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    case 'has-error':
      if (action.payload) {
        return {
          validationErrors: {
            ...state.validationErrors,
            [action.payload.fieldName]: action.payload.hasError,
          },
        };
      }
      break;
    case 'no-error':
      if (action.payload) {
        return {
          validationErrors: {
            ...state.validationErrors,
            [action.payload.fieldName]: false,
          },
        };
      }
      break;
    case 'clean-state':
      return { validationErrors: {} };
    default:
      return state;
  }
  return state;
}

const FormBuilder = ({
  formInfo,
  formData,
  onDataChange,
  onValidChange
}: {
  formInfo: FormDefinition;
  formData: FormValues;
  onDataChange?: (formValues: FormValues) => void;
  onValidChange?: (valid: boolean) => void;
}): JSX.Element => {
  const [localValues, setLocalValues] = useState<FormValues>({} as FormValues);

  //Validation error useReducer.
  const [errorState, dispatchError] = useReducer(reducer, initialState);

  useEffect(() => {
    setLocalValues(formData);
    dispatchError({ type: 'clean-state' });
  }, [formData]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(localValues);
    }
  }, [localValues, onDataChange]);

  useEffect(() => {
    if (onValidChange) {
      /*
      Convert the errors object into an iterable and navigate the values. If any field registers an error,
      it will be found      
      */
      const errorValues = Object.values(errorState.validationErrors);

      if (errorValues.length === 0) {
        onValidChange(false);
      } else {
        const errorFound = errorValues.find((e) => e === true);
        errorFound ? onValidChange(false) : onValidChange(true);
      }
    }
  }, [errorState, onValidChange]);

  const setField = (fieldName: string, fieldValue: dataTypes): void => {
    const settingField = { ...localValues, [fieldName]: fieldValue };
    setLocalValues(settingField);
  };

  return (
    <>
      {formInfo.title && <h1>{formInfo.title}</h1>}
      <section className={formInfo.className}>
        {formInfo.sections.map((section, index) => {
          return (
            <section key={index} className={section.className || ''}>
              {section.title && <h2>{section.title}</h2>}
              <div>
                {section.fields.map((f) => (
                  <div key={f.fieldName}>
                    {/* <pre>{JSON.stringify(f, null, 3)}</pre> */}
                    <FieldDisplay
                      setField={setField}
                      value={localValues[f.fieldName]}
                      allValues={localValues}
                      field={f}
                      dispatchError={dispatchError}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </>
  );
};
export default FormBuilder;
