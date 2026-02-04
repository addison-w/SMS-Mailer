# SMS Mailer - Design Document

**Date:** 2026-02-04
**Purpose:** Android app that forwards received SMS messages to a configured email address via SMTP.

## Requirements Summary

- **Platform:** Android only (React Native with Expo)
- **SMTP:** Generic SMTP server support (any provider)
- **Recipients:** Single email recipient
- **Filtering:** Forward all incoming SMS (no filtering)
- **Failures:** Silent retry with notification on repeated failures
- **Navigation:** Tab-based (Status, Settings, History)
- **Theme:** Modern dark with accent colors
- **History:** Show only pending/failed items, not successful forwards

---

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Tab navigator
│   │   ├── index.tsx      # Status tab (home)
│   │   ├── settings.tsx   # Settings tab
│   │   └── history.tsx    # History tab
│   └── _layout.tsx        # Root layout
├── components/
│   ├── ui/                # Reusable components (Button, Input, Card)
│   └── features/          # Feature components (PermissionCard, SmtpForm)
├── services/
│   ├── sms-listener.ts    # Native SMS receiver
│   ├── email-sender.ts    # SMTP client
│   ├── background.ts      # Background task manager
│   └── queue.ts           # Retry queue for failed sends
├── stores/
│   ├── settings.ts        # SMTP config persistence
│   └── history.ts         # Failed/pending message store
├── hooks/
│   └── usePermissions.ts  # Permission status hook
├── theme/
│   └── colors.ts          # Dark theme palette
└── types/
    └── index.ts           # TypeScript types
```

## Dependencies

```json
{
  "dependencies": {
    "react-native-background-actions": "^4.0.0",
    "react-native-get-sms-android": "^1.0.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-secure-store": "~13.0.0",
    "expo-notifications": "~0.28.0",
    "zustand": "^4.5.0",
    "nodemailer": "^6.9.0"
  }
}
```

---

## Screen Designs

### Status Tab (Home)

Main dashboard showing service health and permissions.

```
┌─────────────────────────────────┐
│  SMS Mailer                     │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │  SERVICE STATUS           │  │
│  │  ● Running                │  │
│  │  [  Stop Service  ]       │  │
│  └───────────────────────────┘  │
│                                 │
│  PERMISSIONS                    │
│  ┌───────────────────────────┐  │
│  │ ✓ SMS Permission          │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ✓ Notification Access     │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ✗ Battery Optimization    │  │
│  │   [Disable Optimization]  │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ✓ Background Running      │  │
│  └───────────────────────────┘  │
│                                 │
│  QUICK STATS                    │
│  Pending: 0  │  Failed: 2      │
│                                 │
├─────────────────────────────────┤
│  [Status]  [Settings]  [History]│
└─────────────────────────────────┘
```

**Required Permissions:**
1. `READ_SMS` - Read incoming messages
2. `RECEIVE_SMS` - Trigger on new SMS
3. `POST_NOTIFICATIONS` - Show failure alerts
4. `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` - Prevent background kill
5. `FOREGROUND_SERVICE` - Keep service alive

### Settings Tab

SMTP configuration and email addresses.

```
┌─────────────────────────────────┐
│  Settings                       │
├─────────────────────────────────┤
│                                 │
│  SMTP SERVER                    │
│  ┌───────────────────────────┐  │
│  │ Host                      │  │
│  │ [smtp.example.com       ] │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Port                      │  │
│  │ [587                    ] │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Security         [TLS ▼] │  │
│  └───────────────────────────┘  │
│                                 │
│  AUTHENTICATION                 │
│  ┌───────────────────────────┐  │
│  │ Username                  │  │
│  │ [user@example.com       ] │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Password                  │  │
│  │ [••••••••••            ] │  │
│  └───────────────────────────┘  │
│                                 │
│  EMAIL ADDRESSES                │
│  ┌───────────────────────────┐  │
│  │ From (Sender)             │  │
│  │ [noreply@example.com    ] │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ To (Recipient)            │  │
│  │ [alerts@example.com     ] │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  [Test Connection]        │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  [    Save Settings    ]  │  │
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  [Status]  [Settings]  [History]│
└─────────────────────────────────┘
```

**SMTP Fields:**
- Host - SMTP server address
- Port - Default 587 (TLS) or 465 (SSL)
- Security - Dropdown: None / TLS / SSL
- Username - SMTP auth username
- Password - Secure input, stored via expo-secure-store
- From - Sender email address
- To - Recipient email address

**Email Template:**
```
Subject: SMS from +61412345678

From: +61412345678
To: +61498765432 (SIM 1)
Time: 2026-02-04 10:30 PM

