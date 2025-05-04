from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen3-8B", trust_remote_code=True, torch_dtype="auto")
lora_model = PeftModel.from_pretrained(base_model, "./lora-adapter-final")
merged_model = lora_model.merge_and_unload()
merged_model.save_pretrained("./qwen3-8b-merged")

