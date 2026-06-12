/* ===== THEME TOGGLE ===== */
const html = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

themeBtn.addEventListener('click', () => {
  document.body.classList.add('theme-transitioning');
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setTimeout(() => document.body.classList.remove('theme-transitioning'), 400);
});

/* ===== TYPEWRITER ===== */
const titles = ['Software Engineer','Full-Stack Developer','ML / AI Enthusiast','Data Science Explorer','Indie Builder'];
let tIdx=0,cIdx=0,deleting=false;
const typedEl=document.getElementById('typed-text');
function typeLoop(){
  const cur=titles[tIdx];
  if(deleting){typedEl.textContent=cur.substring(0,cIdx--);if(cIdx<0){deleting=false;tIdx=(tIdx+1)%titles.length;setTimeout(typeLoop,420);return;}setTimeout(typeLoop,42);}
  else{typedEl.textContent=cur.substring(0,cIdx++);if(cIdx>cur.length){deleting=true;setTimeout(typeLoop,1700);return;}setTimeout(typeLoop,78);}
}
typeLoop();

/* ===== NAV SCROLL ===== */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), {passive:true});

/* ===== HAMBURGER / MOBILE NAV ===== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
const mobileClose = document.getElementById('nav-mobile-close');

function openMenu(){
  navLinks.classList.add('open');
  document.body.style.overflow='hidden';
  const spans=hamburger.querySelectorAll('span');
  spans[0].style.transform='rotate(45deg) translate(5px,5px)';
  spans[1].style.opacity='0';
  spans[2].style.transform='rotate(-45deg) translate(5px,-5px)';
}
function closeMenu(){
  navLinks.classList.remove('open');
  document.body.style.overflow='';
  const spans=hamburger.querySelectorAll('span');
  spans.forEach(s=>{s.style.transform='';s.style.opacity='';});
}

hamburger.addEventListener('click', ()=> navLinks.classList.contains('open') ? closeMenu() : openMenu());
if(mobileClose) mobileClose.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMenu));

/* ===== PARTICLES (hero) ===== */
const particleContainer=document.getElementById('hero-particles');
for(let i=0;i<28;i++){
  const p=document.createElement('div');
  p.className='particle';
  const size=Math.random()*3+1;
  p.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*100}%;bottom:${Math.random()*-10}%;--dx:${(Math.random()-.5)*120}px;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*10}s;`;
  particleContainer.appendChild(p);
}

/* ===== INTERACTIVE CANVAS BACKGROUND ===== */
(function(){
  const canvas=document.getElementById('bg-canvas');
  const ctx=canvas.getContext('2d');
  let W,H,mouse={x:-999,y:-999},ripples=[],time=0;

  function resize(){
    W=canvas.width=window.innerWidth;
    H=canvas.height=window.innerHeight;
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  /* ---- color helper ---- */
  function accentColor(alpha=1){
    return html.getAttribute('data-theme')==='light'
      ? `rgba(58,111,216,${alpha})`
      : `rgba(91,141,238,${alpha})`;
  }
  function accent2Color(alpha=1){
    return html.getAttribute('data-theme')==='light'
      ? `rgba(124,58,237,${alpha})`
      : `rgba(167,139,250,${alpha})`;
  }

  /* ---- Ripple on click/touch ---- */
  function addRipple(x,y){
    ripples.push({x,y,r:0,maxR:Math.random()*160+80,alpha:0.7,speed:Math.random()*3+2.5,color:Math.random()>.5?'accent':'accent2'});
    if(ripples.length>18) ripples.shift();
  }
  window.addEventListener('click',e=>addRipple(e.clientX,e.clientY));
  window.addEventListener('touchstart',e=>{
    Array.from(e.touches).forEach(t=>addRipple(t.clientX,t.clientY));
  },{passive:true});
  window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;},{passive:true});

  /* ---- Flowing orbs ---- */
  const orbs=Array.from({length:6},(_,i)=>({
    x:Math.random()*1000,y:Math.random()*800,
    vx:(Math.random()-.5)*0.35,vy:(Math.random()-.5)*0.35,
    r:Math.random()*180+80,
    phase:Math.random()*Math.PI*2,
    speed:Math.random()*0.004+0.002,
    hue:i%2
  }));

  /* ---- Wandering lines ---- */
  const lineNodes=Array.from({length:7},()=>({
    x:Math.random()*1200,y:Math.random()*800,
    vx:(Math.random()-.5)*0.5,vy:(Math.random()-.5)*0.5,
  }));

  /* ---- Bubbles ---- */
  const bubbles=Array.from({length:14},()=>({
    x:Math.random()*1200,y:Math.random()*800+200,
    r:Math.random()*18+5,
    vx:(Math.random()-.5)*0.3,
    vy:-(Math.random()*0.4+0.15),
    alpha:Math.random()*0.35+0.05,
    wobble:Math.random()*Math.PI*2,
    wobbleSpeed:Math.random()*0.03+0.01
  }));

  /* ---- Spinning ring ---- */
  const ring={x:0,y:0,r:120,angle:0,speed:0.006};

  function draw(){
    ctx.clearRect(0,0,W,H);
    time+=0.012;

    /* == flowing orbs == */
    orbs.forEach(o=>{
      o.x+=o.vx; o.y+=o.vy;
      if(o.x<-o.r)o.x=W+o.r; if(o.x>W+o.r)o.x=-o.r;
      if(o.y<-o.r)o.y=H+o.r; if(o.y>H+o.r)o.y=-o.r;
      // mouse repel
      const dx=o.x-mouse.x, dy=o.y-mouse.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<220){
        const force=(220-dist)/220*0.6;
        o.x+=dx/dist*force; o.y+=dy/dist*force;
      }
      const pulse=Math.sin(time*o.speed*80+o.phase)*0.3+0.7;
      const grad=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r*pulse);
      const col=o.hue===0?accentColor:accent2Color;
      grad.addColorStop(0,col(0.07));
      grad.addColorStop(1,col(0));
      ctx.beginPath();
      ctx.arc(o.x,o.y,o.r*pulse,0,Math.PI*2);
      ctx.fillStyle=grad;
      ctx.fill();
    });

    /* == wandering curve through line nodes == */
    lineNodes.forEach(n=>{
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>W) n.vx*=-1;
      if(n.y<0||n.y>H) n.vy*=-1;
    });
    if(lineNodes.length>=2){
      ctx.beginPath();
      ctx.moveTo(lineNodes[0].x,lineNodes[0].y);
      for(let i=1;i<lineNodes.length-1;i++){
        const mx=(lineNodes[i].x+lineNodes[i+1].x)/2;
        const my=(lineNodes[i].y+lineNodes[i+1].y)/2;
        ctx.quadraticCurveTo(lineNodes[i].x,lineNodes[i].y,mx,my);
      }
      ctx.strokeStyle=accentColor(0.12);
      ctx.lineWidth=1.5;
      ctx.stroke();
    }

    /* == second whirling spiral == */
    const sx=W*0.78+Math.cos(time*0.18)*60;
    const sy=H*0.22+Math.sin(time*0.14)*40;
    ctx.beginPath();
    for(let a=0;a<Math.PI*8;a+=0.08){
      const sr=a*7;
      const px=sx+Math.cos(a+time*0.4)*sr;
      const py=sy+Math.sin(a+time*0.4)*sr;
      a===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.strokeStyle=accent2Color(0.06);
    ctx.lineWidth=1;
    ctx.stroke();

    /* == floating bubbles == */
    bubbles.forEach(b=>{
      b.x+=b.vx;
      b.y+=b.vy;
      b.wobble+=b.wobbleSpeed;
      b.x+=Math.sin(b.wobble)*0.4;
      if(b.y<-b.r*2){
        b.y=H+b.r;
        b.x=Math.random()*W;
      }
      if(b.x<-b.r||b.x>W+b.r) b.x=Math.random()*W;
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.strokeStyle=accentColor(b.alpha);
      ctx.lineWidth=1;
      ctx.stroke();
      // inner shimmer
      ctx.beginPath();
      ctx.arc(b.x-b.r*0.25,b.y-b.r*0.25,b.r*0.22,0,Math.PI*2);
      ctx.fillStyle=accentColor(b.alpha*0.5);
      ctx.fill();
    });

    /* == spinning ring near top-right == */
    ring.x=W*0.85; ring.y=H*0.15;
    ring.angle+=ring.speed;
    for(let i=0;i<3;i++){
      const offset=i*(Math.PI*2/3);
      ctx.beginPath();
      ctx.arc(ring.x,ring.y,ring.r*(1-i*0.15),ring.angle+offset,ring.angle+offset+Math.PI*1.3);
      ctx.strokeStyle=i===0?accentColor(0.12):accent2Color(0.08);
      ctx.lineWidth=i===0?2:1;
      ctx.stroke();
    }

    /* == click ripples == */
    ripples=ripples.filter(rp=>rp.alpha>0.01);
    ripples.forEach(rp=>{
      rp.r+=rp.speed;
      rp.alpha*=0.94;
      ctx.beginPath();
      ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
      const col=rp.color==='accent'?accentColor(rp.alpha):accent2Color(rp.alpha);
      ctx.strokeStyle=col;
      ctx.lineWidth=1.5;
      ctx.stroke();
      // second inner ring
      if(rp.r>20){
        ctx.beginPath();
        ctx.arc(rp.x,rp.y,rp.r*0.55,0,Math.PI*2);
        ctx.strokeStyle=rp.color==='accent'?accentColor(rp.alpha*0.5):accent2Color(rp.alpha*0.5);
        ctx.lineWidth=1;
        ctx.stroke();
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el){
  const target=parseInt(el.dataset.count||el.textContent,10);
  const suffix=el.dataset.suffix||(el.dataset.count?'+':'');
  const duration=1600,start=performance.now();
  function tick(now){
    const p=Math.min((now-start)/duration,1);
    const e=1-Math.pow(1-p,3);
    el.textContent=Math.floor(e*target)+suffix;
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ===== INTERSECTION OBSERVER ===== */
const io=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('visible');
    io.unobserve(entry.target);
  });
},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.fade-up,.timeline-item,.project-card,.achievement-item,.skill-category').forEach((el,i)=>{
  el.style.transitionDelay=`${(i%5)*65}ms`;
  io.observe(el);
});
const heroStatObserver=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.stat-num').forEach(animateCounter);heroStatObserver.unobserve(e.target);}});
},{threshold:.5});
const heroStats=document.querySelector('.hero-stats');
if(heroStats) heroStatObserver.observe(heroStats);

/* ===== TIMELINE PULSE ===== */
const tlObserver=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('tl-active');
      setTimeout(()=>e.target.classList.remove('tl-active'),1800);
    }
  });
},{threshold:.4});
document.querySelectorAll('.timeline-item').forEach(el=>tlObserver.observe(el));

/* ===== ACTIVE NAV ===== */
const sections=document.querySelectorAll('section[id]');
const navAs=document.querySelectorAll('.nav-links a[href^="#"]');
window.addEventListener('scroll',()=>{
  let current='';
  sections.forEach(s=>{if(window.scrollY>=s.offsetTop-130)current=s.id;});
  navAs.forEach(a=>{
    const active=a.getAttribute('href')===`#${current}`;
    a.style.color=active?'var(--accent)':'';
    a.style.fontWeight=active?'700':'';
  });
},{passive:true});

