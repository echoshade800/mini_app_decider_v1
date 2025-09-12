# MiniDecider

**Decide anything in seconds—spin a wheel or use simple pickers.**

MiniDecider is a React Native app built with Expo that provides quick, fair, and fun decision-making tools. Whether you need to choose what to eat, pick a random number, or select someone from a group, MiniDecider has you covered.

## Features

### 🎡 Spin a Wheel
- Create custom decision wheels with unlimited options
- Weighted randomness for biased selections
- Enable/disable options without deleting them
- Preset wheels: What to Eat?, 100 Challenge, Truth or Dare, Yes or No, Board Games
- Visual wheel spinning with smooth animations

### 👆 Finger Spinner
- Multi-touch selection for up to 5 participants
- Place fingers on screen, app randomly selects winner
- Perfect for group decisions and games

### 🔢 Random Number Generator
- Configurable min/max ranges
- Generate multiple numbers at once (1-20)
- Option to allow or prevent duplicates
- Persistent configuration

### 🪙 Coin Flip
- Virtual coin flipping with realistic animation
- Track heads/tails statistics
- Flip counter and percentages

### ⚙️ Customization
- Haptic feedback toggle
- Adjustable spin duration (3-6 seconds)
- Dark/light theme support
- Data export/import (coming soon)

## Getting Started

### Prerequisites
- Node.js (16 or later)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/minidecider.git
cd minidecider
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Run on your preferred platform:
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal or visit `http://localhost:8081`

### Building for Production

```bash
# Build for web
npm run build:web

# Build for iOS (requires Apple Developer account)
npx expo build:ios

# Build for Android
npx expo build:android
```

## Project Structure

```
minidecider/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.js       # Spin a Wheel tab
│   │   ├── finger.js      # Finger Spinner tab
│   │   ├── random.js      # Random Number tab
│   │   ├── coin.js        # Coin Flip tab
│   │   └── profile.js     # Profile & Settings tab
│   ├── details/[id].js    # Wheel detail/spin screen
│   ├── create.js          # Create new wheel
│   ├── edit/[id].js       # Edit existing wheel
│   ├── about.js           # About & Help screen
│   ├── onboarding.js      # First-time user experience
│   └── _layout.js         # Root navigation layout
├── contexts/              # Global state management
│   └── AppContext.js      # Main app context
├── hooks/                 # Custom React hooks
│   └── useFrameworkReady.js
├── assets/                # Static assets
│   └── images/
├── app.json              # Expo configuration
└── package.json          # Dependencies and scripts
```

## Architecture

### Navigation
- **Expo Router** for file-based navigation
- **Bottom tabs** for main features
- **Stack navigation** for detailed views
- Deep linking support for wheel details

### State Management
- **React Context API** for global state
- **AsyncStorage** for data persistence
- Local-first approach (no server required)

### Animations
- **React Native Reanimated** for smooth wheel spinning
- **React Native Gesture Handler** for touch interactions
- **Expo Haptics** for tactile feedback

### Styling
- **React Native StyleSheet** (no external UI libraries)
- Custom color system with semantic tokens
- Responsive design for mobile and web

## Adding New Features

### Adding a New Screen

1. Create a new file in the `app/` directory:
```javascript
// app/new-feature.js
export default function NewFeatureScreen() {
  return (
    <View style={styles.container}>
      <Text>New Feature</Text>
    </View>
  );
}
```

2. Add navigation if needed in the appropriate `_layout.js` file.

### Adding New State

1. Update the `AppContext.js` to include new state and actions:
```javascript
const [newFeature, setNewFeature] = useState(initialState);

const updateNewFeature = (data) => {
  setNewFeature(data);
  saveToStorage(STORAGE_KEYS.NEW_FEATURE, data);
};
```

2. Expose the state and actions in the context value.

### Adding New Tab

1. Create the screen file in `app/(tabs)/`
2. Update `app/(tabs)/_layout.js` to include the new tab:
```javascript
<Tabs.Screen
  name="new-tab"
  options={{
    title: 'New Tab',
    tabBarIcon: ({ size, color }) => (
      <FontAwesome5 name="icon-name" size={size} color={color} />
    ),
  }}
/>
```

## Next Steps

Here are concrete follow-up tasks to enhance the app:

1. **Data Persistence**: Implement cloud sync with Firebase or Supabase for cross-device access
2. **Analytics**: Add usage analytics to understand user behavior and popular features
3. **Templates Gallery**: Create a community-driven templates marketplace for wheel sharing
4. **Import/Export**: Complete JSON import/export functionality for backup and sharing
5. **Theming**: Add dark mode toggle and custom color themes
6. **Internationalization**: Add multi-language support with i18n
7. **Accessibility**: Enhance screen reader support and keyboard navigation
8. **Wheel History**: Track and display spin history with statistics and trends

## Technical Specifications

- **Framework**: React Native with Expo SDK 53.0.20
- **Language**: JavaScript (ES6+)
- **Navigation**: Expo Router v5
- **State**: React Context + AsyncStorage
- **Animations**: React Native Reanimated v3
- **Icons**: FontAwesome5 via @expo/vector-icons
- **Graphics**: React Native SVG for wheel rendering
- **Platforms**: iOS 11+, Android 6+, Web (modern browsers)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@minidecider.app
- 🌐 Website: https://minidecider.app
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/minidecider/issues)

---

Made with ❤️ for quick decisions