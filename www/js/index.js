var platform;
function onDeviceReady() {
    platform = device.platform.toLowerCase();
    if(platform.match(/win/)){
        platform = "windows";
    }

    $('body').addClass(platform);

    // Bind events
    $(document).on("resume", onResume);
    $('#do-check').on("click", checkState);

    // Register change listeners for iOS+Android
    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.registerBluetoothStateChangeHandler(function (state) {
            console.log("Bluetooth state changed to: " + state);
            checkState();
        }, function (error) {
            console.error("Error registering for Bluetooth state changes: " + error);
        });

        cordova.plugins.diagnostic.registerLocationStateChangeHandler(function (state) {
            console.log("Location state changed to: " + state);
            checkState();
        }, function (error) {
            console.error("Error registering for location state changes: " + error);
        });
    }

    // Register change listeners for Android
    if(platform === "android"){
        cordova.plugins.diagnostic.registerPermissionRequestCompleteHandler(function(statuses){
            console.info("Permission request complete");
            for (var permission in statuses){
                switch(statuses[permission]){
                    case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                        console.log("Permission granted to use "+permission);
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                        console.log("Permission to use "+permission+" has not been requested yet");
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED:
                        console.log("Permission denied to use "+permission);
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                        console.log("Permission permanently denied to use "+permission);
                        break;
                }
            }
        });

        cordova.plugins.diagnostic.registerNFCStateChangeHandler(function (state) {
            console.log("NFC state changed to: " + state);
            checkState();
        }, function (error) {
            console.error("Error registering for NFC state changes: " + error);
        });
    }

    // iOS+Android settings
    $('#request-camera').on("click", function(){
        cordova.plugins.diagnostic.requestCameraAuthorization({
            successCallback: function(status){
                console.log("Successfully requested camera authorization: authorization was " + status);
                checkState();
            },
            errorCallback: function(error){
                console.error(error);
            },
            externalStorage: true
        });
    });

    $('#settings').on("click", function(){
        cordova.plugins.diagnostic.switchToSettings(function(){
            console.log("Successfully opened settings");
        }, function(error){
            console.error(error);
        });
    });

    $('#request-microphone').on("click", function(){
        cordova.plugins.diagnostic.requestMicrophoneAuthorization(function(status){
            console.log("Successfully requested microphone authorization: authorization was " + status);
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    $('#request-contacts').on("click", function(){
        cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
            console.log("Successfully requested contacts authorization: authorization was " + status);
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    $('#request-calendar').on("click", function(){
        cordova.plugins.diagnostic.requestCalendarAuthorization(function(status){
            console.log("Successfully requested calendar authorization: authorization was " + status);
            checkState();
        }, function(error){
            console.error(error);
        });
    });


    // iOS settings
    var onLocationRequestChange = function(status){
        console.log("Successfully requested location authorization: authorization was " + status);
        checkState();
    };
    $('#request-location-always').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(onLocationRequestChange, function(error){
            console.error(error);
        }, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
    });

    $('#request-location-in-use').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(onLocationRequestChange, function(error){
            console.error(error);
        }, cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE);
    });

    $('#request-camera-roll').on("click", function(){
        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status){
            console.log("Successfully requested camera roll authorization: authorization was " + status);
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    $('#request-reminders').on("click", function(){
        cordova.plugins.diagnostic.requestRemindersAuthorization(function(status){
            console.log("Successfully requested reminders authorization: authorization was " + status);
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    $('#request-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.requestBluetoothAuthorization(function(){
            console.log("Successfully requested Bluetooth authorization");
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    $('#request-motion').on("click", function(){
        cordova.plugins.diagnostic.requestAndCheckMotionAuthorization(function(status){
            console.log("Requested motion authorization: authorization is " + status);
            $('#state .motion-authorization-status').find('.value').text(status.toUpperCase());
        }, function(error){
            console.error(error);
        });
    });

    // Android settings
    $('#request-location').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
            console.log("Successfully requested location authorization: authorization was " + status);
        }, function(error){
            console.error(error);
        });
    });

    $('#location-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToLocationSettings();
    });

    $('#mobile-data-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToMobileDataSettings();
    });

    $('#bluetooth-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToBluetoothSettings();
    });

    $('#wifi-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToWifiSettings();
    });

    $('#wireless-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToWirelessSettings();
    });

    $('#nfc-settings').on("click", function(){
        cordova.plugins.diagnostic.switchToNFCSettings();
    });

    // Android set state
    $('#enable-wifi').on("click", function(){
        cordova.plugins.diagnostic.setWifiState(function(){
            console.log("Successfully enabled Wifi");
            setTimeout(checkState, 100);
        }, function(error){
            console.error(error);
        }, true);
    });

    $('#disable-wifi').on("click", function(){
        cordova.plugins.diagnostic.setWifiState(function(){
            console.log("Successfully disabled Wifi");
            setTimeout(checkState, 100);
        }, function(error){
            console.error(error);
        }, false);
    });

    $('#enable-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.setBluetoothState(function(){
            console.log("Successfully enabled Bluetooth");
            setTimeout(checkState, 1000);
        }, function(error){
            console.error(error);
        }, true);
    });

    $('#disable-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.setBluetoothState(function(){
            console.log("Successfully disabled Bluetooth");
            setTimeout(checkState, 1000);
        }, function(error){
            console.error(error);
        }, false);
    });

    $('#get-location').on("click", function(){
        var posOptions = { timeout: 35000, enableHighAccuracy: true, maximumAge: 5000 };
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            alert("Current position: "+lat+","+lon);
        }, function (err) {
            console.error("Position error: code="+ err.code + "; message=" + err.message);
            alert("Position error\ncode="+ err.code + "\nmessage=" + err.message);
        }, posOptions);
    });

    $('#use-camera').on("click", function(){
        navigator.camera.getPicture(function(){
            alert("Successfully took a photo");
        }, function(err){
            console.error("Camera error: "+ err);
            alert("Camera error: "+err);
        }, {
            saveToPhotoAlbum: false,
            destinationType: Camera.DestinationType.DATA_URL
        });
    });

    $('#request-external-sd-permission').on("click", function(){
        cordova.plugins.diagnostic.requestExternalStorageAuthorization(function(status){
            console.log("Successfully requested external storage authorization: authorization was " + status);
            checkState();
        }, function(error){
            console.error(error);
        });
    });

    $('#request-external-sd-details').on("click", function(){
        cordova.plugins.diagnostic.getExternalSdCardDetails(function(details){
            console.log("Successfully retrieved external SD card details");
            var $results = $('#request-external-sd-details-results');
            $results.show().empty();
            details.forEach(function(detail){
                $results.append('<p>Path: '+detail.path+
                    '<br/>Writable?: '+detail.canWrite+
                    '<br/>Free space: '+detail.freeSpace+
                    '<br/>Type: '+detail.type+
                    '</p>');
                if(detail.canWrite){
                    $('#write-external-sd-file').css('display', 'block');
                    cordova.file.externalSdCardDirectory = detail.filePath;
                }
            });
            window.scrollTo(0,document.body.scrollHeight)
        }, function(error){
            console.error(error);
        });
    });

    $('#write-external-sd-file').on("click", function(){
        var targetDir = cordova.file.externalSdCardDirectory;
        var filename = "test.txt";
        var targetFilepath = targetDir + "/" + filename;

        var fail = function(error) {
            var msg = 'Failed to write file \'' + targetFilepath + '\'. Error code: ' + error.code;
            console.error(msg);
            alert(msg);
        }
        window.resolveLocalFileSystemURL(targetDir, function (dirEntry) {
            dirEntry.getFile(filename, {
                create: true,
                exclusive: false
            }, function (fileEntry) {
                fileEntry.createWriter(function (writer) {
                    writer.onwriteend = function (evt) {
                        alert("Wrote "+targetFilepath);
                    };
                    writer.write("Hello world");
                }, fail);
            }, fail);
        }, fail);
    });


    if(platform === "ios") {
        // Setup background refresh request
        var Fetcher = window.BackgroundFetch;
        var fetchCallback = function() {
            console.log('BackgroundFetch initiated');
            $.get({
                url: 'index.html',
                callback: function(response) {
                    console.log("BackgroundFetch successful");
                    Fetcher.finish();
                }
            });
        };
        var failureCallback = function() {
            console.error('- BackgroundFetch failed');
        };
        Fetcher.configure(fetchCallback, failureCallback, {
            stopOnTerminate: true
        });

        // Setup push notifications
        var push = PushNotification.init({
            "android": {
                "senderID": "123456789"
            },
            "ios": {
                "sound": true,
                "alert": true,
                "badge": true
            },
            "windows": {}
        });

        push.on('registration', function(data) {
            console.log("registration event: " + data.registrationId);
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });
    }

    setTimeout(checkState, 500);
}


