// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ICellEditorParams } from 'ag-grid-community';


interface DropdownCellEditorParams extends ICellEditorParams {
    values: { Value: string | number; Key?: string }[];
}

export class DropdownCellEditor {

    private _eInput: HTMLSelectElement | null = null;
    cancelBeforeStart = false;

    public init(params: DropdownCellEditorParams): void {

        const input = document.createElement('select');

        this._eInput = input;
        this._eInput.className = "dropdown";
        this._eInput.value = params.value;
        
        const exist = params.values.some(ppp => ppp.Value === parseInt(params.value));
        const values = exist ? params.values : [{ Key: '', Value: params.value }, ...params.values];

        values.map(strItm => {
            const option = document.createElement('option');
            option.value = `${strItm.Value}`;
            option.innerText = `${strItm.Key} (${option.value})`;
            return option;
        }).forEach(itm => input.options.add(itm));

    }

    public getGui(): HTMLElement {
        if (this._eInput)
            return this._eInput;
        throw new Error("Fail")
    }

    public afterGuiAttached(): void {
        //
    }

    public isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    public getValue(): string | null {
        return this._eInput?.value || null;
    }

    public isCancelAfterEnd(): boolean {
        return false;
    }

    public destroy(): void {
        //
    }

    public isPopup(): boolean {
        return false;
    }

}