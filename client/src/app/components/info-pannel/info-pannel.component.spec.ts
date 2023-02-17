import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DrawService } from '@app/services/draw-service/draw.service';
import { RoomService } from '@app/services/room-service/room.service';
import { InfoPannelComponent } from './info-pannel.component';

describe('InfoPannelComponent', () => {
    let component: InfoPannelComponent;
    let fixture: ComponentFixture<InfoPannelComponent>;
    let roomService: RoomService;
    const routerMock = {
        navigateByUrl: () => {
            return;
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoPannelComponent],
            providers: [RoomService, DrawService, { provide: Router, useValue: routerMock }],
        }).compileComponents();
        roomService = TestBed.inject(RoomService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfoPannelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize', () => {
        spyOn(roomService, 'updateTimer');
        component.ngOnInit();
        expect(roomService.updateTimer).toHaveBeenCalled();
    });
});
