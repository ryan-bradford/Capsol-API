const entities = require('./src/entities');

module.exports = {
    name: 'default',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'SOLAR',
    synchronize: false,
    entities: [entities.Investment, entities.Contract, entities.Investor, entities.Homeowner, entities.PurchaseRequest, entities.SellRequest],
    migrations: ['db/migration/*.js'],
    insecureAuth: true,
}
