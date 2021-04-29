// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ICellEditorParams } from 'ag-grid-community';


interface ComboBoxCellEditorParams extends ICellEditorParams {
    values: { Value: string | number; Key?: string }[];
}

export class ComboBoxCellEditor {

    private _eInput: HTMLInputElement | null = null;
    private _eDiv: HTMLDivElement | null = null;
    cancelBeforeStart = false;

    public init(params: ComboBoxCellEditorParams): void {


        this._eDiv = document.createElement("div");

        this._eInput = document.createElement('input');
        this._eInput.type = "text";
        this._eInput.className = "combo-box";
        this._eInput.autocomplete = 'false';
        this._eDiv.appendChild(this._eInput);
        this._eInput.value = params.value;

        const eList: HTMLDataListElement = document.createElement('datalist');
        const randomId = Math.random().toString(36).substring(7);
        eList.id = randomId;

        params.values.map(strItm => {
            const option = document.createElement('option');
            option.value = `${strItm.Value}`;
            return option;
        }).forEach(itm => eList.appendChild(itm));
        this._eDiv.appendChild(eList);
        this._eInput.setAttribute("list", randomId);
    }

    public getGui(): HTMLElement {
        if (this._eDiv)
            return this._eDiv;
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
        return false;
    }

    public destroy(): void {
        //
    }

    public isPopup(): boolean {
        return false;
    }

}