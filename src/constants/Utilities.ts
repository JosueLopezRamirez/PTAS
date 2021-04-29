// Utilities.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ValidationResult } from 'components/FormBuilder/FormBuilder';


const validIdentifierRegex = /^[a-zA-Z_$][0-9a-zA-Z_$]*/;
const wordExtractRegex = /(\w|\s|\.)*\w(?=")|\w+/g;

const IsValidIdentifier = (str: string | null): boolean => {
  if (!str) return false;
  const r = str.match(validIdentifierRegex);
  return !!r && (r.length === 1);
}

export const IsValidIdentifiers = (str: string | null): ValidationResult[] => {
  if (!str) return [{ message: "Content expected", passed: false }];
  const r = str.match(wordExtractRegex);
  if (r?.length === 0)
    return [{ message: "No valid indentifiers found.", passed: false }];
  const t = r?.map((s): ValidationResult | null => {
    if (!IsValidIdentifier(s)) {
      return { message: `${r}  is not a valid identifier.`, passed: true }
    }
    return null;
  }).filter(s => s !== null);
  return t?.length ? t as ValidationResult[] : [{ message: "", passed: true }];
}


export const IsMatchingBrackets = (str: string | null): boolean => {
  if (!str) return true;
  const stack: string[] = [];
  const map: { [id: string]: string } = {
    '(': ')',
    '[': ']',
    '{': '}'
  }

  for (let i = 0; i < str.length; i++) {

    const thisChar = str[i];
    // If character is an opening brace add it to a stack
    if (thisChar === '(' || thisChar === '{' || thisChar === '[') {
      stack.push(thisChar);
    } else if (thisChar === ')' || thisChar === '}' || thisChar === '[') {
      if (stack.length === 0) return false;
      const last = stack.pop();
      if (last) {
        if (thisChar !== map[last]) {
          return false
        }
      }
    }
  }
  // By the completion of the for loop after checking all the brackets of the str, at the end, if the stack is not empty then fail
  return stack.length === 0;
}
