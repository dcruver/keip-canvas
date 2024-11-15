# Keip Assistant

The Keip Canvas UI provides experimental support for generative AI models to aid in creating flow diagrams.

The Canvas can integrate with LLMs running locally. As of now, only [Ollama](https://github.com/ollama/ollama) is
supported as the LLM runner.

## Setup Instructions

- Install [Ollama](https://github.com/ollama/ollama?tab=readme-ov-file#ollama)
- To allow the Canvas UI to access the local Ollama server, add the following web origin:
  ```shell
  OLLAMA_ORIGINS="https://octoconsulting.github.io"
  ```
  [See here](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server) for
  details on configuring the Ollama server.


- Pull the Mistral model
    ```shell
    ollama pull mistral
  ```

If you run into issues, check out
Ollama's [troubleshooting suggestions](https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md).

## Try It

In a web browser, navigate to the [Canvas](https://octoconsulting.github.io/keip-canvas/).
The `KeipAssistant` button should be enabled in the bottom toolbar. Click it to open a chat panel.

For an example, try this prompt:

```text
Return a flow that listens to a JMS topic and forwards the message out to a Kafka topic
```

Followed by:

```text
Add a correlation id header to the message before sending to Kafka
```

Note, the existing diagram is included in the chat context.