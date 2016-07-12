window.addEventListener("load",function(){
	var Q = Quintus();
    Q.include("Sprites, Scenes, Input, 2D, Touch, UI,Anim")
     .setup("map",{
        maximize:true,
        development:true
        })
     .controls()
     .touch(Q.SPRITE_ALL);            
        
    var Q_little=Quintus()
            	.include("Sprites, Scenes, Input, 2D, Touch, UI,Anim")
            	.setup("little-map",{
            		maximize:true,
                development:true
            }).controls().touch();         
    $("#little-map_container").attr("style","");
    $("#map_container").attr("style","");
    $("#little-map").attr("style","");
    $("#map").attr("style","");
      
        //player
        /*Q.Sprite.extend("Player",{
            init: function(p) {
              this._super(p, { asset: "player.png", x: 900, y: 2340, jumpSpeed: -380});
              this.add('2d, platformerControls');              
            },
            step: function(dt) {
                if(Q.inputs['left'] && this.p.direction == 'right') {
                    this.p.flip = 'x';
                } 
                if(Q.inputs['right']  && this.p.direction == 'left') {
                    this.p.flip = false;                    
                }
            }                    
          });*/
    /*Q.animations('liuli',{run:{frames:[0,1,2,3,4],rate:1/8,loop:true},op_run:{frames:[9,8,7,6,5],rate:1/8,loop:true},die:{frames:[],rate:1/4},hurt:{frames:[],rate:1/2}});
    Q.animations('zhilin',{run:{frames:[0,1,2,3,4],rate:1/8,loop:true},op_run:{frames:[9,8,7,6,5],rate:1/8,loop:true},die:{frames:[],rate:1/4},hurt:{frames:[],rate:1/2}});
    Q.animations('eval',{run:{frames:[0,1,2,3,4],rate:1/8,loop:true},op_run:{frames:[9,8,7,6,5],rate:1/8,loop:true},die:{frames:[],rate:1/4},hurt:{frames:[],rate:1/2}});*/
    Q.Sprite.extend("Player",{
            init: function(p) {
              this._super(p, {sheet:"liuli",sprite:"Player", x: 900, y: 2340, vx:0,vy:0});
              this.add('2d, platformerControls');
              this.add("animation");           
            },
            step:function(dt) {
        		if(Q.inputs['up']) {
          		this.play("jump",1);      // add priority to animation
        		} 
        		else if(Q.inputs['right']) {
        			this.p.vx=30;
          			this.play("run");
        		}
        		else if(Q.inputs['left']) {
          			this.p.vx=-30;
          			this.play("op_run");
          		} 
          		else if(Q.inputs['up']) {
          			this.p.vy=-30;
          			this.flip="y";
          			this.play("jump");
          		} 
          		else if(Q.inputs['down']) {
          			this.p.vy=30;
          			this.play("drop");
          		} 
          		else {
          			this.play("stand_" + this.p.direction);
          			this.p.vx=0;
          			this.p.vy=0;
          		}
    		},
          });
    Q.Sprite.extend("Box",{
    	init:function(p){
    		this._super(p,{sheet:"box",sprite:"box",vx:0,vy:0});
    		this.add('2d, platformerControls');
            this.add("animation");           
    	}
    });

        Q.Sprite.extend("Bullet",{
            init:function (p) {
                this._super(p, { 
                    sheet: "bullet",        // Spritesheet
                    sprite: "bullet",
                    x: 900, 
                    y: 2340,
                    vx: -200,
                    vy:-200,
                    w: 5,
                    h: 5,
                    scale: 0.5,
                });
                this.add("2d, animation, commonBullet");
                //this.on("aim");
            },
            step: function (dt) {
                this.p.x += this.p.vx*dt;
                this.p.y += this.p.vy*dt;
            },
        });
        //bullet的animation
        Q.animations("bullet",{
            boom: { frames: [0,1,2,3,4,5], rate: 1/15, loop:false},
        });
        Q.component("commonBullet",{
            added: function () {
                var entity = this.entity;
                entity.on("bump.left, bump.right, bump.bottom, bump.top",function(collision){
                    if (collision.obj.isA("wanderEnemy")) {
                        this.play("boom");
                        collision.obj.destroy();
                        window.setTimeout(function(){
                            entity.destroy();
                        },333);
                    }
                    else if(collision.obj.isA("Player")){
                        
                    }
                    else{
                        this.play("boom");
                        window.setTimeout(function(){
                            //entity.play("boom");
                            entity.destroy();
                        },333);
                    }
                })
            },
           
        });
    //component for common enemy behaviors
        Q.component("commonEnemy", {
            added: function() {
                var entity = this.entity;
                entity.on("bump.left,bump.right,bump.bottom",function(collision) {
                    if(collision.obj.isA("Player")) {                        
                      Q.stageScene("endGame",1, { label: "Game Over" }); 
                      collision.obj.destroy();
                    }
                });
                entity.on("bump.top",function(collision) {
                    if(collision.obj.isA("Player")) { 
                        //make the player jump
                        collision.obj.p.vy = -100;
                        //kill enemy
                        this.destroy();
                    }
                });
            },
        });        
        
        //enemy that walks around          
        Q.Sprite.extend("wanderEnemy", {
            init: function(p,stage,player) {
                this._super(p, {vx: -10, vy: -10, rangeY: 1000,  defaultDirection: "left"});
                this.add("2d, aiBounce, commonEnemy"); 
                this.on("touch");  
                this.stage = stage;
                this.player = player;
                this.p.initialY = this.p.y;             
            },
            step: function(dt) {        
                var dirX = this.p.vx/Math.abs(this.p.vx);
                var ground = Q.stage().locate(this.p.x, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
                var nextTile = Q.stage().locate(this.p.x + dirX * this.p.w/2 + dirX, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
                
                //if we are on ground and there is a cliff
                if(!nextTile && ground) {
                    if(this.p.vx > 0) {
                        if(this.p.defaultDirection == "right") {
                            this.p.flip = "x";
                        }
                        else {
                            this.p.flip = false;
                        }
                    }
                    else {
                        if(this.p.defaultDirection == "left") {
                            this.p.flip = "x";
                        }
                        else {
                            this.p.flip = false;
                        }
                    }
                    this.p.vx = -this.p.vx;
                }

                if(this.p.y - this.p.initialY >= this.p.rangeY && this.p.vy > 0) {
                    this.p.vy = -this.p.vy;
                } 
                else if(-this.p.y + this.p.initialY >= this.p.rangeY && this.p.vy < 0) {
                    this.p.vy = -this.p.vy;
                } 
            },
            touch: function (touch) {
                //alert("touch");
                var c = Math.sqrt(Math.pow(Math.abs(touch.origX - this.player.p.x),2)+Math.pow(Math.abs(touch.origY - this.player.p.y),2));
                var ax = 500 * (touch.origX - this.player.p.x)/c;
                var by = 500 * (touch.origY - this.player.p.y)/c;
                this.stage.insert(new Q.Bullet({
                    x:this.player.p.x + ax * 0.05, 
                    y:this.player.p.y + by * 0.05,
                    vx:ax,
                    vy:by,
                    }));
            }
        });
    //animations
    Q.animations({'Player',{
					run:{frames:[0,1,2,3,4],next:'stand_right',rate:1/4,loop:true},
					op_run:{frames:[9,8,7,6,5],next: 'stand_left',rate:1/4,loop:true},
					stand_left: {frames: [9]},
					stand_right: {frames: [0]},
					jump: {frames: [10], next:"stand_up",rate: 1},
					drop:{frames: [10], next:"stand_down",rate: 1},
					stand_up:{frames:[10]},
					stand_down:{frames:[10]},
					die:{frames:[],rate:1/4},hurt:{frames:[],rate:1/2}
				}},
				{
					
				}
	);
        
        Q.scene("level1",function(stage) {
          
            var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 30, tileH: 30, type: Q.SPRITE_NONE });
            stage.insert(background);
            
            stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'tiles', tileW: 30, tileH: 30 }));
          
            var player = stage.insert(new Q.Player({scale:1.5}));
            //var liuli=stage.insert(new Q.liuli({x:900,y:2340}));
            /*player.on("step","play('run')");
            player.on("prestep","play('op_run')");*/
            var levelAssets = [
                ["wanderEnemy", {x: 37*30, y: 69*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 37*30, y: 80*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 35*30, y: 82*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 35*30, y: 84*30, asset: "slime.png"}]
            ];
            stage.insert(new Q.wanderEnemy({x: 37*30, y: 69*30, asset: "slime.png"}));
            //stage.loadAssets(levelAssets);  
            stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});

        });
        Q_little.scene("level1",function(stage) {
          
            var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 30, tileH: 30, type: Q.SPRITE_NONE });
            stage.insert(background);
            
            stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'tiles', tileW: 30, tileH: 30 }));
          
            var player = stage.insert(new Q.Player({scale:2}));
            var levelAssets = [
                ["wanderEnemy", {x: 37*30, y: 69*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 37*30, y: 80*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 35*30, y: 82*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 35*30, y: 84*30, asset: "slime.png"}]
            ];
            stage.insert(new Q.wanderEnemy({x: 37*30, y: 69*30, asset: "slime.png"}));
            //var liuli=stage.insert(new Q.liuli({x:900,y:2340}));
            /*player.on("step","play('run')");
            player.on("prestep","play('op_run')");*/
