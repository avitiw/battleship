using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Battleship.Model;

namespace Battleship{
    
    public class GameMessgeHub : Hub
    {
        public Task clientfire(ClientFireMessage msg){
            return Clients.All.InvokeAsync("clientfire",msg);
        }
        public Task JoinGame(string gameKey)
        {
            return Groups.AddAsync(Context.ConnectionId, gameKey);
        }   

        public Task LeaveGame(string groupName)
        {
            return Groups.RemoveAsync(Context.ConnectionId, groupName);
        }
        
    }
}