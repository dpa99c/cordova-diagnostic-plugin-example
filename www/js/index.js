var platform, osVersion, monitoringBluetooth = false;
function onDeviceReady() {
    osVersion = parseFloat(device.version);
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
        cordova.plugins.diagnostic.enableDebug();

        cordova.plugins.diagnostic.registerLocationStateChangeHandler(function (state) {
            log("Location state changed to: " + state);
            checkState();
        }, function (error) {
            handleError("Error registering for location state changes: " + error);
        });
    }

    // Register change listeners for Android
    if(platform === "android"){
        cordova.plugins.diagnostic.registerPermissionRequestCompleteHandler(function(statuses){
            console.info("Permission request complete");
            for (var permission in statuses){
                switch(statuses[permission]){
                    case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                        log("Permission granted to use "+permission);
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                        log("Permission to use "+permission+" has not been requested yet");
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE:
                        log("Permission denied to use "+permission);
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                        log("Permission permanently denied to use "+permission);
                        break;
                }
            }
        });

        cordova.plugins.diagnostic.registerNFCStateChangeHandler(function (state) {
            log("NFC state changed to: " + state);
            checkState();
        }, function (error) {
            handleError("Error registering for NFC state changes: " + error);
        });

        registerBluetoothStateChangeHandler();
    }

    // iOS+Android settings
    $('#request-camera').on("click", function(){
        cordova.plugins.diagnostic.requestCameraAuthorization({
            successCallback: function(status){
                log("Successfully requested camera authorization: authorization was " + status);
                checkState();
            },
            errorCallback: handleError,
            externalStorage: true
        });
    });

    $('#settings').on("click", function(){
        cordova.plugins.diagnostic.switchToSettings(function(){
            log("Successfully opened settings");
        }, handleError);
    });

    $('#request-microphone').on("click", function(){
        cordova.plugins.diagnostic.requestMicrophoneAuthorization(function(status){
            log("Successfully requested microphone authorization: authorization was " + status);
            checkState();
        }, handleError);
    });

    $('#request-contacts').on("click", function(){
        cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
            log("Successfully requested contacts authorization: authorization was " + status);
            checkState();
        }, handleError);
    });

    $('#request-calendar').on("click", function(){
        cordova.plugins.diagnostic.requestCalendarAuthorization(function(status){
            log("Successfully requested calendar authorization: authorization was " + status);
            checkState();
        }, handleError);
    });


    // iOS settings
    var onLocationRequestChange = function(status){
        log("Successfully requested location authorization: authorization was " + status);
        checkState();
    };
    $('#request-location-always').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(onLocationRequestChange, handleError, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
    });

    $('#request-location-in-use').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(onLocationRequestChange, handleError, cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE);
    });

    $('#request-camera-roll').on("click", function(){
        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status){
            log("Successfully requested camera roll authorization: authorization was " + status);
            checkState();
        }, handleError);
    });

    $('#request-reminders').on("click", function(){
        cordova.plugins.diagnostic.requestRemindersAuthorization(function(status){
            log("Successfully requested reminders authorization: authorization was " + status);
            checkState();
        }, handleError);
    });

    $('#request-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.requestBluetoothAuthorization(function(){
            log("Successfully requested Bluetooth authorization");
            if(!monitoringBluetooth) registerBluetoothStateChangeHandler();
            checkState();
        }, handleError);
    });

    $('#monitor-bluetooth').on("click", function(){
        registerBluetoothStateChangeHandler();
        $('#monitor-bluetooth').remove();
    });

    $('#request-motion').on("click", function(){
        cordova.plugins.diagnostic.requestMotionAuthorization(handleMotionAuthorizationStatus, handleError);
    });

    // Android settings
    $('#warm-restart').on("click", function(){
        cordova.plugins.diagnostic.restart(handleError, false);
    });

    $('#cold-restart').on("click", function(){
        cordova.plugins.diagnostic.restart(handleError, true);
    });

    $('#request-location').on("click", function(){
        cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
            log("Successfully requested location authorization: authorization was " + status);
        }, handleError);
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
            log("Successfully enabled Wifi");
            setTimeout(checkState, 100);
        }, handleError, true);
    });

    $('#disable-wifi').on("click", function(){
        cordova.plugins.diagnostic.setWifiState(function(){
            log("Successfully disabled Wifi");
            setTimeout(checkState, 100);
        }, handleError, false);
    });

    $('#enable-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.setBluetoothState(function(){
            log("Successfully enabled Bluetooth");
            setTimeout(checkState, 1000);
        }, handleError, true);
    });

    $('#disable-bluetooth').on("click", function(){
        cordova.plugins.diagnostic.setBluetoothState(function(){
            log("Successfully disabled Bluetooth");
            setTimeout(checkState, 1000);
        }, handleError, false);
    });

    $('#get-location').on("click", function(){
        var posOptions = { timeout: 35000, enableHighAccuracy: true, maximumAge: 5000 };
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            log("Current position: "+lat+","+lon, true);
        }, function (err) {
            handleError("Position error: code="+ err.code + "; message=" + err.message);
        }, posOptions);
    });

    $('#use-camera').on("click", function(){
        navigator.camera.getPicture(function(){
            log("Successfully took a photo", true);
        }, function(err){
            handleError("Camera error: "+ err);
        }, {
            saveToPhotoAlbum: false,
            destinationType: Camera.DestinationType.DATA_URL
        });
    });

    $('#request-remote-notifications button').on("click", function(){
        var types = [];
        $("#request-remote-notifications select :selected").each(function(){
            types.push($(this).val());
        });
        cordova.plugins.diagnostic.requestRemoteNotificationsAuthorization({
            successCallback: function(result){
                log("Successfully requested remote notifications authorization: " + result);
                checkState();
            },
            errorCallback: handleError,
            types: types,
            omitRegistration: false
        });
    });

    $('#request-external-sd-permission').on("click", function(){
        cordova.plugins.diagnostic.requestExternalStorageAuthorization(function(status){
            log("Successfully requested external storage authorization: authorization was " + status);
            checkState();
        }, handleError);
    });

    $('#request-external-sd-details').on("click", function(){
        cordova.plugins.diagnostic.getExternalSdCardDetails(function(details){
            log("Successfully retrieved external SD card details");
            var $results = $('#request-external-sd-details-results');
            $results.show().empty();
            if(details.length > 0){
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
            }else{
                alert("No external storage found");
            }
        }, handleError);
    });

    $('#write-external-sd-file').on("click", function(){
        var targetDir = cordova.file.externalSdCardDirectory;
        var filename = "test.txt";
        var targetFilepath = targetDir + "/" + filename;

        var fail = function(error) {
            var msg = 'Failed to write file \'' + targetFilepath + '\'. Error code: ' + error.code;
            handleError(msg);
        };
        window.resolveLocalFileSystemURL(targetDir, function (dirEntry) {
            dirEntry.getFile(filename, {
                create: true,
                exclusive: false
            }, function (fileEntry) {
                fileEntry.createWriter(function (writer) {
                    writer.onwriteend = function (evt) {
                        log("Wrote "+targetFilepath, true);
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
            log('BackgroundFetch initiated');
            $.get({
                url: 'index.html',
                callback: function(response) {
                    log("BackgroundFetch successful");
                    Fetcher.finish();
                }
            });
        };
        var failureCallback = function() {
            handleError('- BackgroundFetch failed');
        };
        Fetcher.configure(fetchCallback, failureCallback, {
            stopOnTerminate: true
        });
    }

    setTimeout(checkState, 500);
}


function checkState(){
    log("Checking state...");

    $('#state li').removeClass('on off');

    // Location
    var onGetLocationAuthorizationStatus;
    cordova.plugins.diagnostic.isLocationAvailable(function(available){
        $('#state .location').addClass(available ? 'on' : 'off');
    }, handleError);

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
            $('#state .location-setting').addClass(enabled ? 'on' : 'off');
        }, handleError);


        cordova.plugins.diagnostic.isLocationAuthorized(function(enabled){
            $('#state .location-authorization').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
            $('#state .location-authorization-status').find('.value').text(status.toUpperCase());
            onGetLocationAuthorizationStatus(status); // platform-specific
        }, handleError);
    }


    if(platform === "ios"){
        onGetLocationAuthorizationStatus = function(status){
            $('.request-location').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }
    }

    if(platform === "android"){
        cordova.plugins.diagnostic.isGpsLocationAvailable(function(available){
            $('#state .gps-location').addClass(available ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isNetworkLocationAvailable(function(available){
            $('#state .network-location').addClass(available ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
            $('#state .gps-location-setting').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isNetworkLocationEnabled(function(enabled){
            $('#state .network-location-setting').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getLocationMode(function(mode){
            $('#state .location-mode').find('.value').text(mode.toUpperCase());
        }, handleError);

        onGetLocationAuthorizationStatus = function(status){
            $('#request-location').toggle(status != cordova.plugins.diagnostic.permissionStatus.GRANTED && status != cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
        };

        cordova.plugins.diagnostic.hasBluetoothSupport(function(supported){
            $('#state .bluetooth-support').addClass(supported ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.hasBluetoothLESupport(function(supported){
            $('#state .bluetooth-le-support').addClass(supported ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.hasBluetoothLEPeripheralSupport(function(supported){
            $('#state .bluetooth-le-peripheral-support').addClass(supported ? 'on' : 'off');
        }, handleError);

        // NFC
        cordova.plugins.diagnostic.isNFCPresent(function (present) {
            $('#state .nfc-present').addClass(present ? 'on' : 'off');
            if(!present){
                $('#nfc-settings')
                    .attr('disabled', 'disabled')
                    .addClass('disabled');
            }
        }, handleError);

        cordova.plugins.diagnostic.isNFCEnabled(function (enabled) {
            $('#state .nfc-enabled').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isNFCAvailable(function (available) {
            $('#state .nfc-available').addClass(available ? 'on' : 'off');
        }, handleError);
    }


    // Camera
    var onGetCameraAuthorizationStatus;
    cordova.plugins.diagnostic.isCameraAvailable({
        successCallback: function(available){
            $('#state .camera').addClass(available ? 'on' : 'off');
        },
        errorCallback: handleError,
        externalStorage: true
    });

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isCameraPresent(function (present) {
            $('#state .camera-present').addClass(present ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isCameraAuthorized({
            successCallback: function (authorized) {
                $('#state .camera-authorized').addClass(authorized ? 'on' : 'off');
            },
            errorCallback: handleError,
            externalStorage: true
        });

        cordova.plugins.diagnostic.getCameraAuthorizationStatus({
            successCallback: function (status) {
                $('#state .camera-authorization-status').find('.value').text(status.toUpperCase());
                onGetCameraAuthorizationStatus(status);
            },
            errorCallback: handleError,
            externalStorage: true
        });

    }

    if(platform === "ios"){
        cordova.plugins.diagnostic.isCameraRollAuthorized(function(authorized){
            $('#state .camera-roll-authorized').addClass(authorized ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getCameraRollAuthorizationStatus(function(status){
            $('#state .camera-roll-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-camera-roll').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }, handleError);

        onGetCameraAuthorizationStatus = function(status){
            $('#request-camera').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }
    }

    if(platform === "android"){
        onGetCameraAuthorizationStatus = function(status){
            $('#request-camera').toggle(status != cordova.plugins.diagnostic.permissionStatus.GRANTED && status != cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
        }
    }

    // Network
    cordova.plugins.diagnostic.isWifiAvailable(function(available){
        $('#state .wifi').addClass(available ? 'on' : 'off');

        if(platform === "android" || platform === "windows") {
            $('#enable-wifi').toggle(!available);
            $('#disable-wifi').toggle(!!available);
        }
    }, handleError);

    cordova.plugins.diagnostic.isWifiEnabled(function(available){
        $('#state .wifi-setting').addClass(available ? 'on' : 'off');
    }, handleError);

    if(platform === "android"){
        cordova.plugins.diagnostic.isDataRoamingEnabled(function(enabled){
            $('#state .data-roaming').addClass(enabled ? 'on' : 'off');
        }, handleError);
    }


    // Bluetooth
    if(monitoringBluetooth) {
        cordova.plugins.diagnostic.isBluetoothAvailable(function (available) {
            $('#state .bluetooth-available').addClass(available ? 'on' : 'off');

            if (platform === "android" || platform === "windows") {
                $('#enable-bluetooth').toggle(!available);
                $('#disable-bluetooth').toggle(!!available);
            }
        }, handleError);

        if (platform === "android") {
            cordova.plugins.diagnostic.isBluetoothEnabled(function (enabled) {
                $('#state .bluetooth-setting').addClass(enabled ? 'on' : 'off');
            }, handleError);
        }

        if (platform === "android" || platform === "ios") {
            cordova.plugins.diagnostic.getBluetoothState(function (state) {
                $('#state .bluetooth-state').find('.value').text(state.toUpperCase());
                $('#request-bluetooth, #monitor-bluetooth').toggle(state === cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS);
            }, handleError);
        }
    }

    // Microphone
    var onGetMicrophoneAuthorizationStatus;

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isMicrophoneAuthorized(function (enabled) {
            $('#state .microphone-authorized').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getMicrophoneAuthorizationStatus(function (status) {
            $('#state .microphone-authorization-status').find('.value').text(status.toUpperCase());
            onGetMicrophoneAuthorizationStatus(status);
        }, handleError);
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
        }, handleError);

        cordova.plugins.diagnostic.getContactsAuthorizationStatus(function (status) {
            $('#state .contacts-authorization-status').find('.value').text(status.toUpperCase());
            onGetContactsAuthorizationStatus(status);
        }, handleError);
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
        }, handleError);

        cordova.plugins.diagnostic.getCalendarAuthorizationStatus(function (status) {
            $('#state .calendar-authorization-status').find('.value').text(status.toUpperCase());
            onGetCalendarAuthorizationStatus(status);
        }, handleError);
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

    if(platform === "ios" || platform === "android") {
        // Remote notifications
        cordova.plugins.diagnostic.isRemoteNotificationsEnabled(function (enabled) {
            $('#state .remote-notifications-enabled').addClass(enabled ? 'on' : 'off');
        }, handleError);
    }

    if(platform === "ios") {
        // Reminders
        cordova.plugins.diagnostic.isRemindersAuthorized(function (enabled) {
            $('#state .reminders-authorized').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getRemindersAuthorizationStatus(function (status) {
            $('#state .reminders-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-reminders').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
        }, handleError);

        // Background refresh
        cordova.plugins.diagnostic.isBackgroundRefreshAuthorized(function (enabled) {
            $('#state .background-refresh-authorized').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getBackgroundRefreshStatus(function (status) {
            $('#state .background-refresh-authorization-status').find('.value').text(status.toUpperCase());
        }, handleError);

        // Remote notifications
        var $remoteNotificationsAuthorizationStatusValue = $('#state .remote-notifications-authorization-status').find('.value');
        if(osVersion >= 10){
            cordova.plugins.diagnostic.getRemoteNotificationsAuthorizationStatus(function (status) {
                $remoteNotificationsAuthorizationStatusValue.text(status.toUpperCase());
                $('#request-remote-notifications').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
            }, handleError);
        }else{
            $remoteNotificationsAuthorizationStatusValue.text("UNAVAILABLE");
        }

        cordova.plugins.diagnostic.isRegisteredForRemoteNotifications(function (enabled) {
            $('#state .remote-notifications-registered').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getRemoteNotificationTypes(function (types) {
            var value = "";
            for (var type in types){
                value += type + "=" + (types[type] ? "Y" : "N") +"; ";
            }
            $('#state .remote-notifications-types').find('.value').text(value);
        }, handleError);

        // Motion
        cordova.plugins.diagnostic.isMotionAvailable(function (available) {
            $('#state .motion-available').addClass(available ? 'on' : 'off');
            if(!available){
                $('#request-motion')
                    .attr('disabled', 'disabled')
                    .addClass('disabled');
            }
        }, handleError);

        cordova.plugins.diagnostic.isMotionRequestOutcomeAvailable(function (available) {
            $('#state .motion-request-outcome-available').addClass(available ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getMotionAuthorizationStatus(handleMotionAuthorizationStatus, handleError);

    }

    // External SD card
    if(platform === "android"){
        cordova.plugins.diagnostic.isExternalStorageAuthorized(function (enabled) {
            $('#state .external-sd-authorized').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getExternalStorageAuthorizationStatus(function (status) {
            $('#state .external-sd-authorization-status').find('.value').text(status.toUpperCase());
            $('#request-external-sd-permission').toggle(status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED);
            $('#request-external-sd-details').toggle(status === cordova.plugins.diagnostic.permissionStatus.GRANTED);
        }, handleError);
    }


    //Misc
    if(platform === "android"){
        cordova.plugins.diagnostic.isADBModeEnabled(function(enabled){
            $('#state .adb').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isDeviceRooted(function(enabled){
            $('#state .root').addClass(enabled ? 'on' : 'off');
        }, handleError);
    }

    if(platform === "android" || platform === "ios"){
        cordova.plugins.diagnostic.getArchitecture(function (arch) {
            $('#state .cpu-architecture').find('.value').text(arch.toUpperCase());
        });
    }
}

function handleError(error){
    var msg = "Error: "+error;
    console.error(msg);
    alert(msg);
}

function log(msg, showAlert){
    console.log(msg);
    if(showAlert){
        alert(msg);
    }
}

function onResume(){
    checkState();
}

function handleMotionAuthorizationStatus(status) {
    $('#state .motion-authorization-status').find('.value').text(status.toUpperCase());
    if(status === cordova.plugins.diagnostic.motionStatus.NOT_REQUESTED){
        $('#request-motion')
            .removeAttr('disabled')
            .removeClass('disabled');
    }else{
        $('#request-motion')
            .attr('disabled', 'disabled')
            .addClass('disabled');
    }
}

function registerBluetoothStateChangeHandler(){
    cordova.plugins.diagnostic.registerBluetoothStateChangeHandler(function (state) {
        log("Bluetooth state changed to: " + state);
        checkState();
    }, function (error) {
        handleError("Error registering for Bluetooth state changes: " + error);
    });
    monitoringBluetooth = true;
}


$(document).on("deviceready", onDeviceReady);
