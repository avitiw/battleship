using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Internal;
using Battleship.Model;
using System.Linq;
using System.Collections.Generic;

namespace Battleship{
    
    public class GameMessgeHub : Hub
    {
        private static Dictionary<string,int> gameUsers = new Dictionary<string, int>();
       
        public Task clientfire(ClientFireMessage msg){
            return Clients.AllExcept(new string[]{ Context.ConnectionId}).InvokeAsync("clientfire",msg);
            //return Clients.All.InvokeAsync("clientfire",msg);
        }
                 
        public Task joinGame(string gameKey,string playerId)
        {
            if(!gameUsers.ContainsKey(gameKey))
                gameUsers[gameKey] = 0;
            var count = gameUsers[gameKey];
            count++;
            gameUsers[gameKey] = count;
            return Clients.All.InvokeAsync("userJoined",gameKey,count,playerId);
        }    
        
    } 
}