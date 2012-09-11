
var CNT4 = CNT4 || {};

CNT4.infos = {
    default : {
        board : {
            columns: "5",
            rows: "5"
        }
    },
    state : {
        board : {
            columns: "",
            rows: ""
        }
    },
    game : {
        id : "123",
        player : "1"
    }

}




$(function() {
    CNT4.ui.init();
});


CNT4.ui = {
    //CNT4.connect();
    init : function(){
        //$('#modal-new-game').modal({backdrop:'static'});
        $('#js-generate-board').on('click', function(){
            CNT4.board.create(5,6);
        });
        CNT4.board.create(7,6);
    },
    enableDrag : function(){
        $('.m-disc[data-draggable="true"]').draggable({
            revert : 'invalid',
            revertDuration : 300,
            stack : '.container',
            drag: function(event, ui){
                $("#x").text(ui.position.top);
                $("#y").text(ui.position.left);
            }
        });
    },
    enableDrop : function(){
        $('.m-zone').droppable({
            accept : '.m-disc[data-draggable="true"]',
            activeClass : "s-active",
            hoverClass : "s-hover",
            drop : function(event, ui){
                $(this).addClass('s-dropped');

                var x = $(this).data('zone'),
                    y = CNT4.board.getLastRow($(this), x);

                ui.draggable.fadeOut(200, function(){
                    player = $(this).parent(".m-player-zone").data('player');
                    $(this).remove();
                    CNT4.game.doMove(x, y, player);
                });
            }
        });
    }
}

CNT4.board = {
    $boardContainer : $('#game'),
    create : function(columns, rows){
        var columnsNb = columns, 
            columnClass = 'm-column',
            rowsNb = rows,
            rowClass = 'm-row'
            board = '',
            zones = '<ul class="m-zones">',
            zonesClass = 'm-zones',
            zoneClass = 'm-zone',
            game = new Array(columnsNb),
            totalMoves = columnsNb * rowsNb,
            pieces = '';

        /* Building the board HTML */
        for (i=0; i<columnsNb; i++){
            zones += '<li class="m-zone" data-zone="'+i+'"></li>';
            board += '<ul class="'+columnClass+'" data-col="'+i+'">';
            game[i] = new Array(rowsNb);
            for (j=0; j<rowsNb; j++){
                board+= '<li class="'+rowClass+'" data-row="'+j+'">0</li>';
                game[i][j] = 0;
            }
            board += '</ul>';
        }
        zones += '</ul>';

        $(".m-player-zone").each(function(){
            for (x=0; x<totalMoves; x++){
                pieces += '<div class="m-disc" data-draggable="true">Drag</div>';
            }
            $(this).append(pieces);
        });

        CNT4.infos.state.board.columns = columns; // Update the game state with the new values
        CNT4.infos.state.board.rows = rows; // Update the game state with the new values
        CNT4.infos.state.board.map = game; // Update the game state with the game array representation

        this.$boardContainer.html(board).prepend(zones); // Add the HTML to the game
        boardWidth = this.$boardContainer.find('ul.'+columnClass+'').width() * columnsNb; // Calculate the width of the board
        this.$boardContainer.width(boardWidth).fadeIn(200); // Assign the width to the board and fade it in

        /* Enable everything for the UI here*/
        CNT4.ui.enableDrag();
        CNT4.ui.enableDrop();

        console.log(CNT4);
    },
    getLastRow : function(elem, x){
        var lastRow = elem.parents('#game').find('[data-col="'+x+'"] [data-row]').not('[data-played]').filter(':last').data('row');
        return lastRow;
    }
}

CNT4.game = {
    doMove : function(x, y, player){
        console.log(x);
        console.log(y);
        console.log(player);

        //console.log(this.check());
    },
    check : function(){
        if(this.isValidVertical()){
            return true;
        }else{
            return false;
        }
    },
    isValidVertical: function(){
        return true;
    }
}


CNT4.connect = function(){

    alert("We are trying to connect!")
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