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

    // Register change listeners for iOS
    if(platform === "ios" && osVersion >= 14) {
        cordova.plugins.diagnostic.registerLocationAccuracyAuthorizationChangeHandler(function (accuracyAuthorization) {
            log("Location accuracy authorization changed to: " + accuracyAuthorization);
            checkState();
        }, function (error) {
            handleError("Error registering for location accuracy authorization changes: " + error);
        });
    }

    // iOS+Android settings
    $('#request-location').on("click", function(){
        var locationRequestType = $('#location-request-type').val() === 'always' ? cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS : cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE,
            locationAccuracyType = $('#location-accuracy-type').val() === 'precise' ? cordova.plugins.diagnostic.locationAccuracyAuthorization.FULL : cordova.plugins.diagnostic.locationAccuracyAuthorization.REDUCED;

        cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
            log("Successfully requested location authorization: authorization was " + status);
            checkState();

            if(platform === "ios" && osVersion >= 14 && locationAccuracyType === cordova.plugins.diagnostic.locationAccuracyAuthorization.FULL && status.match("GRANTED")){
                cordova.plugins.diagnostic.requestTemporaryFullAccuracyAuthorization("navigation", function(accuracyAuthorization){
                    log("User chose accuracy authorization:" + accuracyAuthorization);
                    checkState();
                }, handleError);
            }
        }, handleError, locationRequestType, locationAccuracyType);
    });

    $('#request-camera').on("click", function(){
        var externalStorage = $('#camera-external-storage').val() === 'yes';
        cordova.plugins.diagnostic.requestCameraAuthorization({
            successCallback: function(status){
                log("Successfully requested camera authorization: authorization was " + status);
                checkState();
            },
            errorCallback: handleError,
            storage: externalStorage
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
    $('#request-camera-roll').on("click", function(){
        var accessLevel = $('#camera-roll-access-level').val();
        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status){
            log("Successfully requested camera roll authorization: authorization was " + status);
            checkState();
        }, handleError, accessLevel);
    });
    $('#present-limited-photo-library-picker').on("click", function(){
        cordova.plugins.diagnostic.presentLimitedLibraryPicker(function(identifiers){
            var msg = "Successfully presented limited library picker UI";
            if(identifiers && identifiers.length){
                msg += " - added identifiers: " + identifiers.join(',');
            }
            log(msg);
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
        var permissions;
        if(platform === "android"){
            permissions = [];
            $("#bluetooth-permission-types :selected").each(function(){
                permissions.push($(this).val());
            });
        }
        cordova.plugins.diagnostic.requestBluetoothAuthorization(function(){
            log("Successfully requested Bluetooth authorization");
            if(!monitoringBluetooth) registerBluetoothStateChangeHandler();
            checkState();
        }, handleError, permissions);
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

        cordova.plugins.diagnostic.getCurrentBatteryLevel(function (level) {
            $('#state .battery-level').find('.value').text(level+'%');
        }, handleError);

        cordova.plugins.diagnostic.getBluetoothAuthorizationStatus(function(status){
            $('#state .bluetooth-authorization-status').find('.value').text(status.toUpperCase());
        }, handleError);

    }


    if(platform === "ios"){
        onGetLocationAuthorizationStatus = function(status){
            console.log('Location auth status: ' + status);
        }
    }

    if((platform === "ios" && osVersion >= 14) || platform === "android"){
        cordova.plugins.diagnostic.getLocationAccuracyAuthorization(function(accuracyAuthorization){
            var displayValue = accuracyAuthorization ? accuracyAuthorization.toUpperCase() : "UNKNOWN";
            $('#state .location-accuracy-authorization').find('.value').text(displayValue);
        }, handleError);
    }

    if(platform === "android"){

        // Location
        cordova.plugins.diagnostic.getLocationAuthorizationStatuses(function(statuses){
            var value = "";
            for(var status in statuses){
                if(value) value += "<br/>";
                value += status.toUpperCase() + ": " + statuses[status].toUpperCase();
            }
            $('#state .location-authorization-statuses').find('.value').html(value);
        }, handleError);

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
            console.log('Location auth status: ' + status);
        };


        // Bluetooth
        cordova.plugins.diagnostic.hasBluetoothSupport(function(supported){
            $('#state .bluetooth-support').addClass(supported ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.hasBluetoothLESupport(function(supported){
            $('#state .bluetooth-le-support').addClass(supported ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.hasBluetoothLEPeripheralSupport(function(supported){
            $('#state .bluetooth-le-peripheral-support').addClass(supported ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.getBluetoothAuthorizationStatuses(function(statuses){
            var value = "";
            for(var status in statuses){
                if(value) value += "<br/>";
                value += status.toUpperCase() + ": " + statuses[status].toUpperCase();
            }
            $('#state .bluetooth-authorization-statuses').find('.value').html(value);
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
    var externalStorage = $('#camera-external-storage').val() === 'yes';
    cordova.plugins.diagnostic.isCameraAvailable({
        successCallback: function(available){
            $('#state .camera').addClass(available ? 'on' : 'off');
        },
        errorCallback: handleError,
        storage: externalStorage
    });

    if(platform === "android" || platform === "ios") {
        cordova.plugins.diagnostic.isCameraPresent(function (present) {
            $('#state .camera-present').addClass(present ? 'on' : 'off');
        }, handleError);

        var externalStorage = $('#camera-external-storage').val() === 'yes';
        cordova.plugins.diagnostic.isCameraAuthorized({
            successCallback: function (authorized) {
                $('#state .camera-authorized').addClass(authorized ? 'on' : 'off');
            },
            errorCallback: handleError,
            storage: externalStorage
        });

        cordova.plugins.diagnostic.getCameraAuthorizationStatus({
            successCallback: function (status) {
                $('#state .camera-authorization-status').find('.value').text(status.toUpperCase());
                onGetCameraAuthorizationStatus(status);
            },
            errorCallback: handleError,
            storage: externalStorage
        });

    }

    if(platform === "ios"){
        var accessLevel = $('#camera-roll-access-level').val();
        cordova.plugins.diagnostic.isCameraRollAuthorized(function(authorized){
            $('#state .camera-roll-authorized').addClass(authorized ? 'on' : 'off');
        }, handleError, accessLevel);

        cordova.plugins.diagnostic.getCameraRollAuthorizationStatus(function(status){
            $('#state .camera-roll-authorization-status').find('.value').text(status.toUpperCase());
            console.log('Camera roll auth status: ' + status);
        }, handleError, accessLevel);
    }
    onGetCameraAuthorizationStatus = function(status){
        console.log('Camera auth status: ' + status);
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
        cordova.plugins.diagnostic.getBuildOSVersion(function(details){
            if(details.targetApiLevel <= 32){
                cordova.plugins.diagnostic.isDataRoamingEnabled(function(enabled){
                    $('#state .data-roaming').addClass(enabled ? 'on' : 'off');
                }, handleError);
            }else{
                log("Data roaming setting not available on Android 12L / API32+");
            }
        });
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

    onGetMicrophoneAuthorizationStatus = function(status){
        console.log('Microphone auth status: ' + status);
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

    onGetContactsAuthorizationStatus = function(status){
        console.log('Contacts auth status: ' + status);
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

    onGetCalendarAuthorizationStatus = function(status){
        console.log('Calendar auth status: ' + status);
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
            console.log('Reminders auth status: ' + status);

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
                console.log('Remote notifications auth status: ' + status);
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
            console.log('External SD auth status: ' + status);
        }, handleError);
    }


    //Misc
    cordova.plugins.diagnostic.isMobileDataEnabled(function(enabled){
        $('#state .mobile-data').addClass(enabled ? 'on' : 'off');
    }, handleError);

    if(platform === "android"){
        cordova.plugins.diagnostic.isADBModeEnabled(function(enabled){
            $('#state .adb').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isDeviceRooted(function(enabled){
            $('#state .root').addClass(enabled ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isDebugBuild(function(isDebug){
            $('#state .build-type').addClass(isDebug ? 'on' : 'off');
        }, handleError);

        cordova.plugins.diagnostic.isAirplaneModeEnabled(function(enabled){
            $('#state .airplane-mode').addClass(enabled ? 'on' : 'off');
        }, handleError);
    }

    if(platform === "android" || platform === "ios"){
        cordova.plugins.diagnostic.getArchitecture(function (arch) {
            $('#state .cpu-architecture').find('.value').text(arch.toUpperCase());
        });

        // OS version
        cordova.plugins.diagnostic.getDeviceOSVersion(function(details){
            $('#state .device-os-version .value').text(details.version);
            $('#state .device-os-api-level .value').text(details.apiLevel);
            $('#state .device-os-api-name .value').text(details.apiName);
        });

        cordova.plugins.diagnostic.getBuildOSVersion(function(details){
            $('#state .target-api-level .value').text(details.targetApiLevel);
            $('#state .target-api-name .value').text(details.targetApiName);
            $('#state .min-api-level .value').text(details.minApiLevel);
            $('#state .min-api-name .value').text(details.minApiName);
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
