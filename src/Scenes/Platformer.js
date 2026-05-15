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

        this.spikeLayer = this.map.createLayer("Spikes", this.tileset, 0, 0);
        this.spikeLayer.setScale(SCALE);

        this.gemLayer = this.map.createLayer("Gems", this.tileset, 0, 0);
        this.gemLayer.setScale(SCALE);

        // Make it collidable
        this.platformLayer.setCollisionByProperty({
            collides: true
        });

        this.spikeLayer.setCollisionByProperty({
            collides: true
        });

        //set world bounds
        this.physics.world.setBounds(0, -50, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE + 50);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(80, 400, "idle").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        //set max velocity
        my.sprite.player.setMaxVelocity(this.MAX_SPEED, 10000);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.platformLayer);

        //set up camera
        this.cameras.main.setBounds(0, 0, 2880, 720);

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

        console.log(SCALE);

    }

    update() {
        this.cameras.main.centerOn(my.sprite.player.x, game.config.height/2);
        if(this.AKey.isDown) {
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

        //restart scene
        if(Phaser.Input.Keyboard.JustDown(this.RKey)){
            this.scene.start("platformerScene");
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

        //handle TERMINAL_VELOCITY
        if(!this.gravityFlipped && my.sprite.player.body.velocity.y > this.TERMINAL_VELOCITY){
            my.sprite.player.setVelocityY(this.TERMINAL_VELOCITY);
        }
        else if(this.gravityFlipped && my.sprite.player.body.velocity.y < -this.TERMINAL_VELOCITY){
            my.sprite.player.setVelocityY(-this.TERMINAL_VELOCITY);
        }

        //check if player is blocked, if so, reset flipAbility
        if(this.playerBlocked()){
            this.flipAbility = true;
        }
    }

    flipGravity(){
        this.gravityFlipped = !this.gravityFlipped; //toggle gravityFlipped boolean

        this.physics.world.gravity.y *= -1; //flip gravity
        this.JUMP_VELOCITY *= -1; //flip jump velocity

        my.sprite.player.toggleFlipY(); //flip player sprite
    }

    //checks if the players foot is blocked
    playerBlocked(){

        //if gravity flipped, return blocked.up
        if(this.gravityFlipped){
            return my.sprite.player.body.blocked.up;
        }
        return my.sprite.player.body.blocked.down;
    }
}