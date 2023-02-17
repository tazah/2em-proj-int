import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DrawService } from '@app/services/draw-service/draw.service';
import { ChoseVirtualPlayerModePageComponent } from './chose-virtual-player-mode-page.component';

describe('ChoseVirtualPlayerModePageComponent', () => {
    let component: ChoseVirtualPlayerModePageComponent;
    let fixture: ComponentFixture<ChoseVirtualPlayerModePageComponent>;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChoseVirtualPlayerModePageComponent],
            providers: [DrawService, { provide: Router, useValue: routerMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChoseVirtualPlayerModePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call switchToSoloMode()', () => {
        spyOn(component.roomService, 'switchToSoloMode');
        component.switchToSoloMode();
        expect(component.roomService.switchToSoloMode).toHaveBeenCalled();
    });
});
