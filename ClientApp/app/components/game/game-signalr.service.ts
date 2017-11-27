import { Inject, Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client'
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class GameSignalRService{
    private gameMessageHub : HubConnection;

    private clientFireObservable : ReplaySubject<any>;
    private gameUsersObservable : ReplaySubject<any>;
    private gameSubscriptionObservable :ReplaySubject<any>;

    public gameUserEvent = () => this.gameUsersObservable.asObservable();
    public clientFireEvent = () => this.clientFireObservable.asObservable();
    public gameSubscriptionEvent = () => this.gameSubscriptionObservable.asObservable();

    constructor(@Inject('BASE_URL') private baseUrl :string){
        console.log(baseUrl);

        let url = baseUrl + 'gamepush';

        this.gameMessageHub = new HubConnection(url);
        this.clientFireObservable = new ReplaySubject<any>();
        this.gameUsersObservable = new ReplaySubject<any>();
        this.gameSubscriptionObservable = new ReplaySubject<any>();
    }
    public startConnection(): void {
        if (typeof window !== 'undefined') {
            this.start();
        }
    }
    public clientfire(msg:any):void{
        this.gameMessageHub.invoke('clientfire',msg);
    }
    public joingame(key:string,playerId:string):void{
        this.gameMessageHub.invoke('joinGame',key,playerId);
    }
    
    private start(){
        this.gameMessageHub.start().then(
            () =>{
                console.log('SignalR connection was established.');
                this.gameMessageHub.on('clientfire',
                    data=>{
                        this.clientFireObservable.next(data);
                });
                this.gameMessageHub.on('userJoined',(key:string,count:number,playerId:string)=>{
                    console.log(key + " " + count);
                    var msg:any = {};
                    msg.key = key;
                    msg.count = count;
                    msg.playerId = playerId;
                    this.gameUsersObservable.next(msg);
                });
                this.gameMessageHub.on('game-subscription',data=>{
                    this.gameSubscriptionObservable.next(data);
                });
            }
        );
        
    }
    
}