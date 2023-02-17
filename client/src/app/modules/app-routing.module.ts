import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminModePageComponent } from '@app/pages/admin-mode-page/admin-mode-page.component';
import { ChoseVirtualPlayerModePageComponent } from '@app/pages/chose-virtual-player-mode-page/chose-virtual-player-mode-page.component';
import { CreateMultiplayerMatchPageComponent } from '@app/pages/create-multiplayer-match-page/create-multiplayer-match-page.component';
import { GameModePageComponent } from '@app/pages/game-mode-page/game-mode-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { JoinMultiplayerMatchPageComponent } from '@app/pages/join-multiplayer-match-page/join-multiplayer-match-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ParameterPageComponent } from '@app/pages/parameter-page/parameter-page.component';
import { SecondPlayerParametersPageComponent } from '@app/pages/second-player-parameters-page/second-player-parameters-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'modeDeJeu', component: GameModePageComponent },
    { path: 'scrabbleClassique', component: GameModePageComponent },
    { path: 'scrabble2990', component: MainPageComponent },
    { path: 'meilleursScores', component: MainPageComponent },
    { path: 'parametres', component: ParameterPageComponent },
    { path: 'confirmJoin', component: SecondPlayerParametersPageComponent },
    { path: 'creerPartieMultijoueurs', component: CreateMultiplayerMatchPageComponent },
    { path: 'choisirPartieMultijoueurs', component: JoinMultiplayerMatchPageComponent },
    { path: 'choisirDifficulteJoueurVirtuel', component: ChoseVirtualPlayerModePageComponent },
    { path: 'waitingRoom', component: WaitingRoomPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'admin', component: AdminModePageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
