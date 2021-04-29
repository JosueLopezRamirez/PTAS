// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ColSpanParams } from 'ag-grid-community';


export interface Option {
  value: string;
  title: string;
}

interface ValidationResult {
  message: string;
  passed: boolean;
}

export interface VarDefinition {
  title: string;
  fieldName: string;
  required?: boolean;
  readonly?: (value: { data: FormValues }) => boolean;
  minWidth?: number;
  width?: number;
  flex?: number;
  autoHeight?: boolean;
  values?: (() => string[]) | string[];
  defaultValue?: string;
  onValidate?: (value: string | null) => ValidationResult;
  colSpan?: (params: ColSpanParams) => number;
}

export interface Params {
  [id: string]: unknown;
}

export interface Validation {
  type: "required" | "min" | "max" | "minlength" | "maxlength" | "custom";
  message?: string;
  params?: Params;
  validator?: (dst: dataTypes) => boolean;
}

type FieldType = "textbox" | "dropdown" | "display" | "grid" | "boolean" | "number" | "date";


export interface Field {
  fieldId?: number;
  title?: string;
  label?: string;
  placeholder?: string;
  type: FieldType;
  fieldName: string;
  options?: Option[];
  vars?: VarDefinition[];
  validations?: Validation[];
  itemTemplates?: {
    title: string;
    newItem: VariableValue;
  }[];
  isMultiLine?: boolean;
  disabled?: boolean;
  className?: string;
  isRange?: boolean;
  toRangeField?: string;
  toRangeFieldId?: number;
  defaultValue?: string;
  toRangeDefaultValue?: string;
}

export interface FormSection {
  title?: string;
  disabled?: boolean;
  fields: Field[];
  className?: string;
}

export interface FormDefinition {
  className?: string;
  title?: string;
  sections: FormSection[];
}

export interface VariableValue {
  [id: string]: string;
}

type dataTypes = string | number | Date | VariableValue[] | boolean | null;

export interface FormValues {
  [id: string]: dataTypes;
}

export type SetField = (fieldName: string, fieldValue: dataTypes) => void;

