# MediReport: AI-Powered Medical Report Generator

MediReport is a web application built with Next.js and integrated with Google AI using Genkit. Its primary purpose is to streamline the process of generating detailed medical diagnosis reports. The application serves both doctors and patients, offering distinct functionalities for each user type.

## Purpose

The main goal of MediReport is to leverage the power of AI to assist healthcare professionals in creating comprehensive and accurate diagnosis reports efficiently. By automating parts of the report generation process, doctors can save valuable time and focus more on patient care. For patients, MediReport provides a secure platform to access and manage their medical reports and vital history.

## How it Works

MediReport utilizes a Next.js frontend for a dynamic and responsive user interface. The backend is powered by Node.js and connects to a MongoDB database for storing patient information and reports. The core AI functionality is handled by Genkit, which interacts with Google AI models to process patient data and generate diagnosis report drafts.

Key functionalities include:

- **Doctor Dashboard:** Provides an overview of patients and reports, allowing doctors to manage patient records, initiate report generation, and review/edit AI-generated drafts.
- **Patient Dashboard:** Offers patients access to their medical reports and vital history, providing a clear overview of their health status.
- **AI-Powered Report Generation:** Doctors can input patient data (symptoms, medical history, test results, etc.) into the system. Genkit then uses this information to interact with a Google AI model (specifically, the `generate-diagnosis-report` flow) to produce a preliminary diagnosis report.
- **Report Management:** Doctors can review, edit, finalize, and store the generated reports.
- **Data Storage:** Patient information and reports are securely stored in a MongoDB database.

## Installation Instructions

To set up and run the MediReport project locally, follow these steps:

1.  **Clone the repository:**



To get started, take a look at src/app/page.tsx.

## Running with AI Models

MediReport is designed to work with AI models to generate diagnosis reports. You can configure the application to use either Google AI (Gemini) or a local Ollama instance.

### Using Google AI (Gemini)

1.  Ensure you have a Google Cloud project set up and billing enabled.
2.  Obtain API keys for the Google AI models you intend to use.
3.  Set the `GOOGLE_AI_MODEL` environment variable in your `.env.local` file to the name of the Gemini model you want to use (e.g., `gs://path/to/your/model`).
4.  Ensure the necessary Google Cloud credentials are configured in your environment. Refer to the Genkit documentation for details on setting up Google Cloud authentication.

### Using Ollama

1.  Install Ollama on your local machine. Follow the instructions on the official Ollama website.
2.  Download the desired AI model using Ollama (e.g., `ollama pull llama2`).
3.  Set the `OLLAMA_MODEL` environment variable in your `.env.local` file to the name of the model you downloaded (e.g., `llama2`).
4.  Set the `OLLAMA_HOST` environment variable to the address where Ollama is running (default is `http://localhost:11434`).

The application will use the AI model specified by the environment variables. If both `GOOGLE_AI_MODEL` and `OLLAMA_MODEL` are set, the application's behavior will depend on the implementation logic in `src/ai/genkit.ts` and `src/ai/dev.ts`. You may need to adjust these files to prioritize one over the other or provide a configuration option within the application.
