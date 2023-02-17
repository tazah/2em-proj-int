import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { FirstFiveBestScores } from '@common/best-score/best-score';

@Component({
    selector: 'app-best-scores-page',
    templateUrl: './best-scores-page.component.html',
    styleUrls: ['./best-scores-page.component.scss'],
})
export class BestScoresPageComponent implements OnInit {
    displayedColumnsPlayerTable: string[];
    topFiveBestScoresLog: FirstFiveBestScores[];
    topFiveBestScoresClassic: FirstFiveBestScores[];
    constructor(public dialog: MatDialog, private communicationService: CommunicationService) {
        this.displayedColumnsPlayerTable = ['score', 'name'];
        this.topFiveBestScoresLog = [];
        this.topFiveBestScoresClassic = [];
    }

    ngOnInit() {
        this.communicationService.logBestScoresGet().subscribe((resultsLog) => (this.topFiveBestScoresLog = resultsLog));

        this.communicationService.classicBestScoresGet().subscribe((resultsClassic) => (this.topFiveBestScoresClassic = resultsClassic));
    }
}