stage.add("viewport");
stage.viewport.scale=0.28;
stage.centerOn(1900,1600);

        });
        /*Q.scene("level2",function(stage) {
          
            var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 30, tileH: 30, type: Q.SPRITE_NONE });
            stage.insert(background);
            
            stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'tiles', tileW: 30, tileH: 30 }));
          
            var player = stage.insert(new Q.Player());
            stage.add("viewport");
            stage.viewport.scale=0.1;
            stage.moveTo(1300,0);
            stage.centerOn(650,300);
        });*/

        alert('aha');
        
        //load assets
        Q.load("smallmap.png, player.png, bullet.png, ba.png, liuli.png,zhilin.png,eval.png, level1.tmx,slime.png", function() {
          Q.sheet("tiles","smallmap.png", { tilew: 30, tileh: 30});  
          Q.sheet("blank","ba.png",{tilew:30,tileh:30});
          Q.sheet("bullet","bullet.png",{tilew:60, tileh:65, sx:0, sy:0});
          Q.sheet("liuli","liuli.png",{tilew: 58,tileh: 100,sx: 0,sy: 0,w:2000,h: 100}); 
          Q.sheet("zhilin","zhilin.png",{tilew: 58,tileh: 100,sx: 0,sy: 0,w: 2000,h: 100});
          Q.sheet("eval","eval.png",{tilew: 70,tileh: 100,sx: 0,sy: 0,w: 2000,h: 100});
          Q.stageScene("level1");
          Q_little.stageScene("level1");
         
        });
        
        
});