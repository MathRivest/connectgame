


// Check if there is a winner
// Work with Arnaud for real time stuff
// 



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
        CNT4.board.create(6,6);
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
            drop : function(event, ui){ // When the user drop the piece
                $(this).addClass('s-dropped'); // Add do something to the drop zone

                var x = $(this).data('zone'),
                    elem = $(this);

                ui.draggable.fadeOut(200, function(){
                    player = $(this).parent(".m-player-zone").data('player');
                    $(this).remove();
                    CNT4.game.doMove(elem, x, player);
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
            totalMoves = columnsNb * rowsNb
            playerMoves = totalMoves/2,
            player = 0,
            pieces = '';

        /* Building the board HTML */
        for (i=0; i<columnsNb; i++){
            zones += '<li class="m-zone" data-zone="' + i + '"></li>';
            board += '<ul class="' + columnClass + '" data-col="' + i + '">';
            game[i] = new Array(rowsNb);
            for (j=0; j<rowsNb; j++){
                board+= '<li class="' + rowClass + '" data-row="' + j + '">0</li>';
                game[i][j] = 0;
            }
            board += '</ul>';
        }
        zones += '</ul>';

        $(".m-player-zone").each(function(){ // For each player zone, add a piece that is draggable
            player ++;
            pieces = '';
            for (x=0; x<playerMoves; x++){
                pieces += '<div class="m-disc" data-draggable="true" data-player="' + player + '" data-piece="' + x + '">Drag</div>';
            }
            $(this).append(pieces);
        });

        CNT4.infos.state.board.columns = columns; // Update the game state with the new values
        CNT4.infos.state.board.rows = rows; // Update the game state with the new values
        CNT4.infos.state.board.map = game; // Update the game state with the game array representation

        this.$boardContainer.html(board).prepend(zones); // Add the HTML to the game
        boardWidth = this.$boardContainer.find('ul.' + columnClass + '').width() * columnsNb; // Calculate the width of the board
        this.$boardContainer.width(boardWidth).fadeIn(200); // Assign the width to the board and fade it in

        /* Enable everything for the UI here*/
        CNT4.ui.enableDrag();
        CNT4.ui.enableDrop();
    },
    getLastAvailRow : function(elem, x){
        var lastAvailRow = elem.parents('#game').find('[data-col="' + x + '"] [data-row]').not('[data-played-by]').filter(':last').data('row'); // Select the column and then the last row that was not played and get the number
        return lastAvailRow;
    },
    setLastRow : function(elem, x, player){
        var lastAvailRow = elem.parents('#game').find('[data-col="' + x + '"] [data-row]').not('[data-played-by]').filter(':last');
        lastAvailRow.attr('data-played-by', player).text(player);
    }
}

CNT4.game = {
    doMove : function(elem, x, player){
        var y = CNT4.board.getLastAvailRow(elem, x); // Get last row available to do the move
        CNT4.board.setLastRow(elem, x, player); // Set the last available row as played
        CNT4.infos.state.board.map[x][y] = player; // Update the game state
        this.check(CNT4.infos.state.board.map, x, y, player);
    },
    check : function(board, lastX, lastY, player){
        if(this.isWinnerVertical({x: lastX, y:lastY}, board, player)){
            alert(player + "wins vertical")
        }
        if(this.isWinnerHorizontal({x: lastX, y:lastY}, board, player)){
            alert(player + "wins horizontal")
        }
    },
    isWinnerVertical : function(lastPiece, board, player) {
        var count = 0;

        // Top Bottom
        $.each(board[lastPiece.x], function(i, l){
            if(l === player){
                count++;
            }
        });

        if(count>=4){
            return true;
        }
        return false;
    },
    isWinnerHorizontal: function(lastPiece, board, player){
        var count = 0;
        $.each(board, function(i, l){
            if(l[lastPiece.y] === player){
                count++;
            }
        });
        if(count>=4){
            return true;
        }
        console.log(count)
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