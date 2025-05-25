# PNG to JPG Converter

A modern, beautiful React application for converting PNG images to optimized JPG files with intelligent compression and resizing.

## ✨ Features

- **🎯 Precise Output**: Converts to exactly 1920×1080 resolution
- **📦 Smart Compression**: Targets ~500KB file size with quality optimization
- **🎨 Beautiful UI**: Dark theme with Framer Motion animations
- **🔒 100% Private**: All processing happens locally in your browser
- **⚡ Lightning Fast**: Instant processing with optimized algorithms
- **📱 Responsive**: Works perfectly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## 🎯 How It Works

1. **Upload**: Drag and drop or select a PNG image
2. **Process**: The app automatically:
   - Resizes to 1920×1080 (16:9 aspect ratio)
   - Maintains aspect ratio with letterboxing if needed
   - Applies intelligent JPG compression
   - Targets approximately 500KB file size
3. **Download**: Get your optimized JPG file instantly

## 🛠️ Technical Details

### Image Processing Algorithm

- **Aspect Ratio Handling**: Maintains original proportions with black letterboxing
- **Quality Optimization**: Uses binary search to find optimal JPG quality
- **Canvas Rendering**: Leverages HTML5 Canvas for high-quality processing
- **Memory Efficient**: Processes images entirely in browser memory

### Technology Stack

- **React 18**: Modern React with hooks
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first styling with custom dark theme
- **HTML5 Canvas**: Client-side image processing
- **No Backend Required**: Runs entirely in the browser

## 📋 Supported Formats

- **Input**: PNG files (any resolution, any aspect ratio)
- **Output**: JPG files (1920×1080, ~500KB)

## 🎨 UI Features

- **Dark Theme**: Easy on the eyes with beautiful gradients
- **Drag & Drop**: Intuitive file upload experience
- **Live Preview**: See before and after comparison
- **Progress Indicators**: Visual feedback during processing
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Framer Motion powered transitions

## 🔧 Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder. The build is minified and optimized for best performance.

## 📦 Deployment

The built application is a static site that can be deployed to any web server or hosting service like:

- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Styled with Tailwind CSS
- Animated with Framer Motion
- Icons from Heroicons 