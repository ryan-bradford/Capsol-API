const toExport = {
    name: 'default',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    database: process.env.USE_TEST_DB ? 'SOLAR_TEST' : 'SOLAR',
    synchronize: true,
    entities: ['./src/entities/**/*.ts'],
    migrations: ['db/migration/*.js'],
    insecureAuth: true,
}

if (process.env.IS_TRAVIS === 'false') {
    toExport.password = process.env.DB_PASSWORD;
}

module.exports = toExport;