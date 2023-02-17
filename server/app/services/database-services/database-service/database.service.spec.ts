/*eslint-disable */
import { fail } from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
// import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';
const DATABASE_URL = 'mongodb+srv://Samia:Safaa@cluster0.ssnkw.mongodb.net/Projet2?retryWrites=true&w=majority';
const DATABASE_NAME = 'Projet2';
chai.use(chaiAsPromised); // this allows us to test for rejection
chai.use(spies);
describe('Database service', () => {
    let databaseService: DatabaseService;
    // let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();

        // Start a local test server
        // mongoServer = new MongoMemoryServer();
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    // NB : We dont test the case when DATABASE_URL is used in order to not connect to the real database
    it('should connect to the database when start is called', async () => {
        // Reconnect to local server
        // const mongoUri = await mongoServer.getUri();
        await databaseService.start(DATABASE_URL);
        expect(databaseService['db'].databaseName).to.equal(DATABASE_NAME);
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        // Try to reconnect to local server
        try {
            await databaseService.start('WRONG URL');
            fail();
        } catch {
            expect(databaseService['client']).to.be.undefined;
        }
    });

    it('should return dataBaseService.db', () => {
        expect(databaseService.database).to.equal(databaseService['db']);
    });
});
