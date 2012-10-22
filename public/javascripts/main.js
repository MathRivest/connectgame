var CNT4 = CNT4 || {};

CNT4.infos = {
    default : {
        board : {
            columns : "7",
            rows : "6"
        }
    },
    state : {
        board : {
            columns : "",
            rows : ""
        },
        playerTurn : 1
    },
    game : {
        id : "123",
        player : "1",
        names : {
            player1 : "",
            player2 : ""
        }
    },
    messages:{
        waiting_p1 : "Waiting for an opponent",
        waiting_p2 : "Waiting for player 1",
        game_ready : "Game is ready to start!"
    }
}




$(function() {
    CNT4.ui.init();
    CNT4.connect.ui();
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



        $('#js-fullscreen').on('click', function(){
            CNT4.ui.goFullScreen('container');
            return false;
        });

        $('#js-features').on('click', function(){
            CNT4.ui.features();
            return false;
        });
        $('[data-target]').on('click', function(){
            var target = $(this).data('target'),
                el = $(this);
            CNT4.ui.openModal(target, el);
            return false;
        });

    },
    enableDrag : function(){
        $('.m-disc[data-draggable]').draggable({
            revert : 'invalid',
            revertDuration : 300,
            stack : '.container',
            drag: function(event, ui){
                // Send the coordinates through the socket
                // player currently dragging
                // piece number
                // coordinates
                var disc = {
                    nb : $(this).data('piece'),
                    player : $(this).data('player'),
                    position : ui.position,
                    release : 1
                }
                CNT4.connect.drag(disc);
            },
            stop: function(event, ui) {
                var disc = {
                    nb : $(this).data('piece'),
                    player : $(this).data('player'),
                    position : ui.position,
                    release : 0
                }
                CNT4.connect.drag(disc);
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
    updateDrag : function(player){
        /*if(CNT4.infos.game.player == 1){
            $('.m-disc[data-player="1"]').draggable('enable');
            $('.m-disc[data-player="2"]').draggable('disable');
        }else{
            $('.m-disc[data-player="2"]').draggable('enable');
            $('.m-disc[data-player="1"]').draggable('disable');
        }*/

        $('.m-disc').draggable('disable');
        if(CNT4.infos.game.player == CNT4.infos.state.playerTurn){
            $('.m-disc[data-player="'+CNT4.infos.game.player+'"]').draggable('enable');
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
        if(!Modernizr.websockets || !Modernizr.localstorage){
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
    openModal : function(target, el){
        if(el){
            if(el.is('[data-closable]')){
                var modalConfig = {keyboard: true};
            }
        }else{
            var modalConfig = {backdrop:'static', keyboard: false};
        }
        if($('.modal:visible').length>0){
            var currentModal = $('.modal:visible').attr('id');
            var hidemodal = $("#" + currentModal).modal('hide').on('hidden', function(){
                $(target).modal(modalConfig);
            });
        }else{
            $(target).modal(modalConfig);
        }
    },
    animateCSS : function(obj, animation){
        obj.addClass("animated " + animation);
        var wait = window.setTimeout( function(){
            obj.removeClass(animation);
        }, 1300);
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

        CNT4.infos.state.board.columns = columnsNb; // Update the game state with the new values
        CNT4.infos.state.board.rows = rowsNb; // Update the game state with the new values
        CNT4.infos.state.board.map = game; // Update the game state with the game array representation

        this.$boardContainer.html(board).prepend(zones); // Add the HTML to the game
        boardWidth = this.$boardContainer.find('ul.' + columnClass + '').width() * columnsNb; // Calculate the width of the board
        this.$boardContainer.width(boardWidth).fadeIn(200); // Assign the width to the board and fade it in
        $(".m-player-zone h2").addClass("in");
        /* Enable everything for the UI here*/
        CNT4.ui.enableDrag();
        CNT4.ui.updateDrag(1);
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

        console.log(y);
        if(y == 0){
            $('[data-zone="'+x+'"]').droppable('disable');
        }
//Send the map
//the move infos
//the player
        //console.log(piece);
        var moveInfos = {
            board : CNT4.infos.state.board.map,
            coordinates : {
                x : x,
                y : y
            },
            player : player,
            disc : {
                    nb : piece.data('piece'),
                    player : piece.data('player'),
                }
            }

        if(player == CNT4.infos.game.player){
            CNT4.connect.drop(moveInfos);
        }

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

            if(player == CNT4.infos.game.player){
                CNT4.connect.gameOver(player);
            }
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

        //console.log(diago);

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
        CNT4.ui.updateDrag(player);
        //console.log(player);
        //console.log(CNT4.infos.state.playerTurn);
    }
}

var socket = io.connect('/');
CNT4.connect = {

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
    ui: function(){

        /*First connection*/


        socket.on('reconnecting', function () {
            console.log('Attempting to re-connect to the server');
        });
        socket.on('received', function (msg) {
            console.log('Attempting to re-connect to the server');
        });

        /*Step 1*/


        if(localStorage.getItem('username')) {
           $('#js-field-name').val(localStorage.getItem('username'));
        }

        $('#js-field-name').keypress(function() {
            if ( event.which == 13 ) {
               event.preventDefault();
               $('#js-step-1').trigger('click');
            }
        });

        $('#js-step-1').on('click', function(){
            var fname = $("#js-field-name").val();
            if(fname == ""){
                $("#js-field-name").trigger("focus");
            }else{
                socket.emit('username', fname);
                localStorage.setItem('username', fname);
            }
        });

        var playerNb = 1;
        socket.on('gameJoined', function (data) {
            playerNb = data.pnum;
            if(2 === playerNb){
                // Add names when player 2 joins, 2 names are already available
                $("#js-username-2, [data-player=2] h2").text(data.players[playerNb-1]).parents('.m-player').addClass('s-ready');
                $("#js-username-1, [data-player=1] h2").text(data.players[playerNb-2]).parents('.m-player').addClass('s-ready');
                $("#js-waiting-title").text(CNT4.infos.messages.waiting_p2);
                CNT4.infos.game.names.player2 = data.players[playerNb-1];
                CNT4.infos.game.names.player1 = data.players[playerNb-2];
                // Hide controls for player 2
                $('#modal-waiting .js-fields-board-size, #js-step-2').hide();
            }else if(1 === data.pnum){
                // Add name for player one only
                $("#js-username-1, [data-player=1] h2").text(data.players[playerNb-1]).parents('.m-player').addClass('s-ready');
                $("#js-waiting-title").text(CNT4.infos.messages.waiting_p1);
                CNT4.infos.game.names.player1 = data.players[playerNb-1];
            }

            // Update global infos
            CNT4.infos.game.id = data.game;
            CNT4.infos.game.player = data.pnum;

            // Fire up the waiting page
            CNT4.ui.openModal("#modal-waiting");
        });


        /*Step 2*/
        $("#js-step-2").on('click', function(){
            if(!$(this).hasClass('l-disabled')){
                var board = {
                    cols: $('#js-field-columns').val(),
                    rows: $('#js-field-rows').val()
                }
                socket.emit('gameStarts', board, CNT4.infos.game.id);

            }
            return false;
        });

        socket.on('gameReady', function (data) {
            //console.log(data);
            // Add name and effects for player 1 only
            if(1 == CNT4.infos.game.player){
                $("#js-username-2, [data-player=2] h2").text(data.players[1]).parents('.m-player').addClass('s-ready');
                CNT4.ui.animateCSS($("#js-username-2").parents('.m-player'), "tada");

                $('#js-step-2').removeClass('l-grey l-disabled');

                var wait = window.setInterval( function(){
                    CNT4.ui.animateCSS($('#js-step-2'), "bounce");
                }, 6000);
                $("#js-waiting-title").fadeOut(200, function(){
                    $(this).text(CNT4.infos.messages.game_ready).fadeIn(200);
                });
            }else{
                 $("#js-waiting-title").text(CNT4.infos.messages.waiting_p2);
            }
            CNT4.infos.game.names.player2 = data.players[1];
        });

        socket.on('gameStarts', function (data) {
            $('#modal-waiting').modal('hide');
            CNT4.board.create(data.cols, data.rows);
        });

        socket.on('receivePos', function (data) {
            //console.log(data);
            $piece = $('[data-player='+data.player+'][data-piece='+data.nb+']');
            if(data.release == 1){
                $piece.css({
                    'position' : 'relative',
                    'top': data.position.top,
                    'left': data.position.left
                });
            }else{
                $piece.css({
                    'position' : 'relative',
                    'top': "0",
                    'left': "0"
                });
            }
        });

        socket.on('receiveMove', function (data) {
            var $piece = $('[data-player='+data.disc.player+'][data-piece='+data.disc.nb+']'),
                elem = $('[data-zone='+data.coordinates.y+']');
            CNT4.game.doMove(elem, data.coordinates.x, data.disc.player, $piece);
        });

        socket.on('gameOver', function (winner) {
            console.log("receiving gameOver")
            if(2 == winner.number){
                $('#modal-winner .m-player').addClass("l-second")
            }
            $('#modal-winner #js-winner-name').text(winner.username);
            CNT4.ui.openModal("#modal-winner");
            CNT4.connect.updateBoard(winner.number);
        });

        socket.on('updateBoard', function(data){
            var winnerClass = 's-winner';
            if(2 == data.winnerNb){
                var winnerRow = '<tr><td class="player1">'+data.loser+'</td><td class="player2 '+winnerClass+'">'+data.winner+'</td></tr>';
            }else{
                var winnerRow = '<tr><td class="player1 '+winnerClass+'">'+data.winner+'</td><td class="player2">'+data.loser+'</td></tr>';
            }
            var $boardBody = $('#modal-topscore #js-winner-board tbody');
           $boardBody.prepend(winnerRow).find('tr:first').addClass('s-newrow');
            if($boardBody.find('tr').length > 10){
                $boardBody.find('tr:last').hide();
            }
        });


    },
    drag : function(data){
        socket.emit('sendPos', data, CNT4.infos.game.id);
    },
    drop : function(data){
        socket.emit('sendMove', data, CNT4.infos.game.id);
    },
    gameOver : function(player){
        console.log("sending gameOver")
        var username = (player == 1) ? CNT4.infos.game.names.player1 : CNT4.infos.game.names.player2;
        var winner = {
            number : player,
            username : username
        }
        socket.emit('gameOver', winner, CNT4.infos.game.id);
    },
    updateBoard : function(player){
        console.log(player);
        var winner = (player == 1) ? CNT4.infos.game.names.player1 : CNT4.infos.game.names.player2,
            loser = (winner == CNT4.infos.game.names.player1) ? CNT4.infos.game.names.player2: CNT4.infos.game.names.player1,
            newLeader = {
                winnerNb : player,
                winner : winner,
                loser : loser
            }
        socket.emit('updateBoard', newLeader);
    }




}






