# Makefile for building keip-canvas assistant with Ollama
# Model name: $(MODEL_NAME)
# Uses Modelfile in the current directory

# Default base model if none is provided
MODEL ?= qwen2.5-coder:7b

# Paths
TEMPLATE_FILE := Modelfile.template
TEMP_FILE := Modelfile

MODEL_NAME="keip-assistant"
.PHONY: all build run clean status config-local config-remote help

all: build

# Build the Modelfile.template
build:
	@echo "Building keip-assistant:latest with base model: $(MODEL)"
	@sed "s|{{BASE_MODEL}}|$(MODEL)|g" $(TEMPLATE_FILE) > $(TEMP_FILE)
	ollama create keip-assistant -f $(TEMP_FILE)
	@rm -f $(TEMP_FILE)
	@echo "Build complete. Tagged as keip-assistant:latest"

# Run the assistant in interactive mode
run:
	@echo "Running $(MODEL_NAME)..."
	ollama run $(MODEL_NAME)

# Show information about the model
status:
	@echo "Model information:"
	ollama show $(MODEL_NAME)

# Remove the model
clean:
	@echo "Removing $(MODEL_NAME)..."
	@rm -f $(TEMP_FILE)
	ollama rm $(MODEL_NAME)

# Configure for remote Ollama instance
# Configure for remote Ollama instance
config-ollama:
	@echo "Configuring for remote Ollama instance..."
	@read -p "Enter the Ollama server URL (e.g., http://localhost:11434): " remote_url; \
	if [ -f "../ui/.env" ]; then \
		sed -i.bak "s|^VITE_KEIP_ASSISTANT_OLLAMA_URL=.*|VITE_KEIP_ASSISTANT_OLLAMA_URL=$$remote_url|" ../ui/.env && rm -f ../ui/.env.bak; \
		echo "Updated VITE_KEIP_ASSISTANT_OLLAMA_URL to $$remote_url in ../ui/.env"; \
	else \
		echo "VITE_KEIP_ASSISTANT_OLLAMA_URL=$$remote_url" > ../ui/.env; \
		echo "Created ../ui/.env with VITE_KEIP_ASSISTANT_OLLAMA_URL=$$remote_url"; \
	fi

# Help target
help:
	@echo "Makefile for $(MODEL_NAME)"
	@echo ""
	@echo "Targets:"
	@echo "  all           - Default target, builds the model"
	@echo "  build         - Build the assistant model from Modelfile"
	@echo "  run           - Run the assistant in interactive mode"
	@echo "  status        - Show information about the model"
	@echo "  clean         - Remove the model"
	@echo "  config-ollama - Configure the Ollama URL (local or remote)"
	@echo "  help          - Show this help message"
