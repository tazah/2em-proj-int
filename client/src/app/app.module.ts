import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { LeftSidebarComponent } from '@app/components/left-sidebar/left-sidebar.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { RightSidebarComponent } from '@app/components/right-sidebar/right-sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { InfoPannelComponent } from './components/info-pannel/info-pannel.component';
import { TileComponent } from './components/tile/tile.component';
import { TrayComponent } from './components/tray/tray.component';
import { AdminModePageComponent } from './pages/admin-mode-page/admin-mode-page.component';
import { BestScoresPageComponent } from './pages/best-scores-page/best-scores-page.component';
import { ChoseVirtualPlayerModePageComponent } from './pages/chose-virtual-player-mode-page/chose-virtual-player-mode-page.component';
import { CreateMultiplayerMatchPageComponent } from './pages/create-multiplayer-match-page/create-multiplayer-match-page.component';
import { GameModePageComponent } from './pages/game-mode-page/game-mode-page.component';
import { JoinMultiplayerMatchPageComponent } from './pages/join-multiplayer-match-page/join-multiplayer-match-page.component';
import { ParameterPageComponent } from './pages/parameter-page/parameter-page.component';
import { SecondPlayerParametersPageComponent } from './pages/second-player-parameters-page/second-player-parameters-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { DrawService } from './services/draw-service/draw.service';
import { GridService } from './services/grid-service/grid.service';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */

@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        RightSidebarComponent,
        LeftSidebarComponent,
        TrayComponent,
        TileComponent,
        ChatBoxComponent,
        InfoPannelComponent,
        GameModePageComponent,
        ParameterPageComponent,
        JoinMultiplayerMatchPageComponent,
        CreateMultiplayerMatchPageComponent,
        WaitingRoomPageComponent,
        ChoseVirtualPlayerModePageComponent,
        SecondPlayerParametersPageComponent,
        AdminModePageComponent,
        BestScoresPageComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatSelectModule,
        MatFormFieldModule,
        RouterModule,
        MatTableModule,
        MatCardModule,
        MatDialogModule,
        MatGridListModule,
        MatFormFieldModule,
    ],
    providers: [DrawService, MatDialogModule, GridService],
    bootstrap: [AppComponent],
})
export class AppModule {}
