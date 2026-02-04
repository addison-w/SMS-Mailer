# Material Design 3 Refactor

**Date:** 2026-02-04
**Status:** Approved

## Summary

Refactor SMS Mailer app UI to align with Material Design 3 guidelines using React Native Paper. Focus on visual consistency first, then component replacement, with accessibility baseline throughout.

## Decisions

- **Framework:** React Native Paper (M3)
- **Approach:** Visual consistency first
- **Colors:** Static M3 palette generated from #3B82F6, light/dark toggle
- **Typography:** Roboto bundled, M3 type scale

## Theme Foundation

### Dependencies

```json
{
  "react-native-paper": "^5.x",
  "@expo-google-fonts/roboto": "^0.2.x"
}
```

### Color Scheme (from #3B82F6)

**Light Mode:**
- primary: #3B82F6
- onPrimary: #FFFFFF
- primaryContainer: #D6E3FF
- onPrimaryContainer: #001A41
- secondary: #575E71
- onSecondary: #FFFFFF
- secondaryContainer: #DBE2F9
- onSecondaryContainer: #141B2C
- surface: #FEF7FF
- onSurface: #1C1B1F
- surfaceVariant: #E7E0EC
- onSurfaceVariant: #49454F
- error: #BA1A1A
- onError: #FFFFFF

**Dark Mode:**
- primary: #ADC6FF
- onPrimary: #002E69
- primaryContainer: #004494
- onPrimaryContainer: #D6E3FF
- secondary: #BFC6DC
- onSecondary: #293041
- secondaryContainer: #3F4759
- onSecondaryContainer: #DBE2F9
- surface: #141218
- onSurface: #E6E1E5
- surfaceVariant: #49454F
- onSurfaceVariant: #CAC4D0
- error: #FFB4AB
- onError: #690005

### Typography Scale (M3 + Roboto)

| Role | Size | Line Height | Weight |
|------|------|-------------|--------|
| displayLarge | 57 | 64 | 400 |
| displayMedium | 45 | 52 | 400 |
| displaySmall | 36 | 44 | 400 |
| headlineLarge | 32 | 40 | 400 |
| headlineMedium | 28 | 36 | 400 |
| headlineSmall | 24 | 32 | 400 |
| titleLarge | 22 | 28 | 400 |
| titleMedium | 16 | 24 | 500 |
| titleSmall | 14 | 20 | 500 |
| bodyLarge | 16 | 24 | 400 |
| bodyMedium | 14 | 20 | 400 |
| bodySmall | 12 | 16 | 400 |
| labelLarge | 14 | 20 | 500 |
| labelMedium | 12 | 16 | 500 |
| labelSmall | 11 | 16 | 500 |

## Component Migration

| Current | Paper M3 | Notes |
|---------|----------|-------|
| Button | Button | modes: contained, outlined, text |
| Card | Card | modes: elevated, filled, outlined |
| Input | TextInput | modes: flat, outlined |
| Select | Menu + Button | Compose from primitives |
| PermissionCard | Custom | Use Paper Card + IconButton |
| QueueItemCard | Custom | Use Paper Card + List.Item |
| Tab icons | MaterialCommunityIcons | home, cog, history |

## Screen Changes

### Status Screen
- Hero card → Paper Card
- Stats → displaySmall typography
- Buttons → Paper Button contained/contained-tonal

### Settings Screen
- Section cards → Paper Card with Card.Title
- Inputs → Paper TextInput outlined
- Select → Paper Menu

### History Screen
- Section headers → labelLarge
- Queue cards → Custom with Paper primitives
- Empty state → Proper text roles

### Tab Navigation
- Icons → MaterialCommunityIcons
- Colors from theme

### Onboarding
- Button → Paper Button contained
- Keep custom animations

## Implementation Phases

### Phase 1: Theme Foundation
- Install react-native-paper, fonts
- Create M3 color tokens
- Create typography scale
- Set up PaperProvider
- Load Roboto fonts

### Phase 2: Core Components
- Migrate Button
- Migrate Card
- Migrate Input
- Create Select from Menu

### Phase 3: Screen Updates
- Status screen
- Settings screen
- History screen
- Tab navigation
- Onboarding screen

### Phase 4: Polish & Accessibility
- Light/dark toggle UI
- Content descriptions
- Focus order
- Touch target audit

## Acceptance Criteria

- [ ] All colors use M3 semantic roles, no hardcoded hex
- [ ] Typography uses M3 type scale via theme
- [ ] Roboto renders consistently on iOS and Android
- [ ] Light/dark mode toggle works
- [ ] All interactive elements ≥48dp touch target
- [ ] TalkBack reads all buttons and inputs correctly
- [ ] Keyboard navigation works (focus visible, logical order)
- [ ] No visual regressions in layout/spacing

## Test Script

1. **Visual verification:**
   - Launch app in light mode, verify colors
   - Toggle to dark mode, verify colors
   - Check all three tabs

2. **TalkBack (Android):**
   - Enable TalkBack
   - Navigate Status screen: all buttons announced
   - Navigate Settings: all inputs announced with labels
   - Navigate History: queue items readable

3. **Keyboard (with external keyboard):**
   - Tab through Status screen, verify focus order
   - Tab through Settings form fields
   - Verify focus indicator visible

4. **Touch targets:**
   - All buttons visually appear ≥48dp
   - Permission card action areas adequate
