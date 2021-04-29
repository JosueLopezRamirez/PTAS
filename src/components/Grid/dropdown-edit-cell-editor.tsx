// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;
const KEY_ENTER = 13;
const KEY_TAB = 9;

interface InitialStateType {
  value: number;
  highlightAllOnFocus: boolean;
}

interface ParamsValue {
  Key: string;
  Value: number;
}

export const DropdownEditCellEditor = forwardRef(
  //eslint-disable-next-line
  (props: any, ref): JSX.Element => {
    const createInitialState = (): InitialStateType => {
      let startValue;
      let highlightAllOnFocus = true;

      if (props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE) {
        startValue = props.value;
      } else if (props.charPress) {
        startValue = props.charPress;
        highlightAllOnFocus = false;
      } else {
        startValue = props.value;
        if (props.keyPress === KEY_F2) {
          highlightAllOnFocus = false;
        }
      }

      return {
        value: startValue,
        highlightAllOnFocus,
      };
    };

    const initialState = createInitialState();

    const [value, setValue] = useState<number>(initialState.value);
    const [showList, setShowList] = useState<boolean>(false);
    const [highlightAllOnFocus, setHighlightAllOnFocus] = useState<boolean>(
      initialState.highlightAllOnFocus
    );
    const refInput = useRef(null);

    const cancelBeforeStart: boolean =
      props.charPress && '1234567890'.indexOf(props.charPress) < 0;

    const isLeftOrRight = (event: KeyboardEvent): boolean => {
      return [37, 39].indexOf(event.keyCode) > -1;
    };
    const getCharCodeFromEvent = (event: KeyboardEvent): number => {
      event = event || window.event;
      return typeof event.which === 'undefined' ? event.keyCode : event.which;
    };

    const isCharNumeric = (charStr: string): boolean => {
      return !!/\d/.test(charStr);
    };

    const isKeyPressedNumeric = (event: KeyboardEvent): boolean => {
      const charCode = getCharCodeFromEvent(event);
      const charStr = event.key ? event.key : String.fromCharCode(charCode);
      return isCharNumeric(charStr);
    };

    const deleteOrBackspace = (event: KeyboardEvent): boolean => {
      return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.keyCode) > -1;
    };

    const finishedEditingPressed = (event: KeyboardEvent): boolean => {
      const charCode = getCharCodeFromEvent(event);
      return charCode === KEY_ENTER || charCode === KEY_TAB;
    };

    const onKeyDown = useCallback((event: KeyboardEvent) => {
      if (isLeftOrRight(event) || deleteOrBackspace(event)) {
        event.stopPropagation();
        return;
      }

      if (!finishedEditingPressed(event) && !isKeyPressedNumeric(event)) {
        if (event.preventDefault) event.preventDefault();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      window.addEventListener('keydown', onKeyDown);
      return (): void => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }, [onKeyDown]);

    useImperativeHandle(ref, (): unknown => {
      return {
        afterGuiAttached(): void {
          //eslint-disable-next-line
          const eInput: any = refInput.current;
          eInput.focus();
          if (highlightAllOnFocus) {
            eInput.select();
            setHighlightAllOnFocus(false);
          } else {
            const length = eInput.value ? eInput.value.length : 0;
            if (length > 0) {
              eInput.setSelectionRange(length, length);
            }
          }
        },

        getValue(): number {
          return value;
        },

        isCancelBeforeStart(): boolean {
          return cancelBeforeStart;
        },
        isCancelAfterEnd(): boolean {
          return value > 1000000;
        },
      };
    });

    const onClick = (value: number): void => {
      setValue(value);
      setShowList(false);
    };

    const onClickRoow = (): void => {
      setShowList(!showList);
    };

    return (
      <div>
        <div className="List-input">
          <input
            ref={refInput}
            value={value}
            onChange={(event): void => setValue(parseInt(event.target.value))}
          />
          <span className="List-input-arrow" onClick={onClickRoow}/>
        </div>
        <div className="GradeList">
          {showList &&
            props.values.map(
              (value: ParamsValue): JSX.Element => (
                <span
                  className="GradeList-item"
                  onClick={(): void => onClick(value.Value)}
                >
                  {value.Key} ({value.Value})
                </span>
              )
            )}
        </div>
      </div>

      // <SelectSearch
      //     ref={refInput}
      //   renderValue={(valueProps): JSX.Element => (
      //     <input
      //     //   ref={refInput}
      //       value={value}
      //       onChange={(event) => setValue(event.target.value)}
      //       // {...valueProps}
      //       onBlur={(): void => {}}
      //     />
      //   )}
      //   options={getOptions()}
      //   value={value}
      //   search={false}
      //     printOptions="always"
      //     closeOnSelect={true}
      //   onChange={(ev, option) => onChange(option)}
      // />
    );
  }
);
