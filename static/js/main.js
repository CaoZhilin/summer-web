window.addEventListener("load",function(){
	var Q = Quintus();
    Q.include("Sprites, Scenes, Input, 2D, Touch, UI,Anim")
     .setup("map",{
      width: 960,
      height: 640,
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
            }).controls().touch(Q.SPRITE_ALL);         
    $("#little-map_container").attr("style","");
    $("#map_container").attr("style","");
    $("#little-map").attr("style","");
    $("#map").attr("style","");
    Q.Sprite.extend("lifeBar",{
        init:function(p){
            this._super(p,{sheet:"life"});
        },
    });
    Q.component('3d',{
    added: function() {
      var entity = this.entity;
      Q._defaults(entity.p,{
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        gravity: 0,
        collisionMask: Q.SPRITE_DEFAULT
      });
      entity.on('hit',this,'collision');
    },

    collision: function(col,last) {
      if (!col.obj.isA("lifeBar")) {
        var entity = this.entity,
          p = entity.p,
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
      }
    },
  });

    Q.Sprite.extend("Player",{
            init: function(p) {
              this._super(p, {gravity: 0,
        collisionMask: Q.SPRITE_DEFAULT, sheet:"liuli",sprite:"Player", w:0,h:0,x: 56*30, y: 60*30, vx:0,vy:0});
              this.add('platformerControls, 3d, swiftPlayer');
              this.add("animation");

              this.on("step",this,"step"); 
              this.on("hitTop");
              this.life = 10; 
              this.points = 0;
              this.p.timeInvincible = 0;
              this.lifeBar = new Q.lifeBar({x:this.p.x, y:this.p.y-100});  

              this.on("bump.top",this,"hitTop");    
              this.on('hit',this,'collision');
              this.on('touch');
              this.on('input');
              this.skill0=new Q.Skill({frame:[0],effect_class:"primary",state:"islock", name:"doge",scale:0.4,x:this.p.x-100,y:this.p.y+350,vx:0,vy:0});
              this.skill1=new Q.Skill({frame:[1],effect_class:"junior",state:"islock", name:"flower",scale:0.4,x:this.p.x,y:this.p.y+350,vx:0,vy:0});
              this.skill2=new Q.Skill({frame:[2],effect_class:"senior",state:"islock",name:"round",scale:0.4,x:this.p.x+100,y:this.p.y+350,vx:0,vy:0});
            },
            step:function(dt) {
            if(this.p.timeInvincible > 0) {
              this.p.timeInvincible = Math.max(this.p.timeInvincible - dt, 0);
              //console.log(this.p.timeInvincible);
            }
                
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
                this.lifeBar.p.y = this.p.y - 100;

              
                this.skill0.p.x=this.p.x-100;
                this.skill0.p.y=this.p.y+350;

                this.skill1.p.x=this.p.x;
                this.skill1.p.y=this.p.y+350;

                this.skill2.p.x=this.p.x+100;
                this.skill2.p.y=this.p.y+350;

                this.skill0.box.p.x=this.p.x-100;
                this.skill0.box.p.y=this.p.y+350;

                this.skill1.box.p.x=this.p.x;
                this.skill1.box.p.y=this.p.y+350;

                this.skill2.box.p.x=this.p.x+100;
                this.skill2.box.p.y=this.p.y+350;
                if(Q.inputs['one']){
                    this.skill0.add("tween");
                    this.skill0.animate({state:"unlock"},{delay:5});
                    if(this.skill0.p.state=="islock"){
                        alert("你还不会这项技能");
                    }
                    else if(this.skill0.p.state=="isdelay"){
                       alert("技能正在冷却");
                     }
                    else{
                        if(this.skill0.p.effect_class=="primary"){
                            this.skill0.p.state="isdelay";
                            this.skill0.box.play("delay_primary");
                            //this.weapon=new Q.Weapon({});
                        }
                        else if(this.skill0.p.effect_class=="junior"){
                            this.skill0.p.state="isdelay";
                            this.skill0.box.play("delay_junior");
                        }
                        else if(this.skill0.p.effect_class=="senior"){
                            this.skill0.p.state="isdelay";
                            this.skill0.box.play("delay_senior");
                        }
                    }

                }
                else if(Q.inputs['two']){
                    this.skill1.add("tween");
                    this.skill1.animate({state:"unlock"},{delay:10});
                    if(this.skill1.p.state=="islock"){
                        alert("你还不会这项技能");
                    }
                    else if(this.skill1.p.state=="isdelay"){
                        alert("技能正在冷却");
                     }
                    else{
                        if(this.skill1.p.effect_class=="primary"){
                            this.skill1.p.state="isdelay";
                            this.skill1.box.play("delay_primary");
                            //this.weapon=new Q.Weapon({});
                        }
                        else if(this.skill1.p.effect_class=="junior"){
                            this.skill1.p.state="isdelay";
                            this.skill1.box.play("delay_junior");
                        }
                        else if(this.skill1.p.effect_class=="senior"){
                            this.skill1.p.state="isdelay";
                            this.skill1.box.play("delay_senior");
                        }
                    }

                }
                else if(Q.inputs['three']){
                    this.skill2.add("tween");
                    this.skill2.animate({state:"unlock"},{delay:20});
                    if(this.skill2.p.state=="islock"){
                        alert("你还不会这项技能");
                    }
                    else if(this.skill2.p.state=="isdelay"){
                       alert("技能正在冷却");
                     }
                    else{
                        if(this.skill2.p.effect_class=="primary"){
                            this.skill2.p.state="isdelay";
                            this.skill2.box.play("delay_primary");
                            //this.weapon=new Q.Weapon({});
                        }
                        else if(this.skill2.p.effect_class=="junior"){
                            this.skill2.p.state="isdelay";
                            this.skill2.box.play("delay_junior");
                            //this.weapon=new Q.Weapon({});
                        }
                        else if(this.skill2.p.effect_class=="senior"){
                            this.skill2.p.state="isdelay";
                            this.skill2.box.play("delay_senior");
                            //this.weapon=new Q.Weapon({});
                        }
                    }

                }
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
            this.trigger("bump.bottom",col);
          }
          if(col.normalY > 0.3) {
            if(p.vy < 0) { p.vy = 0; }
            col.impact = impactY;
            this.trigger("bump.top",col);
          }

          if(col.normalX < -0.3) { 
            if(p.vx > 0) { p.vx = 0;  }
            col.impact = impactX;
            this.trigger("bump.right",col);
          }
          if(col.normalX > 0.3) { 
            if(p.vx < 0) { p.vx = 0; }
            col.impact = impactX;

            this.trigger("bump.left",col);
          }
        },
        hitTop: function(collision) {
            if (collision.obj.isA("TileLayer") && collision.obj.y > this.p.y) {
                this.p.vy = 0;
            }
        },
        damage: function() {
        //only damage if not in "invincible" mode, otherwise beign next to an enemy takes all the lives inmediatly
        if(!this.p.timeInvincible) {
          this.life--;
        
          //will be invincible for 1 second
          this.p.timeInvincible = 2;
          this.lifeBar.p.frame = 10-this.life;
                      //var lifeLabel = Q("UI.Text",999).items[0];
                      //lifeLabel.p.label = 'Lives x '+ this.player.life;
        
          if(this.life<0) {
            this.destroy();
            Q.stageScene("endGame",1, { label: "Game Over" }); 
          }
          else {
            var livesLabel = Q("UI.Text",999).first();
            livesLabel.p.label = "Lives x "+this.life;
          }
        }
      }
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
            this.add("platformerControls");
            this.add("animation");
            this.off("collision");
            this.off("bump"); 
            //this.off("step");
    	},
        step:function(){
            this.p.x=this.p.x;
            this.p.y=this.p.y;
        }
    });