/* ===== MODAL ===== */
const overlay=document.getElementById('modal-overlay');
const modalClose=document.getElementById('modal-close');

function openModal(data){
  document.getElementById('modal-icon').textContent=data.icon||'';
  document.getElementById('modal-meta').textContent=data.meta||'';
  document.getElementById('modal-title').textContent=data.title||'';
  document.getElementById('modal-subtitle').textContent=data.subtitle||'';
  const body=document.getElementById('modal-body');
  body.innerHTML='';
  if(data.desc){const p=document.createElement('p');p.textContent=data.desc;p.style.marginBottom='14px';body.appendChild(p);}
  if(data.points){
    const pts=data.points.split('|');
    const ul=document.createElement('ul');ul.className='modal-points';
    pts.forEach(pt=>{const li=document.createElement('li');li.textContent=pt.trim();ul.appendChild(li);});
    body.appendChild(ul);
  }
  const techEl=document.getElementById('modal-tech');techEl.innerHTML='';
  if(data.tech){
    data.tech.split(',').forEach(t=>{
      const span=document.createElement('span');span.className='modal-tech-badge';span.textContent=t.trim();techEl.appendChild(span);
    });
  }
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
  modalClose.focus();
}
function closeModal(){overlay.classList.remove('open');document.body.style.overflow='';}

document.querySelectorAll('[data-modal]').forEach(el=>{
  el.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    openModal({
      icon:el.dataset.icon,title:el.dataset.title,subtitle:el.dataset.subtitle||'',
      meta:el.dataset.meta||'',desc:el.dataset.desc||'',
      points:el.dataset.points||'',tech:el.dataset.tech||''
    });
  });
});
modalClose.addEventListener('click',closeModal);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* ===== CONTACT FORM ===== */
document.getElementById('contact-form').addEventListener('submit',function(e){
  e.preventDefault();
  const toast=document.getElementById('toast');
  const btn=this.querySelector('.form-submit');
  btn.textContent='Sending…';btn.disabled=true;
  setTimeout(()=>{
    toast.classList.add('show');this.reset();
    btn.textContent='Send message →';btn.disabled=false;
    setTimeout(()=>toast.classList.remove('show'),4500);
  },900);
});
