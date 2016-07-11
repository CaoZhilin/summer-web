window.addEventListener("load",function(){
	var Q=Quintus().include("Sprites,UI,Input,Touch,Anim,Scenes").setup("example5").controls().touch();
	Q.Sprite.extend("evals",{
		init:function(p){
			this._super(p,{sheet:"evals",sprite:"evals",frame:0});
			this.add("animation");
		}
	});
	Q.animations('evals',{run:{frames:[0,1,2,3],rate:1/8,loop:true},die:{frames:[],rate:1/4},hurt:{frames:[],rate:1/2},no_stroke:{frames:[6],loop:false}});
	Q.scene('Game',function(stage){
		var evals=stage.insert(new Q.evals({x:150,y:150}));
		Q.load("liuli-ltr-small.png, sprites.json",function(){
			Q.compileSheets("liuli-ltr-small.png","sprites.json");
			Q.stageScene("Game");
		});
	});
});