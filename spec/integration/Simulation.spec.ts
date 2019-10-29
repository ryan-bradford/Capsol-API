import request from 'supertest';
import { logger, resetDate } from '@shared';
import { expect } from 'chai';
import {
    addInvestor, addInvestment, addContract, addHomeowner,
    tickMonth, handleRequests, startApp, appInstance, cookie,
} from './IntegrationHelp';



// Get all homeowners
// Make a payment for each
// Payment only processed if contract has length left and is fulfilled


// Overall:
// Add a bunch of investors and homeowners
// Setup a bunch of contracts
// Invest a bunch of money
// Tick month (randomly skip payment and incur damages)
// Randomly add new home + add new investor

// Assumptions:
// Homes > Investments

async function simulate() {

    await startApp(0.1);

    const investmentSizeMax = 10000;
    const contractSizeMax = 10000;
    const simulationLength = 12;
    const newInvestorNumber = 2;
    const newHomeownerNumber = 5;

    const investorToInvestment: Map<string, number> = new Map();
    const investorToJoinTime: Map<string, number> = new Map();

    for (let a = 0; a < 1; a++) {
        const investorEmail = await addInvestor();
        const investment = 10000;
        await addInvestment(investorEmail, investment);
        investorToJoinTime.set(investorEmail, 0);
        investorToInvestment.set(investorEmail, investment);
    }
    for (let a = 0; a < 1; a++) {
        const homeownerEmail = await addHomeowner();
        await addContract(homeownerEmail, 10000);
        const homeownerEmail2 = await addHomeowner();
        await addContract(homeownerEmail2, 10000);
    }

    for (let i = 0; i < simulationLength; i++) {
        await handleRequests();
        await tickMonth();
        const homeownerToAdd = Math.random() * newHomeownerNumber;
        const investorToAdd = Math.random() * newInvestorNumber;
        for (let h = 0; h < homeownerToAdd; h++) {
            const newEmail = await addHomeowner();
            const contractSize = 1000 + Math.round(Math.random() * contractSizeMax);
            await addContract(newEmail, contractSize);
        }
        if (i < simulationLength / 2) {
            for (let inv = 0; inv < investorToAdd; inv++) {
                const newEmail = await addInvestor();
                const investmentSize = 1000 + Math.round(Math.random() * investmentSizeMax);
                investorToInvestment.set(newEmail, investmentSize);
                investorToJoinTime.set(newEmail, i + 1);
                await addInvestment(newEmail, investmentSize);
            }
        }
    }
    await request(appInstance).get(`/investor`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            let totalInterest = 0;
            result.body.users.map((user: any) => {
                const initInvestment = Number(investorToInvestment.get(user.email));
                let joinTime = Number(investorToJoinTime.get(user.email));
                joinTime = joinTime === simulationLength ? joinTime - 1 : joinTime;
                const portValue = user.portfolioHistory[user.portfolioHistory.length - 1].totalValue;
                const interest = Math.pow((portValue / initInvestment),
                    1 / ((simulationLength - joinTime) / 12));
                totalInterest += interest;
                return interest;
            });
            const givenInterest = totalInterest / result.body.users.length;
            logger.info(String(Math.round(givenInterest * 10000) / 10000));
            expect(Math.round(givenInterest * 10000) / 10000).to.be.greaterThan(1.029);
        });

}

describe('Simulation', function test() {
    this.timeout(500000);
    it('should run the simulation', (done) => {
        simulate().then(() => {
            done();
        });
    });
});
