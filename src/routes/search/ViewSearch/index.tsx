// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from "react";
import { useParams } from "react-router-dom";

function ViewSearch(): JSX.Element {
  const { id } = useParams();
  return (
    <h1>
      New Search. <small>(Id={id})</small>
    </h1>
  );
}

export default ViewSearch;
