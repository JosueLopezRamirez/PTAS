const path = require('path');
const syncDirectory = require('sync-directory');

/**
 * Copy to node modules
 */
syncDirectory(
  path.join(
    __dirname,
    '..',
    '..',
    '..',
    'PTASCommon',
    'Source',
    'PTASNPMCommon',
    '@ptas/react-ui-library'
  ),
  path.join(__dirname, 'node_modules/@ptas/react-ui-library'),
  {
    exclude: [/node\_modules/],
    afterSync({ type, relativePath }) {
      console.log(`Sync type= ${type}, relative path= ${relativePath}`);
      console.log(__dirname);
    },
  }
);
