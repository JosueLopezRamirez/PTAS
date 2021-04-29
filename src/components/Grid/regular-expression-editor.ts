// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ICellEditorParams } from 'ag-grid-community';


interface RegularExpressionCellEditorParams extends ICellEditorParams {
    regularExpression: RegExp;
    className?: string;
}

export class RegularExpressionCellEditor {

    private _eInput: HTMLInputElement | null = null;
    private _regularExpression: RegExp | null = null;

    public init(params: RegularExpressionCellEditorParams): void {
        this._eInput = document.createElement('input');
        this._eInput.type = "textbox";
        this._eInput.className = `textbox ${params.className}`.trimEnd();
        this._eInput.value = params.value;
        this._regularExpression = params.regularExpression;
    }

    public getGui(): HTMLElement {
        if (this._eInput)
            return this._eInput;
        throw new Error("Fail")
    }

    public afterGuiAttached(): void {
        this._eInput?.select();
    }


    public getValue(): string {
        return (this._eInput?.value || '');
    }

    public isCancelAfterEnd(): boolean {
        return !(this._regularExpression?.test(this.getValue()));
    }

    public destroy(): void {
        //
    }

    public isPopup(): boolean {
        return false;
    }

}