

// Set maxed col 
// Check if there is a winner
// Work with Arnaud for real time stuff
// 



var CNT4 = CNT4 || {};

CNT4.infos = {
    default : {
        board : {
            columns: "7",
            rows: "6"
        }
    },
    state : {
        board : {
            columns: "",
            rows: ""
        },
        playerTurn : 1
    },
    game : {
        id : "123",
        player : "1"
    }

}




$(function() {
    CNT4.ui.init();
    CNT4.connect();
});


CNT4.ui = {
    //CNT4.connect();
    init : function(){
        this.support();
        //$('#modal-new-game').modal({backdrop:'static', keyboard: false});
        //$('#modal-waiting').modal({backdrop:'static'});
        //$('#modal-support').modal({backdrop:'static'});
        //$('#modal-features').modal();
        //$('#modal-winner').modal();
        //$('#modal-topscore').modal();


        //CNT4.board.create(8,8);
        //CNT4.ui.features();

        $('#js-fullscreen').on('click', function(){
            CNT4.ui.goFullScreen('container');
            return false;
        });

        $('[data-target]').on('click', function(){
            var target = $(this).data('target');
            CNT4.ui.openModal(target);
            return false;
        });


        // Adjust board size on resize
        var small = window.matchMedia("(max-width: 768px)");
        var medium = window.matchMedia("(max-width: 1280px)");


        var handleMediaChange = function (mediaQueryList) {
            resizeBoard();
        }

        var resizeBoard = function(){
            var $game = $("#game"),
                boardWidth = $game.find('ul.m-column').width() * $game.find('ul.m-column').length; 
            $game.width(boardWidth);
        }

        small.addListener(handleMediaChange);
        medium.addListener(handleMediaChange);


    },
    enableDrag : function(){
        $('.m-disc[data-draggable]').draggable({
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
            accept : '.m-disc[data-draggable]',
            activeClass : "s-active",
            hoverClass : "s-hover",
            drop : function(event, ui){ // When the user drop the piece
                $(this).addClass('s-dropped'); // Add do something to the drop zone

                var x = $(this).data('zone'),
                    $zone = $(this);

                ui.draggable.fadeOut(200, function(){
                    var $piece = $(this),
                        player = $piece.parent(".m-player-zone").data('player');
                    //$(this).remove();
                    CNT4.game.doMove($zone, x, player, $piece);
                });
            }
        });
    },
    updateDrag : function(){
        var playerTurn = CNT4.game.getCurrentTurn();
        if(playerTurn === 1){
            $('.m-disc[data-player="1"]').draggable('enable');
            $('.m-disc[data-player="2"]').draggable('disable');
        }else{
            $('.m-disc[data-player="2"]').draggable('enable');
            $('.m-disc[data-player="1"]').draggable('disable');
        }
    },
    goFullScreen : function(id){
        elem = document.getElementById(id);

        if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
              (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
            if (document.documentElement.requestFullScreen) {
              document.documentElement.requestFullScreen();
            } else if (document.documentElement.mozRequestFullScreen) {
              document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullScreen) {
              document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
          } else {
            if (document.cancelFullScreen) {
              document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen();
            }
          }
    },
    support : function(){
        if(!Modernizr.websockets){
            $('#modal-support').modal({backdrop:'static', keyboard: false});
        }else{
            $('#modal-new-game').modal({backdrop:'static', keyboard: false});
        }
    },
    features : function(){
        $('#modal-features').modal();

        $('#js-features-slider').flexslider({
            animation: "fade",
            animationSpeed: 300
        });
    },
    openModal : function(target){
        if($('.modal:visible').length>0){
            var currentModal = $('.modal:visible').attr('id');
            $("#" + currentModal).modal('hide').on('hidden', function(){
                $(target).modal({backdrop:'static', keyboard: false});
            });
        }else{
            $(target).modal({backdrop:'static', keyboard: false});
        }
    }
}





CNT4.board = {
    $boardContainer : $('#game'),
    create : function(columns, rows){
        if(!columns || !rows){
            var columnsNb = CNT4.infos.default.board.columns,
                rowsNb = CNT4.infos.default.board.rows;
         }else{
            var columnsNb = columns,
                rowsNb = rows;
         }

        var columnClass = 'm-column',
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
            $(this).find(".m-disc").remove();
            player ++;
            pieces = '';
            for (x=0; x<playerMoves; x++){
                pieces += '<div class="m-disc" data-draggable data-player="' + player + '" data-piece="' + x + '">&nbsp;</div>';
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
        CNT4.ui.updateDrag();
        CNT4.ui.enableDrop();
    },
    getLastAvailRow : function(elem, x){
        var lastAvailRow = elem.parents('#game').find('[data-col="' + x + '"] [data-row]').not('[data-played-by]').filter(':last').data('row'); // Select the column and then the last row that was not played and get the number
        return lastAvailRow;
    },
    setLastRow : function(elem, x, player, piece){
        var lastAvailRow = elem.parents('#game').find('[data-col="' + x + '"] [data-row]').not('[data-played-by]').filter(':last');
        lastAvailRow.attr('data-played-by', player).html(piece);
        piece.draggable('destroy').css({
            "position" : "absolute",
            "left" : 0,
            "top" : 0
        }).fadeIn();
    }
}




CNT4.game = {
    doMove : function(elem, x, player, piece){
        var y = CNT4.board.getLastAvailRow(elem, x); // Get last row available to do the move
        CNT4.board.setLastRow(elem, x, player, piece); // Set the last available row as played
        CNT4.infos.state.board.map[x][y] = player; // Update the game state
        this.check(CNT4.infos.state.board.map, x, y, player);
        this.setCurrentTurn(player);
    },
    check : function(board, lastX, lastY, player){
        var lastPiece = {x: lastX, y:lastY};

        if(this.isWinnerVertical(lastPiece, board, player)){}
        if(this.isWinnerHorizontal(lastPiece, board, player)){}

        // if(this.isWinnerDiagoNWSE(lastPiece, board, player)){
        //     alert(player + "wins Diag 1")
        // }
        // if(this.isWinnerDiagoNESW(lastPiece, board, player)){
        //     alert(player + "wins Diag 2")
        // }

        if(this.isWinnerVertical(lastPiece, board, player) || this.isWinnerHorizontal(lastPiece, board, player)){
            CNT4.ui.openModal("#modal-winner");
        }
    },
    isWinnerVertical : function(lastPiece, board, player) {
        var count = 0;
        var opPlayer = (player == 1) ? 2 : 1;

        // Top Bottom |
        $.each(board[lastPiece.x], function(i, l){
            if(l === player){
                count++;
            }else{
                count = 0;
            }
            if(count>=4){
                return false;
            }
        });
        if(count>=4){
            return true;
        }

        return false;
    },
    isWinnerHorizontal: function(lastPiece, board, player){
        var count = 0;
        var opPlayer = (player == 1) ? 2 : 1;

        // Left Right ---
        $.each(board, function(i, l){
            if(l[lastPiece.y] === player){
                count++;
            }else{
                count = 0;
            }
            if(count>=4){
                return false;
            }
        });
        if(count>=4){
            return true;
        }
        return false;
    },
    isWinnerDiagoNWSE: function(lastPiece, board, player){
        var m = board.length,
            n = board[0].length,
            a = board,
            count = 0,
            diago = new Array();

        for (var i = 1 - m; i < n; i++) {
            var arr = new Array();
            for (var j = 0; j < m; j++) {
                if ((i + j) >= 0 && (i + j) < n) {
                    arr.push(a[j][i + j]);
                }
            }
            diago.push(arr);
        }

        $.each(diago, function(i, l){
            $.each(diago[i], function(j, k){
                if(diago[i][j] === player){
                    count++;
                }else{
                    count = 0;
                }
            });
            if(count>=4){
                return false; // Break the loop
            }else{
                count = 0;
            }
        });
        if(count>=4){
            return true; // Is a Winner
        }
        return false;
    },
    isWinnerDiagoNESW : function(lastPiece, board, player){
        var m = board.length,
            n = board[0].length,
            a = board,
            count = 0,
            diago = new Array();

        for (var i = 1 - m; i < n; i++) {
            var arr = new Array(); // Create an array for each possible diagonal
            for (var j = 0; j < m; j++) {
                if ((i + j) >= 0 && (i + j) < n) {
                    arr.push(a[j][i + j]);
                }
            }
            diago.push(arr);
        }

        console.log(diago);

        $.each(diago, function(i, l){
            $.each(diago[i], function(j, k){
                if(diago[i][j] === player){
                    count++;
                }else{
                    count = 0;
                }
            });
            if(count>=4){
                return false; // Break the loop
            }else{
                count = 0;
            }
        });
        if(count>=4){
            return true; // Is a Winner
        }
        return false;
    },
    getCurrentTurn : function(){
        return CNT4.infos.state.playerTurn;
    },
    setCurrentTurn : function(player){
        if(player === 1){
            CNT4.infos.state.playerTurn = 2;
        }else if(player === 2){
            CNT4.infos.state.playerTurn = 1;
        }
        CNT4.ui.updateDrag();
    }
}


CNT4.connect = function(){

/*
    Sender:

        When the game start: 
            Trigger the start event
                Send the board infos

        When a player do a move:
            Trigger the move event
                Send the map
                     the move infos
                     the player

        When a piece is moving:
            Trigger dragging event  
                Send the x-y
                     the player currently dragging
                     the piece number

    Receiver:

        When the game start:
            Receive the start event
                Generate the board

        When a player do a move:
            Receive the move event
                Do the move

        When a piece is moving:
            Receive the dragging event
                Move the good piece


*/



    $('#js-step-1').on('click', function(){
        var fname = $("#js-field-name").val();
        if(fname == ""){
            $("#js-field-name").trigger("focus");
        }else{
            $.get('/username', {username : fname}, function(data){
                var data = 1;
                if(1 == data){
                    CNT4.ui.openModal("#modal-waiting");
                }else{
                    CNT4.ui.openModal("#modal-waiting");
                }
            });
            CNT4.ui.openModal("#modal-waiting");
            $("#js-username-1").text(fname);
        }

    });

}
