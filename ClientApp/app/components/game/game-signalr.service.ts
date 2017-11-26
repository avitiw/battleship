import { Inject, Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client'
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class GameSignalRService{
    private chatMessageHub : HubConnection;

    private messageObservable : ReplaySubject<string>;

    public sendMessageEvent = () => this.messageObservable.asObservable();

    constructor(@Inject('BASE_URL') private baseUrl :string){
        console.log(baseUrl);

        let url = baseUrl + 'chat';

        this.chatMessageHub = new HubConnection(url);
        this.messageObservable = new ReplaySubject<string>();
    }
    public startConnection(): void {
        if (typeof window !== 'undefined') {
            this.start();
        }
    }
    public sendMessage(msg :string) {
        this.chatMessageHub.invoke('Send', msg);
    }
    private start(){
        this.chatMessageHub.start().then(
            () =>{
                console.log('SignalR connection was established.');
                this.chatMessageHub.on('Send',
            data=>{
                this.messageObservable.next(data);
            });
            this.sendMessage('test');
            }
        );
        
    }
}