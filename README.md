# FlowZone

FlowZone is a personal assistant webapp designed to help users manage their schedule, tasks, and time effectively. It uses AI to understand user needs, automate scheduling, and provide intelligent task management.

## Features

- **Schedule Management**: Integration with Google Calendar
- **Personal Assistant Functionality**: Daily goal setting through user interaction
- **Task Timer System**: Built-in timer for each task
- **AI Chat Interface**: Natural language communication for task creation and management

## Technologies Used

- React
- TypeScript
- Firebase (Authentication & Firestore)
- Tailwind CSS
- Material UI
- Redux Toolkit

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/duckyquang/flowzone.git
   cd flowzone
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. Start the development server
   ```
   npm start
   ```

## Deployment

The application is deployed on GitHub Pages at [https://duckyquang.github.io/flowzone](https://duckyquang.github.io/flowzone)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
- UI components from [Tailwind CSS](https://tailwindcss.com/) and [Material UI](https://mui.com/) 