Message:
Hello, this is a test message.
```

### History Tab

Shows only pending/failed messages that need attention.

```
┌─────────────────────────────────┐
│  History                        │
├─────────────────────────────────┤
│                                 │
│  PENDING (2)                    │
│  ┌───────────────────────────┐  │
│  │ ⏳ +61412345678           │  │
│  │    "Meeting at 3pm..."    │  │
│  │    Retry in 30s           │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ⏳ +61498765432           │  │
│  │    "Your code is 5821"    │  │
│  │    Retry in 45s           │  │
│  └───────────────────────────┘  │
│                                 │
│  FAILED (1)                     │
│  ┌───────────────────────────┐  │
│  │ ✗ +61411222333            │  │
│  │   "Appointment reminder"  │  │
│  │   SMTP auth failed        │  │
│  │   3 retries exhausted     │  │
│  │   [Retry] [Dismiss]       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  [Clear All Failed]       │  │
│  └───────────────────────────┘  │
│                                 │
│  ─────────────────────────────  │
│  ✓ 147 messages forwarded      │
│    successfully                 │
│                                 │
├─────────────────────────────────┤
│  [Status]  [Settings]  [History]│
└─────────────────────────────────┘
```

**Empty State:**
```
┌───────────────────────────┐
│       ✓ All Clear         │
│                           │
│  No pending or failed     │
│  messages                 │
│                           │
│  147 forwarded            │
│  successfully             │
└───────────────────────────┘
```

---

## Background Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ANDROID OS                        │
├─────────────────────────────────────────────────────┤
│  SMS_RECEIVED Broadcast                              │
│         │                                            │
│         ▼                                            │
│  ┌─────────────────┐                                │
│  │ SmsReceiver     │  (BroadcastReceiver)           │
│  │ - Intercepts SMS│                                │
│  │ - Extracts data │                                │
│  └────────┬────────┘                                │
│           │                                          │
│           ▼                                          │
│  ┌─────────────────┐    ┌──────────────────┐       │
│  │ ForegroundSvc   │───▶│ Persistent       │       │
│  │ - Keeps alive   │    │ Notification     │       │
│  │ - Shows notif   │    │ "SMS Mailer      │       │
│  └────────┬────────┘    │  running"        │       │
│           │              └──────────────────┘       │
│           ▼                                          │
│  ┌─────────────────┐                                │
│  │ EmailQueue      │                                │
│  │ - Add to queue  │                                │
│  │ - Process FIFO  │                                │
│  │ - Retry logic   │                                │
│  └────────┬────────┘                                │
│           │                                          │
│           ▼                                          │
│  ┌─────────────────┐    ┌──────────────────┐       │
│  │ SmtpClient      │───▶│ Email Server     │       │
│  │ - TLS/SSL       │    │                  │       │
│  │ - Send email    │    └──────────────────┘       │
│  └─────────────────┘                                │
└─────────────────────────────────────────────────────┘
```

### SMS Data Model

```typescript
interface SmsMessage {
  id: string;
  sender: string;           // +61412345678
  body: string;             // Message content
  timestamp: number;        // Unix timestamp
  simSlot: number;          // 0 or 1 (dual SIM)
  simSubscriptionId: number;// Android subscription ID
  receiverNumber: string;   // Phone number of receiving SIM
}
```

### Retry Strategy

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 30 seconds |
| 3 | 2 minutes |
| Failed | Move to Failed list, notify user |

### Boot Persistence

- Register `BOOT_COMPLETED` receiver
- Auto-start foreground service on device boot (if was running before)

---

## Theme

### Color Palette

```
Background
├── Primary:    #0D0D0D  (near black)
├── Surface:    #1A1A1A  (cards, inputs)
├── Elevated:   #262626  (modals, dropdowns)

Text
├── Primary:    #FFFFFF  (headings, important)
├── Secondary:  #A3A3A3  (labels, descriptions)
├── Muted:      #666666  (placeholders, disabled)

Accent
├── Primary:    #3B82F6  (blue - buttons, links)
├── Success:    #22C55E  (green - running, granted)
├── Warning:    #F59E0B  (amber - pending, retry)
├── Error:      #EF4444  (red - failed, denied)

Border
├── Default:    #333333  (input borders, dividers)
├── Focus:      #3B82F6  (focused inputs)
```

### Component Styling

| Component | Style |
|-----------|-------|
| Cards | #1A1A1A, border-radius: 12px, border: 1px #333333 |
| Inputs | #1A1A1A, border-radius: 8px, border: 1px #333333 |
| Primary Button | #3B82F6 bg, white text, 8px radius |
| Secondary Button | transparent, #3B82F6 border, #3B82F6 text |
| Danger Button | #EF4444 bg, white text |
| Tab Bar | #1A1A1A bg, #3B82F6 active, #666666 inactive |
| Status Icons | 24px, filled style |

### Typography

| Element | Style |
|---------|-------|
| H1 | System font, 600 weight, 24px |
| H2 | System font, 600 weight, 18px |
| Body | System font, 400 weight, 16px |
| Caption | System font, 400 weight, 14px, #A3A3A3 |

---

## Implementation Phases

### Phase 1: Project Setup
- Configure Expo for Android
- Set up project structure
- Add dependencies
- Configure native modules

### Phase 2: Theme & UI Components
- Create theme constants
- Build reusable UI components (Button, Input, Card)
- Set up tab navigation

### Phase 3: Settings Screen
- SMTP configuration form
- Secure storage for credentials
- Test connection functionality

### Phase 4: Permissions & Status Screen
- Permission checking hook
- Permission request handlers
- Status display with service toggle

### Phase 5: Background Service
- SMS broadcast receiver
- Foreground service
- Boot persistence

### Phase 6: Email Queue & Sending
- Queue management with retry logic
- SMTP client integration
- Failure notifications

### Phase 7: History Screen
- Pending/failed message display
- Retry and dismiss actions
- Success counter

### Phase 8: Testing & Polish
- End-to-end testing on device
- Error handling improvements
- Performance optimization
