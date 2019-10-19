process.env.NODE_ENV = 'test';
process.env.USE_TEST_DB = true;

let toReturn = [
    "ts-node/register",
    "tsconfig-paths/register",
    "source-map-support/register"
];

if (process.env.SIGNED_COOKIE === undefined) {
    toReturn.unshift('dotenv/config');
}

module.exports = {
    extension: [
        "ts"
    ],
    spec: "spec/**/*.spec.ts",
    require: toReturn,
    watch: "spec/**/*.spec.ts",
    exclude: "spec/integration/*"
}