// typings.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */


// // export interface CategoryData extends TreeViewRow {
//   parentName?: string;
//   parentDescription?: string;
//   childId?: number | string;
//   childName?: string;
//   childDescription?: string;
// }

// // export interface Child {
// //   folderId: number;
// //   parentFolderId: number;
// //   folderName: string;
// //   children?: unknown;
// // }

export interface Folder {
  folderId: number;
  parentFolderId: number | string | null;
  folderName: string;
  children: Folder[];
}

export interface Folders {
  folders: Folder[];
}
