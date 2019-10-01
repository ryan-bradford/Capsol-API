module.exports = {
    name: 'default',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'SOLAR',
    synchronize: false,
    entities: ['src/entities/**/*.ts'],
    migrations: ['db/migration/*.js'],
    insecureAuth: true,
}