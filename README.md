# सह-AI-यक (Sahayak): Mental Health Assistant

### Website  : https://sahaiyak-hackvita-3-0.onrender.com


![Screenshot 2025-03-31 103711](https://github.com/user-attachments/assets/3b53fc30-0338-45a1-a570-8763f2b86d99)

A conversational AI assistant for mental health assessment that analyzes both text and facial expressions to provide supportive responses.

---

### Project Title: sah-AI-yak 🛠️

### Team Name:  Cloud 9
- Akhand Singh (2201CS11) [@akhandsinghjr](https://github.com/akhandsinghjr)
- Aditya Chauhan (2201CS07) [@AdityaChauhan-07](https://github.com/AdityaChauhan-07)
---

### Problem Statement:
Millions suffer from mental health issues, but many don’t seek help due to stigma or lack of accessibility. Can AI and tech-based solutions provide early detection, real-time emotional support, and personalized well-being recommendations?.

---

### Our Solution:


![Screenshot 2025-03-31 104722](https://github.com/user-attachments/assets/ff447a7e-e0bf-4956-b3e3-eb903f482827)

Our website includes a Mental Health Analysis tool designed to evaluate users' current well-being across multiple dimensions. Before accessing personalized recommendations or insights, users must undergo a mental health assessment that measures their state across 8 key parameters. Based on their responses, we assign them an overall mental health score, providing a clear summary of their well-being. This evaluation helps deliver tailored guidance, fostering a deeper understanding of one's mental health.

![image](https://github.com/user-attachments/assets/2b343287-b03c-4aae-a5da-763e995c5d85)

sah-AI-yak is an AI assistant specifically designed for students to monitor their mental health and provide the necessary support. Users can undergo a brief mental health assessment, which analyzes emotional sentiment through text, images, and voice. The platform features virtual assistants, Jenny and Guy, to guide users through the assessment. Users can interact via text or utilize the integrated voice assistant for a more interactive experience. Additionally, sah-AI-yak captures images alongside text inputs to enable comprehensive analysis and detect potential deceptions. The website also offers a helpline number for individuals experiencing significant distress and seeking direct support.

![image](https://github.com/user-attachments/assets/19eeed85-5ee1-4ef6-b7f2-447935e7a12a)
With rising competition in today's world, reports of young students facing extreme mental health challenges, including suicide, are deeply concerning. While the AI primarily targets students, it is accessible to anyone, from a 10-year-old child to an 80-year-old adult, allowing them to take the assessment and receive necessary assistance if required. The AI is not limited to moments of distress; users can also engage with it to share their happiness and positive experiences. sah-AI-yak aims to create a safe and supportive space where users can openly express their emotions, seek guidance, and receive timely assistance. By leveraging AI-driven analysis, it fosters mental well-being for individuals of all ages. Because mental health matters – let's talk.

---


## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Components**: Custom UI component library with shadcn/ui
- **Icons**: Lucide React

### Hugging Face Models
- **HuggingFaceH4/zephyr-7b-beta**: Zephyr for conversation and emotional analysis
- **trpakov/vit-face-expression**: Image analysis for facial expression assessment
- **espnet/kan-bayashi_ljspeech_vits**: Text-to-speech for voice responses
- **impira/layoutlm-document-qa**: Analysis via document

![Screenshot 2025-03-31 101921](https://github.com/user-attachments/assets/012e9e50-b555-404f-b05a-4f4f2666ca79)


### Media Processing
- **Camera Integration**: WebRTC API and Canvas for photo capture
- **Speech Recognition**: Web Speech API for speech-to-text
- **Audio Playback**: HTML5 Audio API with custom controls

### User Experience
- **Real-time Feedback**: Visual sound wave animations during speech
- **Interactive UI**: Modal dialogs, tooltips, and responsive design
- **Status Indicators**: Loading states and progress animations
- **Toast Notifications**: User feedback system

### Performance Optimizations
- **Rate Limiting**: Exponential backoff for API calls
- **Error Handling**: Comprehensive error states with recovery
- **Lazy Loading**: Optimized asset loading
- **Responsive Design**: Mobile and desktop support

## Getting Started


```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
