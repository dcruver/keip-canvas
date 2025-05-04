import os
import torch
import pandas as pd
import csv
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType

# Clear GPU cache
torch.cuda.empty_cache()

from transformers import Trainer

class NoOpTrainer(Trainer):
    def _move_model_to_device(self, model, device):
        # Override to prevent .to() on meta tensors
        return model

# === Load and prepare dataset ===
print("Loading dataset...")
df = pd.read_csv("training_examples.csv", quoting=csv.QUOTE_ALL)
dataset = Dataset.from_list([
    {"text": f"{row['prompt']}\n\n{row['response']}"}
    for _, row in df.iterrows()
])

# === Tokenizer ===
print("Setting up tokenizer...")
model_name = "Qwen/Qwen3-8B"

tokenizer = AutoTokenizer.from_pretrained(
    model_name,
    trust_remote_code=True
)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

def tokenize(example):
    return tokenizer(
        example["text"],
        padding="max_length",
        truncation=True,
        max_length=128
    )

print("Tokenizing dataset...")
tokenized_dataset = dataset.map(tokenize, batched=True, remove_columns=["text"])
print(f"Dataset prepared with {len(tokenized_dataset)} examples")

# === LoRA Config ===
print("Configuring LoRA...")
peft_config = LoraConfig(
    r=8,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

# === Model init function to avoid meta tensor crash ===
def model_init():
    print("Loading model with LoRA inside model_init...")
    base_model = AutoModelForCausalLM.from_pretrained(
        model_name,
        trust_remote_code=True,
        torch_dtype=torch.float16,
        device_map="auto",
        low_cpu_mem_usage=True
    )
    lora_model = get_peft_model(base_model, peft_config)
    lora_model.print_trainable_parameters()
    return lora_model

# === Training Arguments ===
print("Setting up training args...")
training_args = TrainingArguments(
    output_dir="./lora-adapter",
    num_train_epochs=10,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    logging_dir="./logs",
    logging_steps=10,
    save_strategy="epoch",
    save_total_limit=3,
    learning_rate=2e-5,
    fp16=True,
    remove_unused_columns=False,
    report_to="none",
    dataloader_pin_memory=True,
    gradient_checkpointing=True,
    ddp_find_unused_parameters=False,
    label_names=["labels"],
    resume_from_checkpoint=True
)

# === Trainer ===
print("Creating Trainer...")
trainer = NoOpTrainer(
    model_init=model_init,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

# === Train ===
print("Starting training...")
trainer.train(resume_from_checkpoint=None)

# === Save Adapter ===
print("Saving final LoRA adapter...")
trainer.model.save_pretrained("./lora-adapter-final")
print("Training completed successfully!")

