const fs = require('fs-extra');
const childProcess = require('child_process');


childProcess.exec('tsc --build tsconfig.prod.json');
