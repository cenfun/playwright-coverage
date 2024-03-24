export default {

    name: 'My Playwright Coverage Report',

    reports: [
        'console-details',
        'v8'
    ],

    // entryFilter: {
    //     '**/node_modules/**': false,
    //     '**/*.js': true
    // },

    outputDir: './coverage-reports'
};
