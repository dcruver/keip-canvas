import torch
import pandas as pd
import csv
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import LoraConfig, get_peft_model, TaskType
from torch.utils.data import DataLoader
from tqdm import tqdm
from transformers import default_data_collator

# === Load dataset ===
df = pd.read_csv("training_examples.csv", quoting=csv.QUOTE_ALL)
dataset = Dataset.from_list([
    {"text": f"{row['prompt']}\n\n{row['response']}"}
    for _, row in df.iterrows()
])

# === Tokenizer ===
model_name = "Qwen/Qwen3-8B"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

def tokenize(example):
    tokens = tokenizer(
        example["text"],
        padding="max_length",
        truncation=True,
        max_length=512
    )
    tokens["labels"] = tokens["input_ids"].copy()
    return tokens

tokenized_dataset = dataset.map(tokenize, batched=True)
dataloader = DataLoader(tokenized_dataset, batch_size=1, collate_fn=default_data_collator)

# === Model + LoRA ===
base_model = AutoModelForCausalLM.from_pretrained(
    model_name,
    trust_remote_code=True,
    torch_dtype=torch.float16,
    device_map="auto"
)

peft_config = LoraConfig(
    r=8,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(base_model, peft_config)
model.config.use_cache = False
model.train()

# === Optimizer ===
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)

# === Training loop ===
for epoch in range(3):
    print(f"Epoch {epoch + 1}")
    total_loss = 0
    for batch in tqdm(dataloader):
        inputs = {k: v.to(model.device) for k, v in batch.items()}
        outputs = model(**inputs)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        total_loss += loss.item()
    print(f"Epoch loss: {total_loss:.4f}")

# === Save adapter ===
model.save_pretrained("./lora-adapter-final")
print("✅ LoRA adapter saved.")

