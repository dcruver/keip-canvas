FROM rocm/dev-ubuntu-22.04:5.7

# Install Python and essentials
RUN apt update && apt install -y \
    python3-pip \
    python3-venv \
    git \
    && apt clean

# Create a virtual environment
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Upgrade pip + install ROCm-compatible PyTorch and HuggingFace tools
RUN pip install --upgrade pip && \
    pip install \
      torch==2.1.2+rocm5.6 \
      torchvision==0.16.2+rocm5.6 \
      torchaudio==2.1.2+rocm5.6 \
      --extra-index-url https://download.pytorch.org/whl/rocm5.6 && \
    pip install \
      numpy==1.26.4 \
      transformers==4.29.2 \
      peft==0.4.0 \
      accelerate==0.21.0 \
      datasets \
      pandas \
      sentencepiece \
      scikit-learn \
      safetensors \
      huggingface-hub

# Set environment variables for ROCm
ENV HSA_ENABLE_SDMA=0
ENV HIP_LAUNCH_BLOCKING=1

# --- Copy training files ---
WORKDIR /workspace
COPY . .

# --- Run the training script by default ---
CMD ["python3", "train_qwen3_lora.py"]
