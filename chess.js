 let type = "WebGL"
    if(!PIXI.utils.isWebGLSupported()){
      type = "canvas"
    }

	// Aliases:
	var TextureCache = PIXI.utils.TextureCache;
	var Point = PIXI.Point;

	//Create a Pixi Application  
	let app = new PIXI.Application({ 
	width: 1280,         // default: 800
	height: 720,        // default: 600
	antialias: true,    // default: false
	transparent: false, // default: false
	resolution: 1       // default: 1
	});

	app.renderer.backgroundColor = 0x191919;

    //Add the canvas that Pixi automatically created for you to the HTML document
    document.body.appendChild(app.view);
	
	PIXI.loader.add("sprites/pieces.png").add("sprites/knight.png").load(setup);
	
	var size = 80;
	var border = 20;
	var startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
	var pieceOrder = "KQBNRP"
	var files = "abcdefgh";
	var pieceTextures;
	var selectedSprite;
	var boardContainer;
	  
	function setup() {
		
		// Draw board
		let graphics = new PIXI.Graphics();
		boardContainer = new PIXI.Container();
		boardContainer.position.set(border);
		app.stage.addChild(boardContainer);
		
		for	(let i = 0; i <8; i ++) {
			for	(let j = 0; j < 8; j ++){
				let col = ((i+j)%2==0)?0xefdfb0:0x524435;
				graphics.beginFill(col);
				// draw a rectangle
				graphics.drawRect(i*size, j*size, size, size);
			}
		}
		boardContainer.addChild(graphics);
		
		// Pieces in order: King, Queen, Bishop, Knight, Rook, Pawn [White,Black]
		pieceTextures = new Array(6);
		for (let i = 0; i < 6; i ++){
			pieceTextures[i] = new Array(2);
		}
		
		// Draw piece
		let pieceSize = size*1;
		let spriteSize = 2000/6.0;
		
		for (let i = 0; i <= 1; i ++) {
			for (let j = 0; j < 6; j++) {
				
				let rect = new PIXI.Rectangle(spriteSize*j,spriteSize*i,spriteSize,spriteSize);
				let texture = new PIXI.Texture(TextureCache["sprites/pieces.png"],rect);
				texture.frame = rect;
				pieceTextures[j][i] = texture;
			}
		}
		
		let myFen = "r1bqkbnr/ppppp1pp/2n5/5p2/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 2 3";
		setBoardFromFen(myFen);
		
		app.ticker.add(delta => gameLoop(delta));
		
	}

	function setBoardFromFen(fen) {
		let boardLayout = fen.split(' ')[0];
		let rankLayouts = boardLayout.split('/');
		
		for	(let rankIndex = 0; rankIndex < rankLayouts.length; rankIndex ++) {
			let fileIndex = 0;
			for (let j = 0; j < rankLayouts[rankIndex].length; j ++) {
				let char = rankLayouts[rankIndex][j];
				let num = parseFloat(char);
				if (!isNaN(num) && isFinite(num)) {
					fileIndex +=Number(parseFloat(char));
				}
				else {
					//console.log("char: " + char + "(" + files[fileIndex] + "" + (8-rankIndex) + ")");
					
					let colourIndex = (char.toUpperCase() == char)?0:1; // 0 = white, 1 = black
					let pieceIndex = pieceOrder.indexOf(char.toUpperCase());
					let texture = pieceTextures[pieceIndex][colourIndex];
					let sprite = new PIXI.Sprite(texture);
					initPieceSprite(sprite, fileIndex*size+size*.5,rankIndex*size+size*.5,size);
					fileIndex+=1;
				}
				
			}
		}
	}

	function squareIndexFromPoint(Point p) {
		let x = Math.floor(clamp01(0,p.x/size*8) * 7);
		let y = Math.floor(clamp01(0,p.y/size*8) * 7);
		return new Point(x,y);
	}
	  
	function initPieceSprite(sprite, posX, posY, size){
		sprite.position.set(posX, posY);
		sprite.width = size;
		sprite.height = size;
		sprite.anchor.set(.5);

		sprite.interactive = true;
		sprite.buttonMode = true;

		sprite.on('pointerdown', () => selectedSprite = sprite);
		sprite.on('pointerup', () => selectedSprite = null);
		
		boardContainer.addChild(sprite);
	}
    
	function gameLoop(delta) {
		if (selectedSprite != null) {
			let p =app.renderer.plugins.interaction.mouse.getLocalPosition(boardContainer);
			selectedSprite.position.set(p.x,p.y);
		}
	}

	function clamp(v, min, max) {
		return Math.min(Math.max(v,min),max);
	}

	function clamp01(v) {
		return clamp(v,0,1);
	}