//Box animation
	Q.animations("Box",{
		unlock:{frames:[20],rate:1,loop:true},
		delay_primary:{frames:[0,1,2,3,4],rate:1,loop:false,next:"unlock"},
		delay_junior:{frames:[0,1,2,3,4,5,6,7,8,9],rate:1,loop:false,next:"unlock"},
		delay_senior:{frames:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],rate:1,loop:false,next:"unlock"}
	});
    Q.Sprite.extend("Skill",{
        init: function(p){
            this._super(p,{
                sheet:"skill",
                sprite:"Skill",
                vx:0,
                vy:0,
                effect_class:"primary",
                state:"unlock",

        });
            //this.add("2d,platformerControls");
            this.add("animation");
            this.on("input");
            this.off("collision");
            this.off("bump"); 
            this.off("step"); 
            this.box=new Q.Box({frame:[21],scale:0.4,x:this.p.x,y:this.p.y,vx:0,vy:0})
        },
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
        //3d
        Q.component('3d',{
    added: function() {
      var entity = this.entity;
      Q._defaults(entity.p,{
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        gravity: 0,
        collisionMask: Q.SPRITE_DEFAULT
      });
      entity.on('step',this,"step");
      entity.on('hit',this,'collision');
    },

    collision: function(col,last) {
      if (!col.obj.isA("lifeBar")) {
        var entity = this.entity,
          p = entity.p,
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
      }
    },

    step: function(dt) {
      var p = this.entity.p,
          dtStep = dt;
      // TODO: check the entity's magnitude of vx and vy,
      // reduce the max dtStep if necessary to prevent 
      // skipping through objects.
      while(dtStep > 0) {
        dt = Math.min(1/30,dtStep);
        // Updated based on the velocity and acceleration
        p.vx += p.ax * dt + (p.gravityX == void 0 ? Q.gravityX : p.gravityX) * dt * p.gravity;
        p.vy += p.ay * dt + (p.gravityY == void 0 ? Q.gravityY : p.gravityY) * dt * p.gravity;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        this.entity.stage.collide(this.entity);
        dtStep -= dt;
      }
    }
  });

    //component for common enemy behaviors
        Q.component("commonEnemy", {
            added: function() {
                var entity = this.entity;
                entity.on("bump.left,bump.right,bump.bottom,bump.top",function(collision) {
                    if(collision.obj.isA("Player")) {  
                      collision.obj.damage();                      
                    }
                    else if (collision.obj.isA("Bullet")) {
                        this.destroy();
                        if (this.isA("blackEnemy")) {
                          this.player.points++;
                        }
                        this.player.points++;
                        var pointsLabel = Q("UI.Text",999).items[1];
                        pointsLabel.p.label = 'Points x '+ this.player.points;
                        if (this.player.points == 100) {
                          Q.stageScene("winGame",1, { label: "You win!" });
                        }
                    }
                });
            },
        });        
        
        //enemy that walks around          
        Q.Sprite.extend("wanderEnemy", {
            init: function(p,stage,player) {
                this._super(p, {vx: -10, vy: -10, rangeY: 1000,  defaultDirection: "left"});
                this.add("3d, aiBounce, commonEnemy"); 
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
        Q.animations("blackEnemy",{
        run_left:{frames:[5,6,7,8,9],rate:1/5,loop:true},
        run_right:{frames:[0,1,2,3,4],rate:1/5,loop:true},
        });
        Q.Sprite.extend("blackEnemy",{
            init: function(p,stage,player) {
                this._super(p, { sheet: 'eval',sprite:'blackEnemy', vx: -20, vy: -20, rangeY: 1000,  defaultDirection: "left"});
                this.add("3d, aiBounce, commonEnemy, animation"); 
                this.on("touch");  
                this.stage = stage;
                this.player = player;
                this.p.initialY = this.p.y;             
            },
            step: function(dt) {        
                var dirX = this.p.vx/Math.abs(this.p.vx);
                var ground = Q.stage().locate(this.p.x, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
                var nextTile = Q.stage().locate(this.p.x + dirX * this.p.w/2 + dirX, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
                if (dirX > 0) {
                  this.play("run_right");
                }
                else{
                  this.play("run_left");
                }
            },
            touch: function (touch) {
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
            stage.insert(player.skill0);
            stage.insert(player.skill1);
            stage.insert(player.skill2);
            stage.insert(player.skill0.box);
            stage.insert(player.skill1.box);
            stage.insert(player.skill2.box);
            var levelAssets = [
                ["wanderEnemy", {x: 37*30, y: 69*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 37*30, y: 80*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 35*30, y: 82*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 92*30, y: 38*30, asset: "slime.png"},stage,player],
                ["blackEnemy", {x: 32*30, y: 62*30},stage,player],
                ["blackEnemy", {x: 18*30, y: 61*30},stage,player],
                ["blackEnemy", {x: 102*30, y: 60*30},stage,player],
                ["blackEnemy", {x: 94*30, y: 71*30},stage,player],
                ["wanderEnemy", {x: 28*30, y: 79*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 31*30, y: 77*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 82*30, y: 86*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 96*30, y: 62*30, asset: "slime.png"},stage,player],
                
                ["wanderEnemy", {x: 14*30, y: 59*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 51*30, y: 11*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 53*30, y: 10*30, asset: "slime.png"},stage,player],
                ["wanderEnemy", {x: 51*30, y: 12*30, asset: "slime.png"},stage,player]
            ];
            //stage.insert(new Q.wanderEnemy({x: 37*30, y: 69*30, asset: "slime.png"},stage,player));
            stage.loadAssets(levelAssets);
            
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,30000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,60000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            }, 90000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            }, 120000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,150000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,180000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,210000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,240000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,270000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,300000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,330000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,360000);
            window.setTimeout(function(){
              stage.loadAssets(levelAssets);
            } ,390000);
            //stage.loadAssets(levelAssets);
            //setTimeout("this.stage.loadAssets(levelAssets)",2000);
            stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});


        });
        Q_little.scene("level1",function(stage) {
          
            var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 30, tileH: 30, type: Q.SPRITE_NONE });
            stage.insert(background);
            
            stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'blank', tileW: 30, tileH: 30 }));
          
            var player = stage.insert(new Q.Player({scale:1.5}));
            //stage.insert(new Q.wanderEnemy({x: 37*30, y: 69*30, asset: "slime.png"},stage,player));
            //stage.insert(new Q.wanderEnemy({x: 37*30, y: 80*30, asset: "slime.png"},stage,player));
            //stage.insert(new Q.wanderEnemy({x: 35*30, y: 82*30, asset: "slime.png"},stage,player));
            //stage.insert(new Q.wanderEnemy({x: 35*30, y: 84*30, asset: "slime.png"},stage,player));
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

        Q.scene("gameStats", function(stage) {
            var statsContainer = stage.insert(new Q.UI.Container({
                fill: "gray",
                x:  960/2,
                y: 20,
                border: 1,
                shadow: 3,
                shadowColor: "rgba(0,0,0,0.5)",
                w: 960,
                h: 40
                })
            );
            var lives = stage.insert(new Q.UI.Text({ 
                    label: "Lives x 10",
                    color: "white",
                    x: -300,
                    y: 0
                }),statsContainer);
            
            var coins = stage.insert(new Q.UI.Text({ 
                    label: "Points x 0",
                    color: "white",
                    x: 300,
                    y: 0
                }),statsContainer);
                
             
        });
        Q.scene("endGame",function(stage) {
            var pointsLabel = Q("UI.Text",999).items[1];
            alert("game over,your mark is " + pointsLabel.p.label);
            window.location = "";
        });
        Q.scene("winGame",function(stage) {
            //var pointsLabel = Q("UI.Text",999).items[1];
            alert("win the game by kill 100 enemys");
            window.location = "";
        });
        
        //load assets
        Q.load("skill.png,doge.png,hurt1.png,hurt2.png,explode.png,smallmap.png,life.png,direction.png,box.png, player.png, bullet.png, ba.png, liuli.png,zhilin.png,eval.png, level1.tmx,slime.png", function() {
          Q.sheet("tiles","smallmap.png", { tilew: 30, tileh: 30});
          Q.sheet("life","life.png", { tilew: 23*5, tileh: 23});  
          Q.sheet("blank","ba.png",{tilew:30,tileh:30});
          Q.sheet("bullet","bullet.png",{tilew:60, tileh:65, sx:0, sy:0});
          Q.sheet("liuli","liuli.png",{tilew: 58,tileh: 100,sx: 0,sy: 0,w:2000,h: 100}); 
          Q.sheet("zhilin","zhilin.png",{tilew: 58,tileh: 100,sx: 0,sy: 0,w: 2000,h: 100});
          Q.sheet("eval","eval.png",{tilew: 70,tileh: 100,sx: 0,sy: 0,w: 2000,h: 100});
          Q.sheet("box","box.png",{tilew:200,tileh:200,sx:0,sy:0,w:4400,h:200});
          Q.sheet("skill","skill.png",{tilew:200,tileh:200,sx:0,sy:0,w:600,h:200});
          Q.sheet("hurt1","hurt1.png",{tilew:100,tileh:100,sx:0,sy:0});
          Q.sheet("hurt2","hurt2.png",{tilew:300,tileh:291,sx:0,sy:0});
          Q.sheet("explode","explode.png",{tilew:150,tileh:128,sx:0,sy:0});
          Q.stageScene("level1");
          Q.stageScene("gameStats",999);
          Q_little.stageScene("level1");
          
        });
        
        
});