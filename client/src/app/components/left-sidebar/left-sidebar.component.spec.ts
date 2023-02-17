import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LeftSidebarComponent } from '@app/components/left-sidebar/left-sidebar.component';
import { DrawService } from '@app/services/draw-service/draw.service';

describe('LeftSidebarComponent', () => {
    let component: LeftSidebarComponent;
    let fixture: ComponentFixture<LeftSidebarComponent>;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LeftSidebarComponent],
            providers: [DrawService, { provide: Router, useValue: routerMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LeftSidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call abandonGame', () => {
        spyOn(component.roomService, 'abandonGame');
        component.abandonGame();
        expect(component.roomService.abandonGame).toHaveBeenCalled();
    });

    it('should not call abandonGame while openDialog if confirm == false', () => {
        spyOn(component, 'abandonGame');
        spyOn(window, 'confirm').and.returnValue(false);
        component.openDialog();
        expect(component.abandonGame).not.toHaveBeenCalled();
    });

    it('should call abandonGame while openDialog if confirm == true', () => {
        spyOn(component, 'abandonGame');
        spyOn(window, 'confirm').and.returnValue(true);
        component.openDialog();
        expect(component.abandonGame).toHaveBeenCalled();
    });
});
