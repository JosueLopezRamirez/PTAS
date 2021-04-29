// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { Snackbar as MUISnackBar, SnackbarProps } from "@material-ui/core";
import React from "react";

type USeSnackBar = [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>
];

// // export const useSnackBar = (text: string | null = null): USeSnackBar => {
// //   const [snackText, setSnackText] = useState(text);
// //   return [snackText, setSnackText];
// // };

const _SnackBar = (props: SnackbarProps): JSX.Element => (
  <MUISnackBar
    anchorOrigin={{ vertical: "top", horizontal: "right" }}
    {...props}
  />
);

export default _SnackBar;
