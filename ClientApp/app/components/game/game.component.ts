import { Component,Inject, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BoardService } from './board.service'
import { GameSignalRService } from './game-signalr.service'
import { Board,Tile } from './board'
import { DOCUMENT } from '@angular/platform-browser';

declare const Pusher: any;
const NUM_PLAYERS = 2;
const BOARD_SIZE = 6;

@Component({
  selector: 'game-root',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [BoardService,GameSignalRService]
})

export class GameComponent {
  pusherChannel: any;
  canPlay: boolean = true;
  player: number = 0;
  players: number = 0;
   
  gameId: string; 
  
  constructor( 
    private toastr: ToastsManager,
    private _vcr: ViewContainerRef,
    private boardService: BoardService,
    private signalRService : GameSignalRService
  ) {
    this.toastr.setRootViewContainerRef(_vcr);
    this.createBoards();
    this.initPusher(); 
    //this.listenForChanges(); 
  }
  
  initPusher() : GameComponent {
    // findOrCreate unique channel ID
    let id = undefined;//this.getQueryParam('id');
    if (!id) {
      id = this.getUniqueId();
      //window.location.search = window.location.search ? '&id=' + id : 'id=' + id;
    }
    this.gameId = id;
    this.signalRService.startConnection();
    /*
    // init pusher
    // const pusher = new Pusher('APP_KEY', {
    //   authEndpoint: '/pusher/auth',
    //   cluster: 'eu'
    // });
    // bind to relevant channels
    // this.pusherChannel = pusher.subscribe(id);
    // this.pusherChannel.bind('pusher:member_added', member => { this.players++ })
    // this.pusherChannel.bind('pusher:subscription_succeeded', members => {
    //   this.players = members.count;
    //   this.setPlayer(this.players);
    //   this.toastr.success("Success", 'Connected!');
    // })
    // this.pusherChannel.bind('pusher:member_removed', member => { this.players-- });
    */
    return this;
  }

  listenForChanges() : GameComponent {
    this.pusherChannel.bind('clientfire', (obj:any) => {
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.player].player.score = obj.score;
    });
    return this;
  }

  setPlayer(players:number = 0) : GameComponent {
    this.player = players - 1;
    if (players == 1) {
      this.canPlay = true;
    } else if (players == 2) {
      this.canPlay = false;
    }
    return this;
  }

  fireTorpedo(e:any) : GameComponent|undefined {
    let id = e.target.id,
      boardId = id.substring(1,2),
      row = id.substring(2,3), col = id.substring(3,4),
      tile = this.boards[boardId].tiles[row][col];
    if (!this.checkValidHit(boardId, tile)) {
      return undefined;
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
    this.pusherChannel.trigger('client-fire', {
      player: this.player,
      score: this.boards[this.player].player.score,
      boardId: boardId,
      board: this.boards[boardId]
    });
    return this;
  }

  createBoards() : GameComponent {
    for (let i = 0; i < NUM_PLAYERS; i++)
      this.boardService.createBoard(BOARD_SIZE);
    return this;
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

  getQueryParam(name:string) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
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
  Join(key:string){
    alert("Joining game " + key);
  }
  get validPlayer(): boolean {
    return (this.players >= NUM_PLAYERS) && (this.player < NUM_PLAYERS);
  }
}