namespace Battleship.Model{

    public class ClientFireMessage{
        public int player{get;set;}
        public int score {get;set;}
        public string boardId {get;set;}
        public Board board{get;set;}
    }
}