function checkState(){
    console.log("Checking state...");

    $('#state li').removeClass('on off');

    // Location
    var onGetLocationAuthorizationStatus;
    cordova.plugins.diagnostic.isLocationAvailable(function(available){
        $('#state .location').addClass(available ? 'on' : 'off');
    }, onError);

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
            $('#state .location-setting').addClass(enabled ? 'on' : 'off');
        }, onError);


        cordova.plugins.diagnostic.isLocationAuthorized(function(enabled){
            $('#state .location-authorization').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
            $('#state .location-authorization-status').find('.value').text(status.toUpperCase());
            onGetLocationAuthorizationStatus(status); // platform-specific
        }, onError);
    }


    if(platform === "ios"){
        onGetLocationAuthorizationStatus = function(status){
            $('.request-location').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }
    }

    if(platform === "android"){
        cordova.plugins.diagnostic.isGpsLocationAvailable(function(available){
            $('#state .gps-location').addClass(available ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isNetworkLocationAvailable(function(available){
            $('#state .network-location').addClass(available ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
            $('#state .gps-location-setting').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isNetworkLocationEnabled(function(enabled){
            $('#state .network-location-setting').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getLocationMode(function(mode){
            $('#state .location-mode').find('.value').text(mode.toUpperCase());
        }, onError);

        onGetLocationAuthorizationStatus = function(status){
            $('#request-location').toggle(status != cordova.plugins.diagnostic.permissionStatus.GRANTED && status != cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
        };

        cordova.plugins.diagnostic.hasBluetoothSupport(function(supported){
            $('#state .bluetooth-support').addClass(supported ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.hasBluetoothLESupport(function(supported){
            $('#state .bluetooth-le-support').addClass(supported ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.hasBluetoothLEPeripheralSupport(function(supported){
            $('#state .bluetooth-le-peripheral-support').addClass(supported ? 'on' : 'off');
        }, onError);

        // NFC
        cordova.plugins.diagnostic.isNFCPresent(function (present) {
            $('#state .nfc-present').addClass(present ? 'on' : 'off');
            if(!present){
                $('#nfc-settings')
                    .attr('disabled', 'disabled')
                    .addClass('disabled');
            }
        }, onError);

        cordova.plugins.diagnostic.isNFCEnabled(function (enabled) {
            $('#state .nfc-enabled').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isNFCAvailable(function (available) {
            $('#state .nfc-available').addClass(available ? 'on' : 'off');
        }, onError);
    }


    // Camera
    var onGetCameraAuthorizationStatus;
    cordova.plugins.diagnostic.isCameraAvailable({
        successCallback: function(available){
            $('#state .camera').addClass(available ? 'on' : 'off');
        },
        errorCallback: onError,
        externalStorage: true
    });

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isCameraPresent(function (present) {
            $('#state .camera-present').addClass(present ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isCameraAuthorized({
            successCallback: function (authorized) {
                $('#state .camera-authorized').addClass(authorized ? 'on' : 'off');
            },
            errorCallback: onError,
            externalStorage: true
        });

        cordova.plugins.diagnostic.getCameraAuthorizationStatus({
            successCallback: function (status) {
                $('#state .camera-authorization-status').find('.value').text(status.toUpperCase());
                onGetCameraAuthorizationStatus(status);
            },
            errorCallback: onError,
            externalStorage: true
        });

    }

    if(platform === "ios"){
        cordova.plugins.diagnostic.isCameraRollAuthorized(function(authorized){
            $('#state .camera-roll-authorized').addClass(authorized ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getCameraRollAuthorizationStatus(function(status){
            $('#state .camera-roll-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-camera-roll').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }, onError);

        onGetCameraAuthorizationStatus = function(status){
            $('#request-camera').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }
    }

    if(platform === "android"){
        onGetCameraAuthorizationStatus = function(status){
            $('#request-camera').toggle(status != cordova.plugins.diagnostic.permissionStatus.GRANTED && status != cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
        }
    }

    // Wifi
    cordova.plugins.diagnostic.isWifiAvailable(function(available){
        $('#state .wifi').addClass(available ? 'on' : 'off');

        if(platform === "android" || platform === "windows") {
            $('#enable-wifi').toggle(!available);
            $('#disable-wifi').toggle(!!available);
        }
    }, onError);

    cordova.plugins.diagnostic.isWifiEnabled(function(available){
        $('#state .wifi-setting').addClass(available ? 'on' : 'off');
    }, onError);

    // Bluetooth
    cordova.plugins.diagnostic.isBluetoothAvailable(function(available){
        $('#state .bluetooth-available').addClass(available ? 'on' : 'off');

        if(platform === "android" || platform === "windows") {
            $('#enable-bluetooth').toggle(!available);
            $('#disable-bluetooth').toggle(!!available);
        }
    }, onError);

    if(platform === "android"){
        cordova.plugins.diagnostic.isBluetoothEnabled(function(enabled){
            $('#state .bluetooth-setting').addClass(enabled ? 'on' : 'off');
        }, onError);
    }

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.getBluetoothState(function (state) {
            $('#state .bluetooth-state').find('.value').text(state.toUpperCase());
            $('#request-bluetooth').toggle(status === cordova.plugins.diagnostic.permissionStatus.DENIED);
        }, onError);
    }

    // Microphone
    var onGetMicrophoneAuthorizationStatus;

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isMicrophoneAuthorized(function (enabled) {
            $('#state .microphone-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getMicrophoneAuthorizationStatus(function (status) {
            $('#state .microphone-authorization-status').find('.value').text(status.toUpperCase());
            onGetMicrophoneAuthorizationStatus(status);
        }, onError);
    }

    if(platform === "ios"){
        onGetMicrophoneAuthorizationStatus = function(status){
            $('#request-microphone').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }
    }

    if(platform === "android"){
        onGetMicrophoneAuthorizationStatus = function(status){
            $('#request-microphone').toggle(status != cordova.plugins.diagnostic.permissionStatus.GRANTED && status != cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
        }
    }

    // Contacts
    var onGetContactsAuthorizationStatus;

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isContactsAuthorized(function (enabled) {
            $('#state .contacts-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getContactsAuthorizationStatus(function (status) {
            $('#state .contacts-authorization-status').find('.value').text(status.toUpperCase());
            onGetContactsAuthorizationStatus(status);
        }, onError);
    }

    if(platform === "ios"){
        onGetContactsAuthorizationStatus = function(status){
            $('#request-contacts').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }
    }

    if(platform === "android"){
        onGetContactsAuthorizationStatus = function(status){
            $('#request-contacts').toggle(status != cordova.plugins.diagnostic.permissionStatus.GRANTED && status != cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
        }
    }

    // Calendar
    var onGetCalendarAuthorizationStatus;

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isCalendarAuthorized(function (enabled) {
            $('#state .calendar-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getCalendarAuthorizationStatus(function (status) {
            $('#state .calendar-authorization-status').find('.value').text(status.toUpperCase());
            onGetCalendarAuthorizationStatus(status);
        }, onError);
    }

    if(platform === "ios"){
        onGetCalendarAuthorizationStatus = function(status){
            $('#request-calendar').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }
    }

    if(platform === "android"){
        onGetCalendarAuthorizationStatus = function(status){
            $('#request-calendar').toggle(status != cordova.plugins.diagnostic.permissionStatus.GRANTED && status != cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
        }
    }


    if(platform === "ios") {
        // Reminders
        cordova.plugins.diagnostic.isRemindersAuthorized(function (enabled) {
            $('#state .reminders-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getRemindersAuthorizationStatus(function (status) {
            $('#state .reminders-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-reminders').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }, onError);

        // Background refresh
        cordova.plugins.diagnostic.isBackgroundRefreshAuthorized(function (enabled) {
            $('#state .background-refresh-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getBackgroundRefreshStatus(function (status) {
            $('#state .background-refresh-authorization-status').find('.value').text(status.toUpperCase());
        }, onError);

        // Remote notifications
        cordova.plugins.diagnostic.isRemoteNotificationsEnabled(function (enabled) {
            $('#state .remote-notifications-enabled').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.isRegisteredForRemoteNotifications(function (enabled) {
            $('#state .remote-notifications-registered').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getRemoteNotificationTypes(function (types) {
            var value = "";
            for (var type in types){
                value += type + "=" + (types[type] ? "Y" : "N") +"; ";
            }
            $('#state .remote-notifications-types').find('.value').text(value);
        }, onError);

        // Motion
        cordova.plugins.diagnostic.isMotionAvailable(function (available) {
            $('#state .motion-available').addClass(available ? 'on' : 'off');
            if(!available){
                $('#request-motion')
                    .attr('disabled', 'disabled')
                    .addClass('disabled');
            }
        }, onError);

        cordova.plugins.diagnostic.isMotionRequestOutcomeAvailable(function (available) {
            $('#state .motion-request-outcome-available').addClass(available ? 'on' : 'off');
        }, onError);
    }

    // External SD card
    if(platform === "android"){
        cordova.plugins.diagnostic.isExternalStorageAuthorized(function (enabled) {
            $('#state .external-sd-authorized').addClass(enabled ? 'on' : 'off');
        }, onError);

        cordova.plugins.diagnostic.getExternalStorageAuthorizationStatus(function (status) {
            $('#state .external-sd-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-external-sd-permission').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
            $('#request-external-sd-details').toggle(status === cordova.plugins.diagnostic.permissionStatus.GRANTED);
        }, onError);
    }
}

function onError(error){
    console.error("An error occurred: "+error);
}

function onResume(){
    checkState();
}


$(document).on("deviceready", onDeviceReady);