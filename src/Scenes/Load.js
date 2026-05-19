class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        //this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "monochrome_tilemap_transparent_packed.png");
        this.load.image("tilemap_tiles_black", "monochrome_tilemap_packed.png");                           // Packed tilemap
        this.load.tilemapTiledJSON("level-1", "level-test.tmj");   // Tilemap in JSON

        //load sprite images
        this.load.image("walk1", "player_walk01.png");
        this.load.image("walk2", "player_walk02.png");
        this.load.image("idle", "player_idle.png");
        this.load.image("jump", "player_jump.png");

        //particles
        this.load.image("circleParticle", "circle_05.png");
        this.load.image("starParticle", "star_07.png");

        //audio
        this.load.audio("gameOver", "spaceTrash3.ogg");
        this.load.audio("jump", "tone1.ogg");
        this.load.audio("flip", "phaserUp1.ogg");
        this.load.audio("death", "lowDown.ogg");
        this.load.audio("levelComplete", "powerUp1.ogg");
        this.load.audio("gemGrab", "powerUp6.ogg");

        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.bitmapFont("kenneySquare", "kenneySquare_0.png", "kenneySquare.fnt");
    }

    create() {
        //html text
        document.getElementById('description').innerHTML = '<h2>GRABity!</h2>';
        document.getElementById('controls').innerHTML = '<h3>Controls:</h3><p>A/D - Left/Right Movement<br>SPACE - Jump/Double Jump<br>Left Click - Flip Gravity (Once until landed)</p>';

        this.anims.create({
            key: 'walk',
            frames: [
                {key: "walk1", frame: 0},
                {key: "walk2", frame: 0}
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [
                {key: "idle", frame: 0},
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [
                {key: "jump", frame: 0},
            ],
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}