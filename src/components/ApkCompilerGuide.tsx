import React, { useState } from 'react';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Smartphone, 
  ShieldCheck, 
  Github, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ApkCompilerGuideProps {
  onTriggerHaptic?: () => void;
}

export const ApkCompilerGuide: React.FC<ApkCompilerGuideProps> = ({ onTriggerHaptic }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    onTriggerHaptic?.();
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const GITHUB_WORKFLOW = `name: Build Android APK (DLSS 5 Mobile)

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Install Dependencies
        run: |
          npm ci
          npm install @capacitor/core @capacitor/cli @capacitor/android

      - name: Build Web App
        run: npm run build

      - name: Initialize Capacitor Android
        run: |
          npx cap init "DLSS 5 Mobile" "com.stringai.dlss5" --web-dir dist
          npx cap add android
          npx cap sync android

      - name: Inject Android Permissions & Flags
        run: |
          # Inject SYSTEM_ALERT_WINDOW & POST_NOTIFICATIONS
          sed -i '/<\\/manifest>/i \\    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />\\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />' android/app/src/main/AndroidManifest.xml

      - name: Build Debug APK
        run: |
          cd android
          chmod +x ./gradlew
          ./gradlew assembleDebug --stacktrace

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: dlss5-mobile-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
`;

  const ANDROID_MANIFEST_SNIPPET = `<!-- Required Permissions for DLSS 5 Floating Overlay & Notification Tweaks -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />

<!-- In <application> tag for ultra-low latency hardware acceleration -->
<application
    android:hardwareAccelerated="true"
    android:largeHeap="true"
    android:supportsRtl="true"
    android:theme="@style/AppTheme.NoActionBar">
    ...
</application>`;

  const CAPACITOR_CONFIG = `{
  "appId": "com.stringai.dlss5",
  "appName": "DLSS 5 Mobile",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true,
    "webContentsDebuggingEnabled": true
  }
}`;

  return (
    <div className="w-full space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>GitHub APK Compilation Suite</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Automated CI/CD
              </span>
            </h2>
            <div className="text-xs text-slate-400">
              Ready-to-run GitHub Actions workflow to generate an Android APK
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Push this codebase to your GitHub repository. The workflow below will automatically build 
          the project, configure Android Capacitor with <code className="text-emerald-400">SYSTEM_ALERT_WINDOW</code> and <code className="text-emerald-400">POST_NOTIFICATIONS</code> permissions, 
          and output an installable <strong className="text-white">app-debug.apk</strong> artifact!
        </p>
      </div>

      {/* Step 1: GitHub Actions Workflow */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-bold text-slate-200">
              GitHub Actions Workflow (.github/workflows/build-apk.yml)
            </span>
          </div>

          <button
            onClick={() => handleCopy(GITHUB_WORKFLOW, 'workflow')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-1.5 transition-colors"
          >
            {copiedSection === 'workflow' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy YAML</span>
              </>
            )}
          </button>
        </div>

        <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 no-scrollbar border border-slate-800">
          <pre>{GITHUB_WORKFLOW}</pre>
        </div>
      </div>

      {/* Step 2: AndroidManifest.xml */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-xs font-bold text-slate-200">
              Android Permissions (AndroidManifest.xml)
            </span>
          </div>

          <button
            onClick={() => handleCopy(ANDROID_MANIFEST_SNIPPET, 'manifest')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 flex items-center gap-1.5 transition-colors"
          >
            {copiedSection === 'manifest' ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy XML</span>
              </>
            )}
          </button>
        </div>

        <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 no-scrollbar border border-slate-800">
          <pre>{ANDROID_MANIFEST_SNIPPET}</pre>
        </div>
      </div>

      {/* Step 3: Local Quick Build CLI */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span className="text-xs font-bold text-slate-200">
              Or Local CLI Compilation (3 Commands)
            </span>
          </div>

          <button
            onClick={() => handleCopy(`npm run build\nnpx cap sync\ncd android && ./gradlew assembleDebug`, 'cli')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-purple-400 flex items-center gap-1.5 transition-colors"
          >
            {copiedSection === 'cli' ? (
              <>
                <Check className="w-3.5 h-3.5 text-purple-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Commands</span>
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 space-y-2 border border-slate-800">
          <div><span className="text-slate-500"># 1. Build production web bundle</span></div>
          <div className="text-slate-200">npm run build</div>
          <div><span className="text-slate-500"># 2. Sync to Android project</span></div>
          <div className="text-slate-200">npx cap sync android</div>
          <div><span className="text-slate-500"># 3. Assemble debug APK</span></div>
          <div className="text-slate-200">cd android && ./gradlew assembleDebug</div>
        </div>
      </div>
    </div>
  );
};
