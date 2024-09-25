package com.ssivixlab.MYCLNQ;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.crrepa.ble.conn.CRPBleConnection;
import com.crrepa.ble.conn.CRPBleDevice;
import com.crrepa.ble.CRPBleClient;
import com.ssivixlab.MYCLNQ.MainApplication;
import com.crrepa.ble.conn.listener.CRPBleConnectionStateListener;
import com.crrepa.ble.conn.listener.CRPStepChangeListener;
import com.crrepa.ble.conn.type.CRPHistoryDay;
import com.crrepa.ble.conn.bean.CRPStepInfo;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import javax.annotation.Nullable;
import com.crrepa.ble.conn.type.CRPHeartRateType;
import com.crrepa.ble.conn.listener.CRPSleepChangeListener;
import com.crrepa.ble.conn.bean.CRPSleepInfo;
import com.crrepa.ble.conn.listener.CRPHeartRateChangeListener;
import com.crrepa.ble.conn.bean.CRPHistoryHeartRateInfo;
import com.crrepa.ble.conn.type.CRPHistoryDynamicRateType;
import com.crrepa.ble.conn.bean.CRPHeartRateInfo;
import com.crrepa.ble.conn.bean.CRPMovementHeartRateInfo;
import com.crrepa.ble.conn.bean.CRPHistoryTrainingInfo;
import com.crrepa.ble.conn.bean.CRPTrainingInfo;
import com.crrepa.ble.conn.listener.CRPBloodOxygenChangeListener;
import com.crrepa.ble.conn.bean.CRPBloodOxygenInfo;
import com.crrepa.ble.conn.bean.CRPHistoryBloodOxygenInfo;
import com.crrepa.ble.conn.listener.CRPTempChangeListener;
import com.crrepa.ble.conn.listener.CRPTrainingChangeListener;
import java.util.List;
import com.crrepa.ble.conn.bean.CRPTempInfo;
import com.facebook.react.bridge.WritableArray;
import com.crrepa.ble.conn.callback.CRPDeviceDisplayTimeCallback;
import android.util.Log;
import com.crrepa.ble.conn.listener.CRPBloodPressureChangeListener;
import com.crrepa.ble.conn.bean.CRPHistoryBloodPressureInfo;
import com.crrepa.ble.conn.bean.CRPBloodPressureInfo;
import com.crrepa.ble.ota.sifli.SifliDfuController;
import com.crrepa.ble.conn.listener.CRPBleFirmwareUpgradeListener;

public class CRPBluetoothModule extends ReactContextBaseJavaModule {
    CRPBleConnection bleConnection;
    CRPBleClient bleClient;

    CRPBluetoothModule(ReactApplicationContext context) {
        super(context);
        bleClient = MainApplication.getBleClient();
    }

    @Override
    public String getName() {
        return "CRPBluetoothModule";
    }

    @ReactMethod
    public void connectToDevice(String macAddress, String deviceName, Promise promise) {
        try {



            Log.d("THIS_IS_MY_TAG", "connecting to device: mac address=" + macAddress + ", device name=" + deviceName);

            if (bleConnection != null) {
                Log.d("THIS_IS_MY_TAG", "data not getting ble connection is not null so closing it to try again");
                bleConnection.close();
            }

            Log.d("THIS_IS_MY_TAG", "before get ble device");

            CRPBleDevice bleDevice = bleClient.getBleDevice(macAddress);

            Log.d("THIS_IS_MY_TAG", "before connect device");
            //bleDevice.disconnect();
            bleConnection = bleDevice.connect();

            bleConnection.setConnectionStateListener(new CRPBleConnectionStateListener() {
                @Override
                public void onConnectionStateChange(int newState) {
                    Log.d("THIS_IS_MY_TAG", "onConnectionStateChange: " + newState);
                    switch (newState) {
                        case CRPBleConnectionStateListener.STATE_CONNECTED:
                            testSet();
                            break;
                        case CRPBleConnectionStateListener.STATE_CONNECTING:
                            break;
                        case CRPBleConnectionStateListener.STATE_DISCONNECTED:
                            closeGatt();
                            break;
                    }
                }
            });



            Log.d("THIS_IS_MY_TAG", "after connect ble device: " + bleConnection);
            bleConnection.setStepChangeListener(mStepChangeListener);

            Log.d("THIS_IS_MY_TAG", "after step listner");
            bleConnection.setSleepChangeListener(mSleepChangeListener);
            Log.d("THIS_IS_MY_TAG", "after sleep listner");
            bleConnection.setHeartRateChangeListener(mHeartRateChangListener);
            Log.d("THIS_IS_MY_TAG", "after heart rate listner");
            bleConnection.setBloodOxygenChangeListener(mBloodOxygenChangeListener);
            Log.d("THIS_IS_MY_TAG", "after o2 listner");
            bleConnection.setTempChangeListener(mTempChangeListener);
            Log.d("THIS_IS_MY_TAG", "after temp listner");
            bleConnection.setTrainingListener(mTrainingListener);
            Log.d("THIS_IS_MY_TAG", "after training listner");
            bleConnection.setBloodPressureChangeListener(mBloodPressureChangeListener);
            Log.d("THIS_IS_MY_TAG", "after bp listner");


            promise.resolve("In connect");
        } catch (Exception e) {
            Log.d("THIS_IS_MY_TAG", "error", e);
            promise.reject("ERROR", e.getMessage() + " in catch block");
        }
    }

