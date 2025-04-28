# Keip Canvas Assistant

This repository contains the necessary files to build and run the Keip Canvas Assistant using Ollama. The assistant helps with creating flow diagrams in the Keip Canvas UI.

## Overview

The Keip Canvas UI provides experimental support for generative AI models to aid in creating flow diagrams. The Canvas can integrate with LLMs running through [Ollama](https://github.com/ollama/ollama).

The `keip-assistant:32b` model is designed to help users create and modify flow diagrams through natural language interactions.

## Setup Options

You have two main options for using the Keip Canvas Assistant:

1. **Local Setup**: Build and run the model on your local machine
2. **Team Environment**: Connect to an existing team Ollama instance where the model is already deployed

## Option 1: Local Setup

### Prerequisites
- [Ollama](https://github.com/ollama/ollama) installed on your system
- The Modelfile and Makefile from this repository

### Step 1: Install Ollama
Install [Ollama](https://github.com/ollama/ollama?tab=readme-ov-file#ollama) following the instructions for your platform.

### Step 2: Build the Assistant Model
Navigate to the directory containing the Modelfile and Makefile, then run:

```bash
make build
```

This command creates a model named `keip-assistant:32b` using the specifications in the Modelfile.

### Step 3: Configure Ollama URL
Configure the Keip Canvas UI to use your Ollama instance (local or remote):

```bash
make config-ollama
```

When prompted, enter the Ollama URL:
- For local development, use the default (`http://localhost:11434`) by pressing Enter
- For a remote instance, enter the complete URL (e.g., `http://team-server:11434`)

This will update the `../ui/.env` file with the appropriate URL.

### Step 4: Verify the Model
To check that the model was built successfully:

```bash
make status
```

### Step 5: Start Your Local Keip Canvas UI
Start your local instance of the Keip Canvas UI. The `KeipAssistant` button should be enabled in the bottom toolbar.

## Option 2: Team Environment

If your team already has a shared Ollama instance with the `keip-assistant:32b` model installed:

### Step 1: Configure Your Keip Canvas
Update your Keip Canvas configuration to point to the team's Ollama instance:

```bash
make config-ollama
```

When prompted, enter the URL of your team's Ollama instance (e.g., `http://team-server:11434`).

### Step 2: Start Your Keip Canvas UI
Start your Keip Canvas UI with the configuration pointing to the team's Ollama instance. The `KeipAssistant` button should be enabled in the bottom toolbar.

## Using the Assistant

### Through the Keip Canvas UI
1. Start the Keip Canvas UI
2. Click the `KeipAssistant` button in the bottom toolbar to open the chat panel
3. Interact with the assistant using natural language

### Direct Interaction with Ollama
For testing or debugging, you can interact directly with the model:

```bash
make run
```

Or with the Ollama CLI:

```bash
ollama run keip-assistant:32b
```

## Example Prompts

Try these example prompts with the assistant:

```
Return a flow that listens to a JMS topic and forwards the message out to a Kafka topic
```

Followed by:

```
Add a correlation id header to the message before sending to Kafka
```

Note: The existing diagram is included in the chat context, allowing the assistant to understand and modify the current state of your flow diagram.

## Makefile Commands

The included Makefile provides several useful commands:

- `make build` - Build the assistant model
- `make run` - Run the assistant in interactive mode
- `make status` - Show information about the model
- `make clean` - Remove the model
- `make config-ollama` - Configure the Ollama URL (local or remote)
- `make help` - Display help information

## Customization

To customize the assistant, modify the Modelfile before building. The Modelfile contains the model's configuration, including its base model, system prompts, and other parameters.

## Troubleshooting

- If you encounter build errors, check that Ollama is properly installed and running
- For connection issues with remote Ollama, verify network connectivity and firewall settings
- Ensure you have sufficient disk space for the model
- Verify that your system meets the minimum requirements for running 32B parameter models
- Check Ollama's [troubleshooting suggestions](https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md) for common issues

## License

Please refer to the LICENSE file for information about using and distributing this model.

