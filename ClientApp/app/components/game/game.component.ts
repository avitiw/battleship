import { Component,Inject, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BoardService } from './board.service';
import { GameSignalRService } from './game-signalr.service';
import { Board,Tile } from './board' ;
 
const NUM_PLAYERS = 2;
const BOARD_SIZE = 6;

@Component({
  selector: 'battleshipgame',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [
    BoardService,
    GameSignalRService
  ]
})

export class GameComponent {  
  canPlay: boolean = true;
  player: number = 0;
  players: number = 0;   
  gameId: string; 
  playerId :string;
  
  constructor(  
    private toastr: ToastsManager,   
    private _vcr: ViewContainerRef,
    private boardService: BoardService,
    private signalRService : GameSignalRService
  ) {
    this.toastr.setRootViewContainerRef(_vcr);
    this.createBoards();
    this.init(); 
    this.listenForChanges(); 
    
  }
  
  init()  {         
    this.gameId = this.getUniqueId();
    this.playerId = this.getUniqueUserId();
    this.canPlay = false;
  }

  listenForChanges() : void {

    this.signalRService.startConnection();

    this.signalRService.clientFireEvent().subscribe(obj =>{
      console.log('recieved clientfire');
      console.log(obj);
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.player].player.score = obj.score;
    });     

    this.signalRService.gameUserEvent().subscribe(data=>{
      console.log("Recieved User Joined msg ");
      console.log(data);
      this.players = data.count;  
      this.setPlayer(data.playerId);   
    });    
  }

  setPlayer(playerID:string){    
    if(this.players ==  1){
      if(this.playerId === playerID){
        // your are the first player
        this.player = 0;
        this.canPlay = true;
        this.toastr.info("You have subscribed successfully")
      }else{
        this.player = 1;
        this.canPlay = false;
      }
    }
  }

  fireTorpedo(e:any)  {
    let id = e.target.id,
      boardId = id.substring(1,2),
      row = id.substring(2,3), col = id.substring(3,4),
      tile = this.boards[boardId].tiles[row][col];
    if (!this.checkValidHit(boardId, tile)) {
      return;
    }

    if (tile.value == 1) {
      this.toastr.success("You got this.", "HURRAAA! YOU SANK A SHIP!");
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this.toastr.info("Keep trying fam.", "OOPS! YOU MISSED THIS TIME");
      this.boards[boardId].tiles[row][col].status = 'fail'
    }
    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = "X";
     
    this.signalRService.clientfire( {
      player: this.player,
      score: this.boards[this.player].player.score,
      boardId: boardId,
      board: this.boards[boardId]
    });    
  }

  createBoards() {
    for (let i = 0; i < NUM_PLAYERS; i++)
      this.boardService.createBoard(BOARD_SIZE);    
  }

  checkValidHit(boardId: number, tile: any) : boolean {
    if (boardId == this.player) {
      this.toastr.error("Don't commit suicide.", "You can't hit your own board.")
      return false;
    }
    if (this.winner) {
      this.toastr.error("Game is over");
      return false;
    }
    if (!this.canPlay) {
      this.toastr.error("A bit too eager.", "It's not your turn to play.");
      return false;
    }
    if(tile.value == "X") {
      this.toastr.error("Don't waste your torpedos.", "You already shot here.");
      return false;
    }
    return true;
  }

  Join(key:string){    
    this.signalRService.joingame(key,this.playerId);  
  }

  getUniqueUserId () {
    return 'user-' + Math.random().toString(36).substr(2, 8);
  }
  getUniqueId () {
    return 'presence-' + Math.random().toString(36).substr(2, 8);
  }

  get boards () : Board[] {
    return this.boardService.getBoards()
  }

  get winner () : Board | undefined {
    return this.boards.find(board => board.player.score >= BOARD_SIZE);    
  }  

  get validPlayer(): boolean {
    return (this.players >= NUM_PLAYERS) && (this.player < NUM_PLAYERS);
  }
}