    private void testSet() {
        bleConnection.syncStep();
        Log.d("THIS_IS_MY_TAG", "after sync step");
        bleConnection.syncSleep();
        Log.d("THIS_IS_MY_TAG", "after sync sleep");
        bleConnection.queryTodayHeartRate(CRPHeartRateType.ALL_DAY_HEART_RATE);
        Log.d("THIS_IS_MY_TAG", "after today heart");
        bleConnection.startMeasureBloodOxygen();
        Log.d("THIS_IS_MY_TAG", "after o2");
        bleConnection.enableContinueTemp();
        Log.d("THIS_IS_MY_TAG", "after temp");
        bleConnection.queryHistoryTraining();
        Log.d("THIS_IS_MY_TAG", "after tarining");

    }

    private void closeGatt() {
        Log.d("THIS_IS_MY_TAG", "in closegatt");
        if (bleConnection != null) {
            bleConnection.close();
        }
    }


    CRPBleFirmwareUpgradeListener mFirmwareUpgradeListener = new CRPBleFirmwareUpgradeListener() {
        @Override
        public void onFirmwareDownloadStarting() {
            Log.d("THIS_IS_MY_TAG", "onFirmwareDownloadStarting");

        }

        @Override
        public void onFirmwareDownloadComplete() {
            Log.d("THIS_IS_MY_TAG", "onFirmwareDownloadComplete");

        }

        @Override
        public void onUpgradeProgressStarting(boolean recoverable) {
            Log.d("THIS_IS_MY_TAG", "onUpgradeProgressStarting: " + recoverable);

        }

        @Override
        public void onUpgradeProgressChanged(int percent, float speed) {
            Log.d("THIS_IS_MY_TAG", "onUpgradeProgressChanged: " + percent);

        }

        @Override
        public void onUpgradeCompleted() {
            Log.d("THIS_IS_MY_TAG", "onUpgradeCompleted");

        }

        @Override
        public void onUpgradeAborted() {
            Log.d("THIS_IS_MY_TAG", "onUpgradeAborted");

        }

        @Override
        public void onError(int errorType, String message) {
            Log.d("THIS_IS_MY_TAG", "onError: " + errorType);

        }
    };



    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    CRPStepChangeListener mStepChangeListener = new CRPStepChangeListener() {

        @Override
        public void onStepChange(CRPStepInfo info) {
            try {
                Log.d("THIS_IS_MY_TAG", "onStepChange");
                WritableMap params = Arguments.createMap();
                Log.d("THIS_IS_MY_TAG", "onStepChange" + String.valueOf(info.getSteps()));
                params.putString("steps", String.valueOf(info.getSteps()));
                sendEvent(getReactApplicationContext(), "onStepChange", params);
            } catch (Exception e) {
                Log.d("THIS_IS_MY_TAG", "error_step_change_listener", e);

            }
        }


        @Override
        public void onHistoryStepChange(CRPHistoryDay historyDay, CRPStepInfo info) {
            try {} catch (Exception e) {
                Log.d("THIS_IS_MY_TAG", "error_onHistoryStepChange", e);

            }
        };


    };

    CRPSleepChangeListener mSleepChangeListener = new CRPSleepChangeListener() {
        @Override
        public void onSleepChange(CRPSleepInfo info) {
            WritableMap params = Arguments.createMap();
            // params.putString("sleep", String.valueOf(info.getDetails()));
            params.putString("sleep", String.valueOf(info.getTotalTime()));
            sendEvent(getReactApplicationContext(), "onSleepChange", params);
        }

        @Override
        public void onHistorySleepChange(CRPHistoryDay historyDay, CRPSleepInfo info) {}
    };

