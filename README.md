# Hide OS Enhanced Research Tool

A browser userscript that enhances privacy features and modifies certain browser behaviors for research purposes.

## Requirements

- Browser with Tampermonkey or similar userscript manager extension installed
- Chrome/Chromium-based browser recommended

## Installation

1. Install Tampermonkey extension from your browser's extension store
2. Create new script in Tampermonkey
3. Copy the contents of `userscript.js` into the editor
4. **Important**: Modify the `@match` URL in the userscript header to match your target website
5. Save the script

## Features

- OS Detection modification
- Canvas fingerprint protection
- WebGL fingerprint protection
- Audio fingerprint randomization
- WebRTC protection
- Performance API modification

## Configuration

Default OS is set to MacOS. You can change this by modifying the `selectedOS` variable in the script:
- Available options: `WINDOWS`, `MACOS`, `LINUX`

## Legal Notice

This tool is for research and educational purposes only. Users are responsible for ensuring compliance with all applicable terms of service and laws.

## License

MIT License
