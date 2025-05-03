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

# === Environment Setup for ROCm ===
os.environ["HIP_LAUNCH_BLOCKING"] = "1"
os.environ["HSA_ENABLE_SDMA"] = "0"

# Clear GPU cache
torch.cuda.empty_cache()

# === Load and prepare dataset ===
print("Loading dataset...")
df = pd.read_csv("training_examples.csv", quoting=csv.QUOTE_ALL)
dataset = Dataset.from_list([
    {"text": f"{row['prompt']}\n\n{row['response']}"}
    for _, row in df.iterrows()
])

# === Tokenizer ===
print("Setting up tokenizer...")
model_name = "facebook/opt-125m"  # Tiny model for testing

tokenizer = AutoTokenizer.from_pretrained(model_name)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

def tokenize(example):
    return tokenizer(
        example["text"],
        padding="max_length",
        truncation=True,
        max_length=128  # Very short for memory efficiency
    )

print("Tokenizing dataset...")
tokenized_dataset = dataset.map(tokenize, batched=True, remove_columns=["text"])
print(f"Dataset prepared with {len(tokenized_dataset)} examples")

# === Model ===
print("Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32  # Use float32 for ROCm compatibility
)

# Move model to GPU
print("Moving model to GPU...")
model = model.to("cuda")

print("Configuring LoRA...")
peft_config = LoraConfig(
    r=4,  # Very small rank
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

print("Applying LoRA adapter...")
model = get_peft_model(model, peft_config)
model.print_trainable_parameters()

# === Training Arguments - Ultra Simple ===
print("Setting up training...")
training_args = TrainingArguments(
    output_dir="./lora-adapter",
    num_train_epochs=3,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=1,  # No accumulation for simplicity
    logging_dir="./logs",
    logging_steps=1,  # Log every step
    save_strategy="epoch",
    save_total_limit=1,
    learning_rate=5e-5,  # Lower learning rate
    fp16=False,  # No fp16 on ROCm
    remove_unused_columns=False,
    report_to="none",
    dataloader_pin_memory=False,
    # Disable any potentially problematic features
    gradient_checkpointing=False,
    ddp_find_unused_parameters=False,
    label_names=["labels"]
)

print("Creating trainer...")
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

print("Starting training...")
try:
    trainer.train()
    print("Saving LoRA adapter...")
    model.save_pretrained("./lora-adapter")
    print("Training completed successfully!")
except Exception as e:
    print(f"Training failed with error: {e}")
    import traceback
    traceback.print_exc()
    
    # If training fails, try a completely custom training loop
    print("\n\nAttempting custom training loop...")
    try:
        # Reset model and optimizer
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32
        ).to("cuda")
        
        model = get_peft_model(model, peft_config)
        optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)
        
        # Create dataloader
        from torch.utils.data import DataLoader
        train_dataloader = DataLoader(tokenized_dataset, batch_size=1)
        
        # Simple training loop
        model.train()
        for epoch in range(3):
            print(f"Epoch {epoch+1}/3")
            total_loss = 0
            
            for i, batch in enumerate(train_dataloader):
                # Move batch to device
                inputs = {k: v.to("cuda") for k, v in batch.items()}
                inputs["labels"] = inputs["input_ids"].clone()
                
                # Forward pass
                outputs = model(**inputs)
                loss = outputs.loss
                
                # Backward pass and optimize
                loss.backward()
                optimizer.step()
                optimizer.zero_grad()
                
                # Log
                total_loss += loss.item()
                print(f"Step {i+1}, Loss: {loss.item():.4f}")
                
                # Save frequently
                if (i + 1) % 10 == 0:
                    model.save_pretrained(f"./lora-adapter-step-{i+1}")
            
            # Save epoch checkpoint
            print(f"Epoch {epoch+1} completed, Avg Loss: {total_loss/(i+1):.4f}")
            model.save_pretrained(f"./lora-adapter-epoch-{epoch+1}")
        
        # Final save
        print("Saving final LoRA adapter...")
        model.save_pretrained("./lora-adapter-final")
        print("Custom training completed successfully!")
    except Exception as e2:
        print(f"Custom training also failed with error: {e2}")
        traceback.print_exc()
