/* eslint-disable */

import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { DrawService } from '@app/services/draw-service/draw.service';
import { LocalGameHandlerService } from '@app/services/local-game-handler/local-game-handler.service';
import { GameModeType } from '@common/parameters/parameters';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let localGame: LocalGameHandlerService;
    let fixture: ComponentFixture<MainPageComponent>;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule, BrowserAnimationsModule],
            declarations: [MainPageComponent],
            providers: [DrawService, MatDialogModule, BrowserAnimationsModule, { provide: Router, useValue: routerMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        localGame = TestBed.inject(LocalGameHandlerService);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('jeu');
    });

    it('should open dialog', () => {
        component.openDialog();
        expect(component.dialog.open).toHaveBeenCalled;
    });

    it('should set the mode to log2990 on call of setGameModeType() mode log2990', () => {
        component.setGameModeType(1);
        expect(localGame.initialParameters.mode).toBe(GameModeType.log2990);
    });

    it('should set the mode to classic on call of setGameModeType() mode classic', () => {
        component.setGameModeType(0);
        expect(localGame.initialParameters.mode).toBe(GameModeType.classic);
    });
});
