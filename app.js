window.addEventListener("load", function () {
    //canvas setup
    const canvas = this.document.getElementById("canvas1");
    var ctx = canvas.getContext("2d");
    canvas.width = 2500;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.game.start = true;
                }
                else if (
                    (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                    this.game.keys.indexOf(e.key) === -1
                ) {
                    this.game.keys.push(e.key);
                } else if (e.key === " ") {
                    this.game.player.shootTop();
                } else if(e.key === 'd') {
                    this.game.debug = !this.game.debug;
                } else if(e.key === 'r') {
                    this.game.start = false;
                }
            });
            window.addEventListener("keyup", (e) => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }
    class Projectile {
        constructor(game, x, y, height, width, sp) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.speed = 3;
            this.markedForDeletion = false;
            this.sp = sp;
            this.image = document.getElementById('projectile');
            this.imageDD = document.getElementById('projectileDD');
            this.sound = new Sound('game assets/sfx/Laser_shoot 46.wav');
            this.sound.playy();
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            if(this.sp) context.drawImage(this.imageDD, this.x, this.y, this.width, this.height);
            else context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        play() {
        }
    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.imagePowerUp = document.getElementById('playerPP');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
            this.hitSound = new Sound('game assets/sfx/Hit_hurt 34.wav');
            this.hitPowerUp = new Sound('game assets/sfx/Hit_hurt 34.wav');
            this.bgPowerUp = new Sound('game assets/sfx/battle.wav');
        }
        update(deltaTime) {
            if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes("ArrowDown"))
                this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            // vertical boundaries
            if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
            this.projectiles.forEach((projectile) => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(
                (projectile) => !projectile.markedForDeletion
                );
            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                this.powerUp = false;
                this.bgPowerUp.stop();
                this.powerUpTimer = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.game.ammo += 0.1;
                }
            }
        }
        draw(context) {
            if(game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            if (this.powerUp) context.drawImage(this.imagePowerUp, this.x, this.y, this.width, this.height);
            else context.drawImage(this.image, this.x, this.y, this.width, this.height);
            this.projectiles.forEach((projectile) => {
                projectile.draw(context);
            });
        }
        shootTop() {
            if (this.game.start && this.game.ammo > 0) {
                this.projectiles.push(
                    new Projectile(this.game, this.x + 120, this.y + 93, 3, 10)
                );

                this.game.ammo--;
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom() {
            if (this.game.start && this.game.ammo > 0) {
                this.projectiles.push(
                    new Projectile(this.game, this.x + 120, this.y + 45, 5, 10, true), 
                    new Projectile(this.game, this.x + 120, this.y + 145, 5, 10, true) 
                );
                this.game.ammo--;
            } 
        }
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            this.hitPowerUp.playy();
            this.bgPowerUp.playy();
            if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.markedForDeletion = false;
            this.sound = new Sound('game assets/sfx/Hit_hurt 111.wav')
        }
        update() {
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context) {
            if(game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.fillStyle = "black";
            context.font = "20px";
            if(game.debug) context.fillText(this.lives, this.x, this.y);
        }
    }
    class Buggy extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 1;
            this.score = this.lives;
            this.width = 269 * 0.2;
            this.height = 169 * 0.15;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.speedX = Math.random() * -1.5 - 0.5;
            this.image = document.getElementById('buggy');
            this.type = 'minnion'
        }
    }
    class Nightmare extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 3;
            this.score = this.lives;
            this.width = 269 * 0.5;
            this.height = 169 * 0.35;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.speedX = Math.random() * -2 - 1.5;
            this.image = document.getElementById('nightmare');
        }
    }
    class BlackWidow extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 5;
            this.score = this.lives;
            this.width = 269 * 0.6;
            this.height = 169 * 0.45;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.speedX = Math.random() * -0.8 - 0.3;
            this.image = document.getElementById('blackWidow');
        }
    }
    class Bonus extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 1;
            this.score = 0;
            this.width = 169 * 0.25;
            this.height = 169 * 0.25;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.speedX = Math.random() * -1 - 0.5;
            this.image = document.getElementById('bonus');
            this.type = 'bonus';
        }
    }
    class Boss extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 50;
            this.score = this.lives / 2;
            this.width = 269 * 2;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.speedX = Math.random() * -0.3 - 0.1;
            this.image = document.getElementById('boss');
            this.type = 'boss';
        }
    }
    class Minnion extends Enemy {
        constructor(game, x, y) {
            super(game);
            this.lives = 1;
            this.score = this.lives * 2;
            this.width = 269 * 0.25;
            this.height = 169 * 0.25;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('minnion');
            this.speedX = Math.random() * -3.5 - 0.5
            this.type = 'minnion';
        }
    }
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }

        update() {
            if (this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModifier;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x+this.width, this.y);
        }
    }
    class Sound {
        constructor(audio) {
            this.sound = new Audio();
            this.sound.src = audio;
            this.sound.autoplay = true;
        }
        load() {
            this.sound.load();
        }
        playy() {
            this.sound.play();
        }
        stop() {
            this.sound.pause();
        }
    }
    class Background { 
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 0);
            this.layer4 = new Layer(this.game, this.image4, 1.5);

            this.layers = [this.layer1, this.layer2, this.layer3];

            
            // this.audio1 = 
            
        }

        update() {
            this.layers.forEach(layer => layer.update());
        }
        
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
        } 
    }
    class Explosion {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.frameX = 0;
            this.fps = 10;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.markedForDeletion = false;
            this.sound = '';
        }
        update(deltaTime) {
            this.x -= this.game.speed;
            if (this.timer > this.interval) {
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
            if (this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
        play() {
            this.sound.playy();
        }
    }
    class smokeExp extends Explosion {
        constructor(game, x, y) {
            super(game, x, y);
            this.image = document.getElementById('smoke');
            this.maxFrame = 8;
            this.spriteHeight = 200;
            this.spriteWidth = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.sound = new Sound('game assets/sfx/Explosion 20 (1).wav');
            
        }
        
    }
    class fireExp extends Explosion {
        constructor(game, x, y) {
            super(game, x, y);
            this.image = document.getElementById('fire');
            this.maxFrame = 8;
            this.spriteHeight = 80;
            this.spriteWidth = 128;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.sound = new Sound('game assets/sfx/exp_1.mp3');
            
        }
        
    }
    class bombExp extends Explosion {
        constructor(game, x, y) {
            super(game, x, y);
            this.image = document.getElementById('bomb');
            this.maxFrame = 12;
            this.spriteHeight = 128;
            this.spriteWidth = 128;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.sound = new Sound('game assets/sfx/bomb.mp3');
            
        }
        
    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontsize = 18;
            this.fontFamily = "Permanent Marker";
            this.color = "white";
            this.colorPowerUp = "cyan";
        }
        draw(context) { //display on screen
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = "black";
            context.font = this.fontsize + "px " + this.fontFamily;
            //score
            context.fillText("Score: " + this.game.score, 20, 40);
            //ammo
            if(this.game.player.powerUp) context.fillStyle = this.colorPowerUp;
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText("Timer: " + formattedTime, 20, 100);
            //game over
            if (this.game.gameOver) {
                context.textAlign = "center";
                context.fillStyle = this.color;
                let message1;
                let message2;
                let message3;
                if (this.game.score > this.game.winningScore) {
                    message1 = "You Win";
                    message2 = "Well Done!";
                } else {
                    message1 = "You Lose";
                    message2 = "Try again Next time";
                    message3 = "Press R to play again!";
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(
                    message1,
                    this.game.width * 0.5,
                    this.game.height * 0.5 - 40
                );
                context.font = '25px ' + this.fontFamily;
                context.fillText(
                    message2,
                    this.game.width * 0.5,
                    this.game.height * 0.5 + 40
                );
                context.font = '20px ' + this.fontFamily;
                context.fillText(
                    message3,
                    this.game.width * 0.5,
                    this.game.height * 0.5 + 80
                );
            }
            context.restore();
        }
    }
    class Game {
        //brain of the game
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.bgAudio = new Sound('game assets/sfx/slow-travel.wav');
            this.keys = [];
            this.enemies = [];
            this.explosions = [];
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 369;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 100;
            this.gameTime = 0;
            this.timeLimit = 40000;
            this.speed = 1;
            this.debug = false;
            this.start = false;
        }
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.explosions.forEach(explosion => explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion => {
                !explosion.markedForDeletion;
                explosion.play();
            });
            this.enemies.forEach((enemy) => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    this.player.hitSound.playy();
                    this.addExplosion(enemy);
                    if (enemy.type === 'bonus') this.player.enterPowerUp();
                    else if (enemy.type === 'boss') this.gameOver = true;
                    else if (!this.gameOver) this.score--;
                }
                this.player.projectiles.forEach((projectile) => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        enemy.sound.playy();
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0) {
                            
                            enemy.markedForDeletion = true;
                            this.addExplosion(enemy);
                            if (enemy.type === 'boss') {
                                for(let i =0; i < 5; i++) {
                                    this.enemies.push(new Minnion(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height));
                                }
                            }
                            if (!this.gameOver) this.score += enemy.score;
                            // if (this.score > this.winningScore) this.gameOver = true;
                            
                        }
                    }
                });
            });
            this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context) {
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
            this.enemies.forEach((enemy) => {
                enemy.draw(context);
            });
            this.explosions.forEach(explosion => {
                explosion.draw(context);
                // console.log(explosion);
                // explosion.play();
            });
            this.background.layer4.draw(context);
        }
        addEnemy() {
            const probality = Math.random();

            if(probality < 0.3) this.enemies.push(new Buggy(this));
            else if (probality < 0.6) this.enemies.push(new Nightmare(this));
            else if (probality < 0.8) this.enemies.push(new BlackWidow(this));
            else if (probality < 0.85) this.enemies.push(new Boss(this));
            else this.enemies.push(new Bonus(this));
        }
        addExplosion(enemy) {
            if (enemy.type === 'boss') this.explosions.push(new bombExp(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)); 
            else if (enemy.type === 'minnion') this.explosions.push(new smokeExp(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)); 
            else this.explosions.push(new fireExp(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)); 
        }
        checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            );
        }
    }
    class Loader {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.background = new Background(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this); 
            this.bgAudio = new Sound('game assets/sfx/loading.wav');
            this.keys = [];
            this.ammo = 0;
            this.score = 0;
            this.gameTime = 0;
            this.fontSize = '69px ';
            this.fontFamily = "Permanent Marker";
            this.color = "white";
        }
        draw(context) {
            context.save();
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
            context.font = this.fontSize + this.fontFamily;
            context.textAlign = "center";
            context.fillStyle = this.color;
            context.fillText(
                'Press Enter to start',
                this.width * 0.5,
                this.height * 0.5
            ); 
            context.fillText(
                'Space to shoot and \u{2191} \u{2193} to move',
                this.width * 0.5,
                this.height * 0.5 + 100
            )
            this.background.layer4.draw(context);
            context.restore();
        }
        play() {
            this.bgAudio.playy();
        }
    }


    const game = new Game(canvas.width, canvas.height);
    const loader = new Loader(canvas.width, canvas.height);
    loader.bgAudio.load();
    loader.play();
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        loader.draw(ctx);
        if(game.start) {
            game.draw(ctx);
            game.update(deltaTime);
            game.bgAudio.playy();   
        }
        requestAnimationFrame(animate);
    }
    animate(0);
});
