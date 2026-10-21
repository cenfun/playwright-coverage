import { rm } from 'node:fs/promises';
import coverageOptions from './mcr.config.js';

async function globalSetup() {
    // Remove reports as well as cached data, including runs that collect nothing.
    await rm(coverageOptions.outputDir, {
        recursive: true,
        force: true
    });
}

export default globalSetup;
