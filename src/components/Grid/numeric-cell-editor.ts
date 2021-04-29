// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ICellEditorParams } from 'ag-grid-community';


interface NumericCellEditorParams extends ICellEditorParams {
    allowDecimal?: boolean;
    maxValue?: number;
    minValue?: number;
}

export class NumericCellEditor {

    private _eInput: HTMLInputElement | null = null;
    private _allowDecimalPoint = false;
    cancelBeforeStart = false;
    private _maxValue: number | undefined;
    private _minValue: number | undefined;

    public init(params: NumericCellEditorParams): void {
        this._eInput = document.createElement('input');
        this._eInput.type = "number";
        this._eInput.className = "number-chooser";
        this._allowDecimalPoint = params.allowDecimal || false;
        this._maxValue = params.maxValue || Number.MAX_SAFE_INTEGER;
        this._minValue = params.minValue || Number.MIN_SAFE_INTEGER;

        const getCharCodeFromEvent = (event: { which?: number; keyCode: number }): number => {
            return event.which || event.keyCode;
        }
        const isCharNumeric = (charStr: string): boolean => {
            return (params.allowDecimal && charStr === '.') || !!/\d/.test(charStr);
        }

        const isKeyPressedNumeric = (event: KeyboardEvent): boolean => {
            const charCode = getCharCodeFromEvent(event);
            const charStr = String.fromCharCode(charCode);
            return isCharNumeric(charStr);
        }

        const isKeyPressedNavigation = (event: KeyboardEvent): boolean => {
            const c = getCharCodeFromEvent(event);
            return c === 39 || c === 37;
        }

        if (isCharNumeric(params.charPress || '')) {
            this._eInput.value = params.charPress || '';
        } else {
            if (params.value !== undefined && params.value !== null) {
                this._eInput.value = params.value;
            }
        }

        const charPressIsNotANumber = !!params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
        this.cancelBeforeStart = charPressIsNotANumber;


        this._eInput.addEventListener('keypress', (event) => {
            if (!isKeyPressedNumeric(event)) {
                this._eInput?.focus();
                if (event.preventDefault) {
                    event.preventDefault();
                }
            } else if (isKeyPressedNavigation(event)) {
                event.stopPropagation();
            }
        });
    }

    public getGui(): HTMLElement {
        if (this._eInput)
            return this._eInput;
        throw new Error("Fail")
    }

    public afterGuiAttached(): void {
        this._eInput?.select();
    }

    public isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    public getValue(): string | null {
        return this._eInput?.value || null;
    }

    public isCancelAfterEnd(): boolean {
        let result = false;
        const value = this.getValue() || '';
        const floatv = parseFloat(value);
        const intv = parseInt(value);
        if (!this._allowDecimalPoint && (floatv !== intv))
            result = true;
        if (this._maxValue && floatv > this._maxValue)
            result = true;
        if (this._minValue && floatv < this._minValue)
            result = true;
        return result;
    }

    public destroy(): void {
        //
    }

    public isPopup(): boolean {
        return false;
    }

}