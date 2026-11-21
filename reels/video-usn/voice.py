# Озвучка по сегментам: Piper (мужской голос) + «эмоция» через темп/высоту/громкость
import json, subprocess, wave, sys, os
V="/tmp/claude-0/-home-user-yur-immunitet-media/13065014-440d-5b38-b632-7d2976d91255/scratchpad/voices/"
MODEL=V+(sys.argv[1] if len(sys.argv)>1 else "ru_RU-dmitri-medium")+".onnx"
# emo: (length_scale, pitch_factor, volume_db, noise_scale)
EMO={"energy":(0.86,1.06,2,0.75),"irony":(1.0,0.97,0,0.7),"serious":(1.02,0.95,0,0.6),
     "sarcasm":(1.08,0.94,0,0.8),"sad":(1.1,0.93,-1,0.6),"brisk":(0.9,1.02,1,0.7),"warm":(0.98,1.0,0,0.7)}
segs=json.load(open("script.json"))
os.makedirs("vo",exist_ok=True); out=[]
for i,s in enumerate(segs):
    ls,pf,vol,ns=EMO[s["emo"]]
    raw=f"vo/raw{i}.wav"; fin=f"vo/s{i}.wav"
    subprocess.run(["python3","-m","piper","-m",MODEL,"-f",raw,"--length-scale",str(ls),"--noise-scale",str(ns),"--sentence-silence","0.25"],input=s["say"].encode(),check=True,capture_output=True)
    sr=wave.open(raw).getframerate()
    # смещение высоты без изменения темпа: asetrate*pf, затем atempo 1/pf
    af=f"asetrate={int(sr*pf)},aresample=44100,atempo={1/pf:.4f},volume={vol}dB,apad=pad_dur=0.35"
    subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-af",af,"-ac","1","-ar","44100",fin],check=True)
    d=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",fin]))
    out.append({**s,"dur":round(d,3)})
t=0
for s in out: s["start"]=round(t,3); t+=s["dur"]
json.dump(out,open("timeline.json","w"),ensure_ascii=False,indent=1)
open("vo/list.txt","w").write("".join(f"file 's{i}.wav'\n" for i in range(len(out))))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i","vo/list.txt","-c","copy","vo/voice.wav"],check=True)
print("total",round(t,2)); [print(round(s["start"],1),s["dur"],s["style"],s["emo"]) for s in out]
