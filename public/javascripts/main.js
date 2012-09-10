
var CNT4 = CNT4 || {};

CNT4.settings = {
    board: {
        columns: "5",
        rows: "5"
    }
}




$(function() {
    CNT4.ui.init();
    CNT4.ui.enableDrag();
});


CNT4.ui = {
    //CNT4.connect();
    init : function(){
        //$('#modal-new-game').modal({backdrop:'static'});
        $('#js-generate-board').on('click', function(){
            CNT4.board.create(5,6);
        });
        CNT4.board.create(5,6);
    },
    enableDrag : function(){
        $('.m-disc[data-draggable="true"]').draggable();
    }
}

CNT4.board = {
    $boardContainer : $('#game'),
    create : function(columns, rows){
 
        CNT4.settings.board.columns = columns; //update the settings with the new values
        CNT4.settings.board.rows = rows; //update the settings with the new values

        var columnsNb = columns,
            rowsNb = rows,
            board = '',
            zones = '';

        zones = '<ul class="zones">';
        for (i=0; i<columnsNb; i++){
            zones += '<li class="zone" data-zone="'+i+'"></li>';
            board += '<ul class="column" data-col="'+i+'"">';
            for (j=0; j<rowsNb; j++){
                board+= '<li class="row" data-row="'+j+'"></li>';
            }
            board += '</ul>';
        }
        zones += '</ul>';

        this.$boardContainer.html(board).prepend(zones);
        boardWidth = this.$boardContainer.find("ul.column").width() * columnsNb;
        this.$boardContainer.width(boardWidth).fadeIn(200)
    }
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