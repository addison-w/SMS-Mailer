# SMS Mailer

Android app that automatically forwards incoming SMS messages to email via SMTP.

Built with React Native and Expo for reliable background operation.

## Features

- **Automatic forwarding** - Forwards all incoming SMS to a configured email address
- **Background operation** - Runs as a foreground service, survives app close and device reboot
- **Generic SMTP** - Works with any SMTP server (Gmail, Outlook, self-hosted, etc.)
- **Retry queue** - Failed sends retry automatically with exponential backoff
- **Material Design 3** - Modern UI with light/dark/system theme support
- **Dual SIM support** - Identifies which SIM received the message

## Requirements

- Android 8.0+ (API level 26)
- Node.js 18+
- An SMTP server (Gmail, Outlook, Fastmail, self-hosted, etc.)

## Installation

### From Source

1. Clone the repository
   ```bash
   git clone https://github.com/addison-w/SMS-Mailer.git
   cd SMS-Mailer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build and run on Android
   ```bash
   npm run dev
   ```

### Pre-built APK

<!-- TODO: Add release link -->
Download the latest APK from [Releases](https://github.com/addison-w/SMS-Mailer/releases).

## Development

```bash
# Start Expo dev server
npm start

# Build for Android
npm run android

# Run on connected device/emulator
npm run dev
```

## Tech Stack

- **React Native** 0.81 + **Expo** 54
- **React Native Paper** - Material Design 3 components
- **Expo Router** - File-based navigation
- **Zustand** - State management
- **react-native-background-actions** - Foreground service
- **react-native-smtp-mailer** - SMTP client

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab screens (status, settings, history)
│   └── onboarding.tsx      # First-run setup
├── components/
│   ├── ui/                 # Reusable components (Button, Card, Input)
│   └── features/           # Feature components (PermissionCard, QueueItemCard)
├── services/               # Background service, SMS listener, email sender
├── stores/                 # Zustand stores (settings, history, theme)
├── hooks/                  # Custom hooks
└── theme/                  # Material Design 3 tokens
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.