    CRPHeartRateChangeListener mHeartRateChangListener = new CRPHeartRateChangeListener() {
        @Override
        public void onMeasuring(int rate) {}

        @Override
        public void onOnceMeasureComplete(int rate) {
            WritableMap params = Arguments.createMap();
            params.putString("heart_rate", String.valueOf(rate));
            sendEvent(getReactApplicationContext(), "onOnceMeasureComplete", params);
        }

        @Override
        public void onHistoryHeartRate(List < CRPHistoryHeartRateInfo > list) {}

        @Override
        public void onMeasureComplete(CRPHistoryDynamicRateType type, CRPHeartRateInfo info) {
            WritableMap params = Arguments.createMap();
            params.putString("heart_rate", String.valueOf(type.getValue()));
            sendEvent(getReactApplicationContext(), "onMeasureComplete", params);
        }

        @Override
        public void on24HourMeasureResult(CRPHeartRateInfo info) {}

        public void onMovementMeasureResult(List < CRPMovementHeartRateInfo > list) {
            //     WritableArray array = Arguments.createArray();

            //     for (CRPMovementHeartRateInfo info : list) {
            //         WritableMap map = Arguments.createMap();
            //         map.putString("sport_type", String.valueOf(info.getType()));
            //         map.putString("sport_step",  String.valueOf(info.getSteps()));
            //         array.pushMap(map);
            //     }

            //     WritableMap params = Arguments.createMap();
            //     params.putArray("heart_rate_list_sport_mode", array);
            //     sendEvent(getReactApplicationContext(), "onMovementMeasureResult", params);
        }

    };

    CRPBloodOxygenChangeListener mBloodOxygenChangeListener = new CRPBloodOxygenChangeListener() {
        @Override
        public void onContinueState(boolean state) {}

        @Override
        public void onTimingMeasure(int interval) {}

        @Override
        public void onBloodOxygen(int bloodOxygen) {
            WritableMap params = Arguments.createMap();
            params.putString("blood_oxygen", String.valueOf(bloodOxygen));
            sendEvent(getReactApplicationContext(), "onBloodOxygen", params);
        }

        @Override
        public void onHistoryBloodOxygen(List < CRPHistoryBloodOxygenInfo > list) {}

        @Override
        public void onContinueBloodOxygen(CRPBloodOxygenInfo info) {

        }
    };

    CRPTempChangeListener mTempChangeListener = new CRPTempChangeListener() {
        @Override
        public void onContinueState(boolean state) {}

        @Override
        public void onMeasureTemp(float temp) {
            WritableMap params = Arguments.createMap();
            params.putString("temp", String.valueOf(temp));
            sendEvent(getReactApplicationContext(), "onMeasureTemp", params);
        }

        @Override
        public void onMeasureState(boolean state) {}

        @Override
        public void onContinueTemp(CRPTempInfo info) {}
    };

    // CRPTrainingChangeListener mTrainingListener = new CRPTrainingChangeListener() {
    //     @Override
    //     public void onHistoryTrainingChange(List<CRPHistoryTrainingInfo> list) {
    //         try{
    //         Log.d("THIS_IS_MY_TAG", "onHistoryTrainingChange");
    //         WritableArray array = Arguments.createArray();

    //         for (CRPHistoryTrainingInfo info : list) {
    //             WritableMap map = Arguments.createMap();
    //             map.putString("sport_type", String.valueOf(info.getStartTime()));
    //             array.pushMap(map);
    //         }

    //         WritableMap params = Arguments.createMap();
    //         params.putArray("list_sport_mode", array);
    //         sendEvent(getReactApplicationContext(), "onHistoryTrainingChange", params);
    //         } catch (Exception e) {
    //         Log.d("THIS_IS_MY_TAG", "catch 1", e);
    //         }
    //     }
    //     @Override
    //     public void onTrainingChange(CRPTrainingInfo info) {
    //         try{
    //         Log.d("THIS_IS_MY_TAG", "onTrainingChange");
    //         WritableMap params = Arguments.createMap();
    //         params.putString("list_sport_mode_training", String.valueOf(info.getHrList()));
    //         sendEvent(getReactApplicationContext(), "onTrainingChange", params);
    //         } catch (Exception e) {
    //         Log.d("THIS_IS_MY_TAG", "catch 2", e);
    //         }
    //     }
    // };

    CRPTrainingChangeListener mTrainingListener = new CRPTrainingChangeListener() {
        @Override
        public void onHistoryTrainingChange(List < CRPHistoryTrainingInfo > list) {
            for (CRPHistoryTrainingInfo info: list) {
                Log.d("THIS_IS_MY_TAG", "onHistoryTrainingChange");
            }
        }
        @Override
        public void onTrainingChange(CRPTrainingInfo info) {
            Log.d("THIS_IS_MY_TAG", "onTrainingChange");
        }
    };

    CRPBloodPressureChangeListener mBloodPressureChangeListener = new CRPBloodPressureChangeListener() {


        @Override
        public void onContinueState(boolean state) {

        }

        @Override
        public void onBloodPressureChange(int sbp, int dbp) {
            WritableMap params = Arguments.createMap();
            params.putString("sbp", String.valueOf(sbp));
            params.putString("dbp", String.valueOf(dbp));
            sendEvent(getReactApplicationContext(), "onBloodPressureChange", params);
        }

        @Override
        public void onHistoryBloodPressure(List < CRPHistoryBloodPressureInfo > list) {

        }

        @Override
        public void onContinueBloodPressure(CRPBloodPressureInfo info) {

        }
    };
}