/* Fond néon plein page : halos animés + grille + grain. Un seul fichier pour toutes les pages. */
(function(){
  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var INK='#070810',S=.5;

  /* calque 1 : halos animés (canvas basse résolution, étiré par le CSS) */
  var c=document.createElement('canvas');
  c.setAttribute('aria-hidden','true');
  c.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:-3;pointer-events:none;background:'+INK;
  document.body.prepend(c);
  var g=c.getContext('2d');
  if(!g)return;

  /* calque 2 : grille fine, plus visible en haut de l'écran */
  var grid=document.createElement('div');
  grid.setAttribute('aria-hidden','true');
  grid.style.cssText='position:fixed;inset:0;z-index:-2;pointer-events:none;'
    +'background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);'
    +'background-size:56px 56px;'
    +'-webkit-mask-image:radial-gradient(ellipse at 50% 25%,#000,transparent 78%);mask-image:radial-gradient(ellipse at 50% 25%,#000,transparent 78%)';
  document.body.prepend(grid);

  /* calque 3 : grain de film */
  var grain=document.createElement('div');
  grain.setAttribute('aria-hidden','true');
  grain.style.cssText='position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.07;'
    +'background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")';
  document.body.prepend(grain);

  /* halos : position de base, rayon, couleur, opacité, vitesses */
  var B=[
    {x:.12,y:.18,r:.60,c:'255,61,139',a:.20,sx:.13,sy:.09,p:0},
    {x:.88,y:.30,r:.65,c:'138,91,255',a:.24,sx:.10,sy:.12,p:2},
    {x:.28,y:.78,r:.60,c:'61,240,255',a:.15,sx:.11,sy:.08,p:4},
    {x:.90,y:.88,r:.55,c:'255,61,139',a:.15,sx:.09,sy:.10,p:1}
  ];
  var W,H,mx=0,my=0,t=0,last=performance.now(),frame=0;

  function size(){W=c.width=Math.ceil(innerWidth*S);H=c.height=Math.ceil(innerHeight*S)}

  function draw(){
    g.globalCompositeOperation='source-over';
    g.fillStyle=INK;g.fillRect(0,0,W,H);
    g.globalCompositeOperation='lighter';
    var max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    var sc=Math.min(1,scrollY/max);              /* 0 en haut, 1 en bas : fait glisser les halos au scroll */
    var R=Math.max(W,H);
    B.forEach(function(b,i){
      var x=(b.x+Math.sin(t*b.sx+b.p)*.12+mx*.03*(i+1))*W;
      var y=(b.y+Math.cos(t*b.sy+b.p)*.10+my*.02*(i+1)+(i%2?-.3:.3)*sc)*H;
      var r=b.r*R;
      var gr=g.createRadialGradient(x,y,0,x,y,r);
      gr.addColorStop(0,'rgba('+b.c+','+b.a+')');
      gr.addColorStop(1,'rgba('+b.c+',0)');
      g.fillStyle=gr;g.fillRect(0,0,W,H);
    });
  }

  size();draw();
  addEventListener('resize',function(){size();draw()});
  if(rm)return;                                   /* mouvement réduit : image fixe */

  addEventListener('pointermove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
  (function loop(now){
    requestAnimationFrame(loop);
    if(document.hidden||now-last<33)return;       /* environ 30 images par seconde */
    t+=(now-last)/1000;last=now;draw();
  })(last);
})();
