var CNT4 = CNT4 || {};

CNT4.settings = {
    board: {
        columns: "5",
        rows: "5"
    }
}




$(function() {
    CNT4.init();
    CNT4.createBoard(5,8);
});


CNT4.init = function(){
    //CNT4.connect();
}


CNT4.createBoard = function(columns, rows){

    this.settings.board.columns = columns; //update the settings with the new values
    this.settings.board.rows = rows; //update the settings with the new values

    var columns = columns,
        rows = rows,
        board = '',
        zones = '';

    zones = '<ul class="zones">';
    for (i=0; i<columns; i++){
        zones += '<li data-zone="'+i+'">'+i+'</li>';
        board += '<ul class="column" data-col="'+i+'"">';
        console.log(board);
        for (j=0; j<rows; j++){
            board+= '<li class="row" data-row="'+j+'">'+j+'</li>';
        }
        board += '</ul>';
    }
    zones += '</ul>';
    $('#game').html(board).prepend(zones);
}

CNT4.connect = function(){

    alert("test")
    var socket = io.connect('/');
    socket.on('welcome', function (data) {
        //log the welcome message and replace the container message with it
        console.log(data);
        $("#cnt").text(data.msg);
        //bind the send button 
        $("#send").click(function(){
            var msg = $("#myfield").val();
            socket.emit('newmessage', { msg: msg });
            console.log("Sending: " + msg)
            return false;
        });
    });


    socket.on('newresponse', function(data){
        console.log("Received: " + data.msg)
        $("#cnt").prepend("<p>Server response: " + data.msg);
    });

    socket.on('connect', function(){
        $(".m-chat").addClass("s-connected");
    });

}