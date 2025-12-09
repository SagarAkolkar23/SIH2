# FCM Token - ProjectId Issue Fix

## ❌ Current Issue

The app is failing to get Expo push token because `projectId` is not found.

**Error:**
```
No "projectId" found. If "projectId" can't be inferred from the manifest (for instance, in bare workflow), you have to pass it in yourself.
```

## 🔍 Why This Happens

- **Expo Go:** ProjectId is auto-detected from the manifest
- **Development/Production Builds:** ProjectId must be explicitly provided
- **Bare Workflow:** ProjectId must be explicitly provided

## ✅ Solutions

### **Option 1: Link to EAS Project (Recommended)**

1. **Initialize EAS project:**
   ```bash
   cd frontend2
   npx eas init
   ```

2. **Follow the prompts:**
   - Choose "Create a new project" or "Link to existing project"
   - This will automatically add `projectId` to your `app.json`

3. **Verify:**
   ```bash
   npx expo config --type public | findstr /i "projectId"
   ```

### **Option 2: Add ProjectId Manually to app.json**

1. **Get your projectId:**
   - If you have an EAS account, get it from: https://expo.dev/accounts/[your-account]/projects/[your-project]
   - Or run `npx eas project:info` after linking

2. **Add to app.json:**
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-project-id-here"
         }
       }
     }
   }
   ```

### **Option 3: Use Environment Variable**

1. **Set environment variable:**
   ```bash
   # Windows PowerShell
   $env:EXPO_PROJECT_ID="your-project-id-here"
   
   # Windows CMD
   set EXPO_PROJECT_ID=your-project-id-here
   
   # Linux/Mac
   export EXPO_PROJECT_ID=your-project-id-here
   ```

2. **Or add to .env file:**
   ```
   EXPO_PROJECT_ID=your-project-id-here
   ```

### **Option 4: For Expo Go Only**

If you're using Expo Go, the projectId should be auto-detected. If it's not working:

1. **Check if you're actually in Expo Go:**
   - The app should show "Expo Go" in the app
   - Check `Constants.executionEnvironment` in logs

2. **Try restarting the app:**
   - Sometimes the manifest needs to be refreshed

## 🔍 Debugging

The code now logs detailed information:

- `Constants.executionEnvironment` - Shows if you're in Expo Go, bare, or standalone
- `Constants.appOwnership` - Shows app ownership type
- `Constants.expoConfig?.projectId` - Shows if projectId is in config
- `Constants.expoConfig?.extra` - Shows all extra config

## 📝 Current Code Behavior

The code will:
1. Try to find projectId from multiple sources
2. Log all available Constants data for debugging
3. Try to get token with projectId if found
4. Try to get token without projectId (for Expo Go)
5. Provide helpful error messages if it fails

## ✅ After Fixing

Once you've added the projectId, you should see:
```
[FCM TOKEN] ProjectId found: Yes
[FCM TOKEN] ProjectId: your-project-id
[FCM TOKEN] ✅ Expo push token obtained
```

## 🚀 Quick Fix (Recommended)

Run this command to initialize EAS project:
```bash
cd frontend2
npx eas init
```

This is the easiest way to get a projectId and link your app to Expo's services.
