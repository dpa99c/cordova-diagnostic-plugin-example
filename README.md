Cordova/Phonegap Diagnostic Plugin Example
==========================================

This repo contains an example project which illustrates use of the [Diagnostic Cordova/Phonegap plugin](https://github.com/dpa99c/cordova-diagnostic-plugin).


## Contents
* [Downloading](#downloading)
* [Building and running](#building-and-running)
* [Pre-built app](#pre-built-app)
* [Screenshots](#screenshots)
* [License](#license)
 
# Downloading

To download the example project, clone it using git:

    $ git clone https://github.com/dpa99c/cordova-diagnostic-plugin-example.git

# Building and running

The plugin currently supports the Android and iOS platforms.

For example, to run on the Android platform, execute the following commands from the project root:

- Install the platform into the project: `$ cordova platform add android`
- Build and run the project: `$ cordova run android`

## Testing Android runtime permissions

If you want to test out Android runtime permissions, you need to run the example app on a device/emulator the app is running on has Android 6.0.

Also, the app must be built using API 23 or higher. For Cordova, this means using the Cordova Android platform [version 5.0.0](https://github.com/apache/cordova-android/tree/5.0.x) or above:

    $ cordova platform add android@5.0.0

If the app is built with version 4.x or below (API 22 or below), runtime permissions do not apply - all permissions are granted at installation time.

# Pre-built app
If you're unable to build the project or just want to try it out, here is the project as a pre-built app installer:

- [Android (APK)](build/cordova-diagnostic-plugin-example.apk)
- [iOS (IPA)](build/cordova-diagnostic-plugin-example.ipa)

# Screenshots

## Android

![Android screenshot](https://raw.githubusercontent.com/dpa99c/cordova-diagnostic-plugin-example/master/screenshots/android_1.png)
![Android screenshot](https://raw.githubusercontent.com/dpa99c/cordova-diagnostic-plugin-example/master/screenshots/android_2.png)
![Android screenshot](https://raw.githubusercontent.com/dpa99c/cordova-diagnostic-plugin-example/master/screenshots/android_3.png)

## iOS

![iOS screenshot](https://raw.githubusercontent.com/dpa99c/cordova-diagnostic-plugin-example/master/screenshots/ios_1.png)
![iOS screenshot](https://raw.githubusercontent.com/dpa99c/cordova-diagnostic-plugin-example/master/screenshots/ios_2.png)

# License
================

The MIT License

Copyright (c) 2015 Dave Alden / Working Edge Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.