import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { TEN } from './../../common/constants/constants';
import { Application } from './app';
import { DatabaseService } from './services/database-services/database-service/database.service';
import { SocketManager } from './services/socket-manager/socket-manager.service';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');

    private static readonly baseDix: number = TEN;
    socketManger: SocketManager;
    private server: http.Server;
    constructor(private readonly application: Application, private dataBaseService: DatabaseService) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init(): Promise<void> {
        this.application.app.set('port', Server.appPort);
        this.server = http.createServer(this.application.app);

        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
        try {
            await this.dataBaseService.start();
        } catch (err) {
            throw new Error('Database failed to start' + err);
        }
        this.socketManger = new SocketManager(this.server, this.dataBaseService);
        this.socketManger.handleSockets();
        this.server.listen(Server.appPort);
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
