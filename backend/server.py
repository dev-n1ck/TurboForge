import os
import subprocess
import uuid
import time
from pathlib import Path
from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

ROOT = Path(__file__).parent.parent
SD_BIN_DIR = ROOT / "sd_bin"
SD_EXE = str(SD_BIN_DIR / "sd-cli.exe")
MODEL_PATH = str(ROOT / "models" / "zimage" / "Z_IMAGE_TURBO_Q4_0.gguf")
OUTDIR = str(ROOT / "outputs")

os.makedirs(OUTDIR, exist_ok=True)

DEFAULT_VAE_PATH = str(ROOT / "models" / "vae" / "ae.safetensors")
DEFAULT_LLM_PATH = str(ROOT / "models" / "llm" / "QWEN3_4B_Q4_K_M.gguf")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate")
async def generate_image(
    prompt: str = Form(...),
    negative_prompt: str = Form(""),
    width: int = Form(512),
    height: int = Form(512),
    steps: int = Form(8),
    seed: int = Form(-1),
    cfg_scale: float = Form(1.5),
    sampling_method: str = Form("euler")
):
    uid = uuid.uuid4().hex[:8]
    out_file = os.path.join(OUTDIR, f"out_{uid}.png")
    
    cmd_args = [
        f'"{SD_EXE}"',
        f'--diffusion-model "{MODEL_PATH}"',
        f'--vae "{DEFAULT_VAE_PATH}"',
        f'--llm "{DEFAULT_LLM_PATH}"',
        f'-p "{prompt}"',
        f'--cfg-scale {cfg_scale}',
        f'--steps {steps}',
        f'-H {height}',
        f'-W {width}',
        f'-o "{out_file}"',
        f'--seed {seed}',
        f'--sampling-method {sampling_method}'
    ]
    
    if negative_prompt:
        cmd_args.append(f'-n "{negative_prompt}"')

    cmd = " ".join(cmd_args)
    print("Running:", cmd)
    
    t0 = time.perf_counter()
    proc = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    t1 = time.perf_counter()
    
    if proc.returncode != 0:
        print("Error output:", proc.stdout)
        return JSONResponse(status_code=500, content={"error": "Generation failed", "details": proc.stdout})

    if not os.path.exists(out_file):
        return JSONResponse(status_code=500, content={"error": "Output file not found"})

    return {"url": f"/outputs/out_{uid}.png", "time": round(t1 - t0, 2), "log": proc.stdout}

# Mount outputs directory to serve generated images
app.mount("/outputs", StaticFiles(directory=OUTDIR), name="outputs")

# Mount frontend dist directory to serve the React app
frontend_dist = ROOT / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {"message": "FRONTEND BUILD NOT FOUND. RUN 'npm run build' INSIDE FRONTEND DIRECTORY."}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=9000, reload=True)
