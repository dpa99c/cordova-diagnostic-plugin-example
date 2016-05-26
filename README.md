Cordova/Phonegap Diagnostic Plugin Example
==========================================

This repo contains an example project which illustrates use of the [Diagnostic Cordova/Phonegap plugin](https://github.com/dpa99c/cordova-diagnostic-plugin).

<!-- START table-of-contents -->
**Table of Contents**

- [Important Android Note](#important-android-note)
- [Downloading](#downloading)
- [Building and running](#building-and-running)
  - [Testing Android runtime permissions](#testing-android-runtime-permissions)
- [Screenshots](#screenshots)
  - [Android](#android)
  - [iOS](#ios)
- [License](#license)

<!-- END table-of-contents -->

# Important Android Note

The [master branch of the diagnostic plugin](https://github.com/dpa99c/cordova-diagnostic-plugin) now supports Android 6 runtime permissions. The introduces a dependency which means that the project must be built against API 23 or above.

For users who wish to build against API 22 or below, there is a branch of the plugin repo which contains all the functionality __except Android 6 runtime permissions__. This removes the dependency on API 23 and will allow you to build against legacy API versions (22 and below).

There is also a corresponding branch of this project intended to be built with the legacy plugin version: [https://github.com/dpa99c/cordova-diagnostic-plugin-example/tree/api-22](https://github.com/dpa99c/cordova-diagnostic-plugin-example/tree/api-22)

**NOTE**: Phonegap Build now supports API 23, so its users may use the main plugin branch (`cordova.plugins.diagnostic`).

# Downloading

To download the example project, clone it using git:

    $ git clone https://github.com/dpa99c/cordova-diagnostic-plugin-example

# Building and running

The plugin currently supports the Android and iOS platforms.

For example, to run on the Android platform, execute the following commands from the project root:

- Install the API 23 platform into the project: `$ cordova platform add android@5`
- Build and run the project: `$ cordova run android`

## Testing Android runtime permissions

If you want to test out Android runtime permissions, you need to run the example app on a device/emulator the app is running on has Android 6.0.

Note: If the app is run on Android 5.1 (API 22)  or below, runtime permissions do not apply - all permissions are granted at installation time.


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