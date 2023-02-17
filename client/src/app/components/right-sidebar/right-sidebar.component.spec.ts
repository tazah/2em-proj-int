import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RightSidebarComponent } from '@app/components/right-sidebar/right-sidebar.component';
import { DrawService } from '@app/services/draw-service/draw.service';
import { Objective, ObjectiveType } from '@common/objective/objective';

describe('RightSidebarComponent', () => {
    let component: RightSidebarComponent;
    let fixture: ComponentFixture<RightSidebarComponent>;
    const privateObjective0: Objective = {
        index: 0,
        description: 'private Objective 0',
        name: 'objective 0',
        type: ObjectiveType.Private,
        isReached: false,
        score: 10,
        isPicked: true,
    };

    const privateObjective1: Objective = {
        index: 0,
        description: 'private Objective 1',
        name: 'objective 1',
        type: ObjectiveType.Private,
        isReached: false,
        score: 10,
        isPicked: true,
    };

    const publicObjective: Objective = {
        index: 0,
        description: 'public Objective ',
        name: 'objective public',
        type: ObjectiveType.Public,
        isReached: false,
        score: 10,
        isPicked: true,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RightSidebarComponent],
            providers: [DrawService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RightSidebarComponent);
        component = fixture.componentInstance;
        component.completedObjectives = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add private completed objective by palyer0 and player1', () => {
        component.localGameHandler.match.players[0].privateOvjective = privateObjective0;
        component.localGameHandler.match.players[0].privateOvjective.isReached = true;
        component.localGameHandler.match.players[1].privateOvjective = privateObjective1;
        component.localGameHandler.match.players[1].privateOvjective.isReached = true;
        component.getCompletedObjectives();
        expect(component.completedObjectives[0]).toBe(privateObjective0);
        expect(component.completedObjectives[1]).toBe(privateObjective1);
    });

    it('should return compledtedObjectives as empty', () => {
        component.localGameHandler.match.players[0].privateOvjective = privateObjective0;
        component.localGameHandler.match.players[0].privateOvjective.isReached = false;
        component.localGameHandler.match.players[1].privateOvjective = privateObjective1;
        component.localGameHandler.match.players[1].privateOvjective.isReached = false;
        component.getCompletedObjectives();
        const completedObjectivesLength: number = component.completedObjectives.length;
        expect(completedObjectivesLength).toBe(0);
    });

    it('should add public objectives in compledtedObjectives ', () => {
        component.localGameHandler.match.publicObjectives = [publicObjective];
        component.getPublicObjectives();
        const completedObjectivesLength: number = component.completedObjectives.length;
        expect(completedObjectivesLength).toBe(1);
    });
});
