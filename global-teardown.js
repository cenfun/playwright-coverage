import MCR from 'monocart-coverage-reports';
import coverageOptions from './mcr.config.js';

export default async function globalTeardown() {
    // Generate once, after all workers have persisted their data.
    const results = await MCR(coverageOptions).generate();
    if (!results || !results.files.length) {
        throw new Error('No browser coverage generated: check fixtures and source scope');
    }
}
