import { DATABASE_NAME, DATABASE_URL } from '@app/../../common/constants/constants';
import { Db, MongoClient } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    async start(url: string = DATABASE_URL) {
        try {
            const client = new MongoClient(url);
            await client.connect();
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch (err) {
            throw new Error('Database connection error');
        }

        return this.client;
    }

    get database(): Db {
        return this.db;
    }
}
