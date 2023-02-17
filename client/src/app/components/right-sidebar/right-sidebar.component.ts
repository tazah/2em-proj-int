import { Component, OnInit } from '@angular/core';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { Objective, ObjectiveType } from '@common/objective/objective';
@Component({
    selector: 'app-right-sidebar',
    templateUrl: './right-sidebar.component.html',
    styleUrls: ['./right-sidebar.component.scss'],
})
export class RightSidebarComponent implements OnInit {
    publicObjectives: Objective[];
    privateObjective: Objective;
    completedObjectives: Objective[];

    constructor(public localGameHandler: LocalGameHandlerService, public drawService: DrawService) {
        this.publicObjectives = Array<Objective>();
        this.privateObjective = {
            index: -1,
            score: 0,
            name: '',
            description: '',
            isReached: false,
            isPicked: false,
            type: ObjectiveType.Private,
        };
        this.completedObjectives = Array<Objective>();
    }

    ngOnInit() {
        this.publicObjectives = this.localGameHandler.match.publicObjectives;
    }

    getCompletedObjectives(): Objective[] {
        this.completedObjectives = this.localGameHandler.match.publicObjectives.filter((publicObjective) => publicObjective.isReached === true);
        if (this.localGameHandler.match.players[0].privateOvjective.isReached)
            this.completedObjectives.push(this.localGameHandler.match.players[0].privateOvjective);
        if (this.localGameHandler.match.players[1].privateOvjective.isReached)
            this.completedObjectives.push(this.localGameHandler.match.players[1].privateOvjective);
        return this.completedObjectives;
    }

    getPublicObjectives(): Objective[] {
        return (this.completedObjectives = this.localGameHandler.match.publicObjectives.filter(
            (publicObjective) => publicObjective.isReached === false,
        ));
    }
}
