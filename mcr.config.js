// Shared by test workers and the coordinator.
export default {
    name: 'Playwright Browser Coverage',
    outputDir: './coverage-reports',
    reports: ['v8', 'console-summary', 'lcovonly'],
    // Workers share the cache; only global setup may clear it.
    cleanCache: false
};
