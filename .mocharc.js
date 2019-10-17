process.env.NODE_ENV = 'test';
process.env.USE_TEST_DB = true;

module.exports = {
    extension: [
        "ts"
    ],
    spec: "spec/**/*.spec.ts",
    require: [
        "./env",
        "ts-node/register",
        "tsconfig-paths/register",
        "source-map-support/register"
    ],
    watch: "spec/**/*.spec.ts"
}