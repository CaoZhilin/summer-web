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
    Q.Sprite.extend("lifeBar",{
        init:function(p){
            this._super(p,{sheet:"life"});
        },
    });
    Q.Sprite.extend("Player",{
            init: function(p) {
              this._super(p, {sheet:"liuli",sprite:"Player", x: 900, y: 2340, vx:0,vy:0});
              this.add('platformerControls, swiftPlayer');
              this.add("animation");
              this.on("step",this,"step");
              this.on("bump.top",this,"hitTop");    
              this.on('hit',this,'collision');  
              this.life = 10;
              //this.boxes=[];
              this.lifeBar = new Q.lifeBar({x:this.p.x, y:this.p.y+60});  
            },
            step:function(dt) {
        		if(Q.inputs['up']) {
          		this.play("jump"); 
        		} 
        		else if(Q.inputs['right']) {
        			this.p.vx=60;
          			this.play("run");
        		}
        		else if(Q.inputs['left']) {
          			this.p.vx=-60;
          			this.play("op_run");
          		} 
          		else if(Q.inputs['up']) {
          			this.p.vy=-30;
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
                var p = this.p;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
             
                this.lifeBar.p.x = this.p.x;
                this.lifeBar.p.y = this.p.y + 50;
    		},
    		collision: function(col,last) {
            var p = this.p,
            magnitude = 0;

            if(col.obj.p && col.obj.p.sensor) {
                col.obj.trigger("sensor",entity);
                return;
            }

            col.impact = 0;
            var impactX = Math.abs(p.vx);
            var impactY = Math.abs(p.vy);

            p.x -= col.separate[0];
            p.y -= col.separate[1];

             // Top collision
          if(col.normalY < -0.3) { 
            if(p.vy > 0) { p.vy = 0; }
            col.impact = impactY;
            entity.trigger("bump.bottom",col);
          }
          if(col.normalY > 0.3) {
            if(p.vy < 0) { p.vy = 0; }
            col.impact = impactY;
            alert("yes");
            entity.trigger("bump.top",col);
          }

          if(col.normalX < -0.3) { 
            if(p.vx > 0) { p.vx = 0;  }
            col.impact = impactX;
            entity.trigger("bump.right",col);
          }
          if(col.normalX > 0.3) { 
            if(p.vx < 0) { p.vx = 0; }
            col.impact = impactX;

            entity.trigger("bump.left",col);
          }
        },
        hitTop: function(collision) {
            if (collision.obj.isA("TileLayer") && collision.obj.y > this.p.y) {
                this.p.vy = 0;
            }
        },
    });
    //animations
    Q.animations('Player',{
					run:{frames:[0,1,2,3,4],next:'stand_right',rate:1/5,loop:true},
					op_run:{frames:[9,8,7,6,5],next: 'stand_left',rate:1/5,loop:true},
					stand_left: {frames: [9]},
					stand_right: {frames: [0]},
					jump: {frames: [10], next:"stand_up",rate: 1},
					drop:{frames: [10], next:"stand_down",rate: 1},
					stand_up:{frames:[10]},
					stand_down:{frames:[10]},
					die:{frames:[],rate:1/4},hurt:{frames:[],rate:1/2}
				}
	);
//Box
   Q.Sprite.extend("Box",{
    	init: function(p){
    		this._super(p,{sheet:"box",sprite:"Box",vx:0,vy:0});
            state:"islock";
            effect_class:"primary"; 
            this.add("2d,platformerControls");
            this.add("animation");
            this.on("touch"); 
            this.off("collision");
            this.off("bump"); 
            this.off("step"); 
    	},
    	touch: function(touch){
    		if(this.p.state=="islock"){
    			var notice=new Q.UI.Text({x:this.p.x,y:this.p.y,label:"你还不会这项技能",color:"#c956d1"});
    			touch.stage.insert(notice);
    			//notice.destroy({delay:2});
    		}
    		else if(this.p.state=="isdelay"){
    			var notice=new Q.UI.Text({x:this.x,y:this.y,label:"技能正在冷却",color:"#c956d1"});
    			touch.stage.insert(notice);
    			//notice.destroy({delay:2});
    		}
    		else if(this.p.effect_class=="primary"){
    			this.play("delay_primary");
    		}
    		else if(this.p.effect_class=="junior"){
    			this.play("delay_junior");
    		}
    		else if(this.p.effect_class=="senior"){
    			this.play("delay_senior");
    		}
    	}
    });
//Box animation
	Q.animations("Box",{
		lock:{frames:[21],rate:1/16,loop:true,state:"islock"},
		unlock:{frames:[20],rate:1/16,loop:true,state:"isunlock"},
		delay_primary:{frames:[0,1,2,3,4],rate:5,loop:false,state:"isdelay",next:"unlock"},
		delay_junior:{frames:[0,1,2,3,4,5,6,7,8,9],rate:10,loop:false,state:"isdelay",next:"unlock"},
		delay_senior:{frames:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],rate:20,loop:false,state:"isdelay",next:"unlock"}
	});
            
        Q.component("swiftPlayer", {
        added: function () {
                var entity = this.entity;
                entity.on("bump.left, bump.right, bump.bottom, bump.top",function(collision){
                    if (collision.obj.isA("wanderEnemy")) {
                    //交由怪物碰撞处理
                     entity.p.vx = 0;
                     entity.p.vy = 0;
                    }
                    else{
                        
                    }
                });
            },
           
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
            },
            step: function (dt) {
                this.p.x += this.p.vx*dt;
                this.p.y += this.p.vy*dt;
            }
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
        
        Q.scene("level1",function(stage) {
          
            var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 30, tileH: 30, type: Q.SPRITE_NONE });
            stage.insert(background);
            
            stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'blank', tileW: 30, tileH: 30 }));
          
            var player = stage.insert(new Q.Player({scale:1.5}));
            stage.insert(player.lifeBar);
            //var liuli=stage.insert(new Q.liuli({x:900,y:2340}));
            /*player.on("step","play('run')");
            player.on("prestep","play('op_run')");*/
            var levelAssets = [
                ["wanderEnemy", {x: 37*30, y: 69*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 37*30, y: 80*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 35*30, y: 82*30, asset: "slime.png"}],
                ["wanderEnemy", {x: 35*30, y: 84*30, asset: "slime.png"}]
            ];
            stage.insert(new Q.wanderEnemy({x: 37*30, y: 69*30, asset: "slime.png"},stage,player));
            //stage.loadAssets(levelAssets);  
            stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});
            stage.insert(new Q.Box({state:"islock", effect_class:"primary",scale:0.4,x:1200,y:2500,vy:0}));
            //stage.insert(new Q.Box({state:"islock", effect_class:"junior",scale:0.4,x:1400,y:2500,vy:0}));
            //stage.insert(new Q.Box({state:"isunlock", effect_class:"senior",scale:0.4,x:1600,y:2500,vy:0}));


        });
        Q_little.scene("level1",function(stage) {
          
            var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 30, tileH: 30, type: Q.SPRITE_NONE });
            stage.insert(background);
            
            stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'blank', tileW: 30, tileH: 30 }));
          
            var player = stage.insert(new Q.Player({scale:1.5}));
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
stage.viewport.scale=0.23;
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

        
        //load assets
        Q.load("smallmap.png,life.png,direction.png,box.png, player.png, bullet.png, ba.png, liuli.png,zhilin.png,eval.png, level1.tmx,slime.png", function() {
          Q.sheet("tiles","smallmap.png", { tilew: 30, tileh: 30});
          Q.sheet("life","life.png", { tilew: 23*5, tileh: 23});  
          Q.sheet("blank","ba.png",{tilew:30,tileh:30});
          Q.sheet("bullet","bullet.png",{tilew:60, tileh:65, sx:0, sy:0});
          Q.sheet("liuli","liuli.png",{tilew: 58,tileh: 100,sx: 0,sy: 0,w:2000,h: 100}); 
          Q.sheet("zhilin","zhilin.png",{tilew: 58,tileh: 100,sx: 0,sy: 0,w: 2000,h: 100});
          Q.sheet("eval","eval.png",{tilew: 70,tileh: 100,sx: 0,sy: 0,w: 2000,h: 100});
          Q.sheet("box","box.png",{tilew:200,tileh:200,sx:4200,sy:0});
          Q.stageScene("level1");
          Q_little.stageScene("level1");
         
        });
        
        
});