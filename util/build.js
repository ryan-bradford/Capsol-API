const fs = require('fs-extra');
const childProcess = require('child_process');


try {
    // Transpile the typescript files
    childProcess.exec('tsc --build tsconfig.prod.json');
} catch (err) {
    console.log(err);
}
