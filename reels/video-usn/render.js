const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
const mode=process.argv[2]||'preview';
(async()=>{
 const tl=fs.readFileSync('timeline.json','utf8');
 fs.writeFileSync('_reel.html',fs.readFileSync('reel.html','utf8').replace('__TIMELINE__',tl));
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.goto('file://'+process.cwd()+'/_reel.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
 const total=await p.evaluate(()=>TOTAL);fs.writeFileSync('sfx.json',JSON.stringify(await p.evaluate(()=>SFX)));
 if(mode==='preview'){
  const ts=process.argv.slice(3).map(Number);fs.mkdirSync('prev',{recursive:true});
  for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`prev/t${t}.jpg`,type:'jpeg',quality:80});}
 } else {
  const fps=30,n=Math.ceil(total*fps);
  const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',''+fps,'-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','20','video_noaudio.mp4']);
  for(let i=0;i<n;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:92});
   if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r)); if(i%150==0)console.log(i,'/',n);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));
 }
 await b.close();console.log('total',total);
})();
