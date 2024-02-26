const config = {
    type: 'app',
    title: 'Sharing Settings',
    description: "DHIS2 Objects Sharing Management Tool. Apply Sharing Settings in bulk or individually to any DHIS2 object.",
    entryPoints: {
        app: './src/App.js',
    },
    minDHIS2Version: '2.37',
    maxDHIS2Version: '2.40'
}

module.exports = config
