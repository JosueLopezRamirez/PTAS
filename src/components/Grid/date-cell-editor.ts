// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ICellEditorParams } from 'ag-grid-community';


interface DateCellEditorParams extends ICellEditorParams {
    allowDecimal: boolean;
}

export class DateCellEditor {

    private _eInput: HTMLInputElement | null = null;
    private _allowDecimalPoint = false;

    public init(params: DateCellEditorParams): void {
        this._eInput = document.createElement('input');
        this._eInput.type = "datetime-local";
        this._eInput.className = "date-chooser";
        this._eInput.value = params.value;
    }

    public getGui(): HTMLElement {
        if (this._eInput)
            return this._eInput;
        throw new Error("Fail")
    }

    public afterGuiAttached(): void {
        this._eInput?.select();
    }


    public getValue(): string | null {
        return this._eInput?.value+':00' || '';
    }

    public isCancelAfterEnd(): boolean {
        // const value = this.getValue() || '';
        return false;
    }

    public destroy(): void {
        //
    }

    public isPopup(): boolean {
        return false;
    }

}