import pandas as pd
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    BitsAndBytesConfig,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType
import torch
import csv

# === Load CSV ===
df = pd.read_csv("training_examples.csv", quoting=csv.QUOTE_ALL)  # Your CSV path

# === Format to match Modelfile template ===
dataset = Dataset.from_list([
    {
        "text": f"<|im_start|>user\n{row['prompt']}<|im_end|>\n<|im_start|>assistant\n{row['response']}<|im_end|>"
    }
    for _, row in df.iterrows()
])

# === Model Setup ===
model_name = "Qwen/Qwen3-14B"

brb_config = None

tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True, use_fast=False)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    trust_remote_code=True,
    device_map="auto"
)

# === LoRA Config ===
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"]
)

model = get_peft_model(model, peft_config)

# === Tokenize ===
def tokenize(example):
    return tokenizer(example["text"], truncation=True, padding="max_length", max_length=2048)

tokenized_dataset = dataset.map(tokenize)

# === Training ===
training_args = TrainingArguments(
    output_dir="./qwen3-lora-checkpoints",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    num_train_epochs=10,
    learning_rate=1e-4,
    logging_steps=1,
    save_strategy="epoch",
    fp16=False,
    report_to="none"
)

trainer = Trainer(
    model=model,
    tokenizer=tokenizer,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

trainer.train()

# === Save Adapter ===
model.save_pretrained("./qwen3-lora-adapter")
tokenizer.save_pretrained("./qwen3-lora-adapter")
