class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 700;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000; 
        this.gravityFlipped = false;
        this.JUMP_VELOCITY = -700; 
        this.MAX_SPEED = 200;
        this.TERMINAL_VELOCITY = 400;
        this.flipAbility = true; //flipAbility indicates if players are able to flip gravity
        this.lives = 3;
        this.gameRunning = true;
        this.canDoubleJump = true;

        this.text = {};
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("level-1", 16, 16, 60, 15);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_transparent_packed", "tilemap_tiles");

        // layers
        this.platformLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.platformLayer.setScale(SCALE);

        this.decorLayer = this.map.createLayer("Decor", this.tileset, 0, 0);
        this.decorLayer.setScale(SCALE);

        this.bgLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.bgLayer.setScale(SCALE);
        this.bgLayer.setAlpha(0.1);
        this.bgLayer.setScrollFactor(0.33); //parallax effect


        //make gems
        this.gems = this.map.createFromObjects("Gems", {
            name: "Gem",
            key: "tilemap_sheet",
            frame: 82
        });
        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);
        //scale up and reposition
        this.gems.forEach(gem => {
            gem.setScale(SCALE);

            // scale position to match scaled map
            gem.x *= SCALE;
            gem.y *= SCALE;

            gem.body.updateFromGameObject();
        });
        this.gemGroup = this.add.group(this.gems);
        this.totalGems = this.gemGroup.getLength();
        this.grabbedGems = 0;

        //make Spikes
        this.spikes = this.map.createFromObjects("Spikes", {
            name: "Spike",
            key: "tilemap_sheet", 
            frame: 166
        });
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        //scale up and reposition
        this.spikes.forEach(spike => {
            spike.setScale(SCALE);

            // scale position to match scaled map
            spike.x *= SCALE;
            spike.y *= SCALE;
            spike.body.updateFromGameObject();

            //scale down hitbox
            spike.body.setSize(spike.width*SCALE*0.5, spike.height*SCALE*0.5, true);
            spike.body.setOffset(4*SCALE,4*SCALE);
        });

        this.spikeGroup = this.add.group(this.spikes);


        // Make layers collidable
        this.platformLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(80, 400, "idle").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        //set world boundsd
        this.physics.world.setBounds(0, -50, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE + 100);

        //set max velocity
        my.sprite.player.setMaxVelocity(this.MAX_SPEED, 10000);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.platformLayer);

        //set up camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*SCALE, this.map.heightInPixels*SCALE);
        this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0);

        //keys
        this.AKey = this.input.keyboard.addKey("A"); //left
        this.DKey = this.input.keyboard.addKey("D"); //right
        this.RKey = this.input.keyboard.addKey("R"); //restart scene
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); //jump

        // debug key listener (assigned to Q key)
        this.input.keyboard.on('keydown-Q', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        //on mouse down, flip gravity if adble to
        this.input.on('pointerdown', function (pointer)
        {

            if(this.flipAbility){
                this.flipGravity();
                this.flipAbility = false;
            }

        }, this);

        //text
        my.text.gemCount = this.add.bitmapText(10, 10 ,"kenneySquare", `Gems: ${this.grabbedGems} / ${this.totalGems}`);
        my.text.gemCount.setScrollFactor(0); //stops text from scrolling

        //add gem overlap
        this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
            obj2.destroy(); // remove gem on overlap
            this.grabbedGems++; //increment grabbedGems
            //update text
            my.text.gemCount.setText(`Gems: ${this.grabbedGems} / ${this.totalGems}`);
        });

        //add spike overlap
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            this.playerDead();
        });
    }

    //TODO:
    //add heart UI for lives
    //sound effects
    //particles
    update(){
        if(this.gameRunning){
            if(this.AKey.isDown){
                //have the player accelerate to the left
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
                
                my.sprite.player.setFlipX(true);
                my.sprite.player.anims.play('walk', true);

            } else if(this.DKey.isDown) {
                // have the player accelerate to the right
                my.sprite.player.setAccelerationX(this.ACCELERATION);

                my.sprite.player.setFlipX(false);
                my.sprite.player.anims.play('walk', true);

            } else {
                // set acceleration to 0 and have DRAG take over
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                
                my.sprite.player.anims.play('idle');
            }

            //check is no lives left
            if(this.lives <= 0){
                this.endScreen("Game Over!", 3)
            }

            //if player out of bounds
            if(my.sprite.player.y > this.map.heightInPixels*SCALE + my.sprite.player.displayHeight/2
                || my.sprite.player.y < -my.sprite.player.displayHeight/2
            ){
                this.playerDead();
            }

            //level complete
            if(this.grabbedGems == this.totalGems){
                this.time.delayedCall(2000, () => {
                    this.endScreen("Level Completed!", 3);
                })
            }

            //restart scene
            if(Phaser.Input.Keyboard.JustDown(this.RKey)){
                this.endScreen("Restarting!", 1);
            }

            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!this.playerBlocked()) {
                my.sprite.player.anims.play('jump');
            }
            if(this.playerBlocked() && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);

            }
            //check if player canDoubleJump
            else if(this.canDoubleJump && Phaser.Input.Keyboard.JustDown(this.spaceKey)){
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
                this.canDoubleJump = false; //player has double jumped, set false now
            }

            //handle TERMINAL_VELOCITY
            if(!this.gravityFlipped && my.sprite.player.body.velocity.y > this.TERMINAL_VELOCITY){
                my.sprite.player.setVelocityY(this.TERMINAL_VELOCITY);
            }
            else if(this.gravityFlipped && my.sprite.player.body.velocity.y < -this.TERMINAL_VELOCITY){
                my.sprite.player.setVelocityY(-this.TERMINAL_VELOCITY);
            }

            //check if player is blocked, if so, reset flipAbility and canDoubleJump
            if(this.playerBlocked()){
                this.flipAbility = true;
                this.canDoubleJump = true;
            }
        }
    }

    flipGravity(){
        this.gravityFlipped = !this.gravityFlipped; //toggle gravityFlipped boolean

        this.physics.world.gravity.y *= -1; //flip gravity
        this.JUMP_VELOCITY *= -1; //flip jump velocity

        my.sprite.player.toggleFlipY(); //flip player sprite
    }

    playerDead(){
        this.lives--; //decrement lives

            //reset player
            my.sprite.player.setPosition(80,400);
            my.sprite.player.setVelocity(0);

            //reset gravity
            if(this.gravityFlipped){
                this.flipGravity();
            }
    }

    //checks if the players foot is blocked
    playerBlocked(){

        //if gravity flipped, return blocked.up
        if(this.gravityFlipped){
            return my.sprite.player.body.blocked.up;
        }
        return my.sprite.player.body.blocked.down;
    }

    //text: text that will be displayed on screen 
    //time: time (in secs) until the scene restarts
    endScreen(text, time){
        this.gameRunning = false;

        //prevent movement
        this.physics.world.gravity.y = 0; 
        my.sprite.player.setAcceleration(0);
        my.sprite.player.setVelocity(0);

        //draw black background (cover everything)
        let graphics = this.add.graphics();
        graphics.fillStyle(0x000000,1);
        graphics.fillRect(0,0,this.map.widthInPixels*SCALE,this.map.heightInPixels*SCALE);

        //my.sprite.blackoutScreen.setDepth(100); //set in front of everything
        my.text.gameOver = this.add.bitmapText(game.config.width/2, game.config.height/2,"kenneySquare", text).setOrigin(0.5);
        my.text.gameOver.setScrollFactor(0);
        this.time.delayedCall(time*1000, () =>{this.scene.restart();}, [], this);
    }

}