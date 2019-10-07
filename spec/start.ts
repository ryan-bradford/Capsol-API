import find from 'find';
import { logger } from '@shared';
import Mocha from 'mocha';

// Init Jasmine
const mocha = new Mocha({
    fullStackTrace: true,
    bail: true,
});

// Run all or a single unit-test
logger.info(process.argv[2]);
if (process.argv[2]) {
    const testFile = process.argv[2];
    const files = find.fileSync(testFile + '.spec.ts', './spec');
    if (files.length === 1) {
        mocha.addFile(files[0]);
    } else {
        logger.error('Test file not found!');
    }
} else {
    const files = find.fileSync(new RegExp('.*spec.*'), './spec');
    logger.info(files);
    files.forEach((file) => {
        mocha.addFile(file);
    });
}

mocha.run();
