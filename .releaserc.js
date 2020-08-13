module.exports = {
    branches: ['main'],
    tagFormat: '${version}',
    plugins: [
        ['@semantic-release/commit-analyzer', {preset: 'eslint'}],
        ['@semantic-release/release-notes-generator', {preset: 'eslint'}],
        '@semantic-release/github',
        '@semantic-release/npm',
    ],
};
