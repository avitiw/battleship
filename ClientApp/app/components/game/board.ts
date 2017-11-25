import { Player } from './player'


export class Tile{
    used:boolean;
    value:any = 0;
    status:string;
}

export class Board {
  player: Player;
  tiles: Tile[][];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}