using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading; 
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.AspNetCore.Sockets;
namespace battleship
{
    public class Program
    {
        public static void Main(string[] args)
        {            
           // Task.Run(Run);
            BuildWebHost(args).Run();            
             
        }
        static async Task Run(){
            Console.WriteLine("Setting up SignalR connection");
            var connection = new HubConnectionBuilder()
                .WithUrl("http://localhost:5000/chat")
                .WithConsoleLogger()
                .Build();

            connection.On<string>("Send", data =>
            {
                Console.WriteLine($"Received: {data}");
            });

            await connection.StartAsync();

            await connection.InvokeAsync("Send", "Hello");
        }
        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}
