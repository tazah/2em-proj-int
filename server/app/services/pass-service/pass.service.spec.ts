import { expect } from 'chai';
import { Container } from 'typedi';
import { CommandStatus } from './../../../../common/constants/constants';
import { PassService } from './pass.service';

describe('PassService', () => {
    let service: PassService;
    let passParameters: string[];
    let checkValidParameter: CommandStatus;

    beforeEach(() => {
        service = Container.get(PassService);
    });

    it('should be created', () => {
        expect(service).to.be.instanceOf(PassService);
    });

    it('should return command invalide case command is invalid', () => {
        passParameters = ['!passser'];
        service.executeCommand(passParameters);
        expect(service.commandOutput).to.be.equal('Commande invalide');
    });

    it('should return true if pass parameter is valide', () => {
        passParameters = ['!passer'];
        checkValidParameter = service.isPassParametersValid(passParameters);
        expect(checkValidParameter).to.be.equal(CommandStatus.SUCCESS_PASS_COMMAND);
    });
});
