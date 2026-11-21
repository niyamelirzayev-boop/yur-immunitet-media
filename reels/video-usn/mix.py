import json, subprocess
sfx=json.load(open("sfx.json")); T=json.load(open("timeline.json")); total=T[-1]["start"]+T[-1]["dur"]+0.5
# луп бита 100 bpm: бочка на долях, хэт на слабых
beat=60/100; loop=4*beat
f=["-f","lavfi","-i",f"anullsrc=r=44100:cl=mono:d={loop}","-i","sfx/kick.wav","-i","sfx/hat.wav"]
fl=[]; ins=["[0]"]
for k in range(4):
    fl.append(f"[1]adelay={int(k*beat*1000)}[k{k}]"); ins.append(f"[k{k}]")
    fl.append(f"[2]adelay={int((k+0.5)*beat*1000)}[h{k}]"); ins.append(f"[h{k}]")
subprocess.run(["ffmpeg","-v","error","-y",*f,"-filter_complex",";".join(fl)+";"+"".join(ins)+f"amix={len(ins)}:normalize=0,atrim=0:{loop}","-ar","44100","sfx/loop.wav"],check=True)
inputs=["-i","vo/voice.wav","-stream_loop","-1","-i","sfx/loop.wav"]; fl=[]; mixes=[]
off={"stamp":0.33,"thud":0.33,"pop":0.0,"paper":0.05,"whoosh":0.0}
for i,e in enumerate(sfx):
    inputs+=["-i",f"sfx/{e['k']}.wav"]; d=int(max(0,(e["t"]+off[e["k"]])*1000))
    fl.append(f"[{i+2}]adelay={d}[s{i}]"); mixes.append(f"[s{i}]")
fl.append(f"[1]atrim=0:{total},volume=0.22[bed0]")
fl.append("[0]asplit=2[vo][sc]")
fl.append("[bed0][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[bed]")
fl.append(f"[vo][bed]{''.join(mixes)}amix={2+len(mixes)}:normalize=0,alimiter=limit=0.95,apad=whole_dur={total}[out]")
subprocess.run(["ffmpeg","-v","error","-y",*inputs,"-filter_complex",";".join(fl),"-map","[out]","-ar","44100","-ac","2","audio.m4a"],check=True)
print("audio ok", total, len(sfx),"sfx")
