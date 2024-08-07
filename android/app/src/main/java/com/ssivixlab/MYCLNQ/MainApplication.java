package com.ssivixlab.MYCLNQ;

import android.content.Context;

import androidx.multidex.MultiDex;
import androidx.multidex.MultiDexApplication;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.reactnativerestart.RestartPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.reactnativecommunity.cameraroll.CameraRollPackage;
import com.reactnativecommunity.cameraroll.CameraRollPackage;
import com.reactlibrary.SajjadLaunchApplicationPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.scottyab.rootbeer.RootBeer;

import java.util.List;

import cl.json.ShareApplication;

public class MainApplication extends MultiDexApplication implements ReactApplication, ShareApplication {

    @Override
    public String getFileProviderAuthority() {
        return "com.ssivixlab.MYCLNQ.provider";
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }
        @Override
        protected List<ReactPackage> getPackages() {
            @SuppressWarnings("UnnecessaryLocalVariable")
            List<ReactPackage> packages = new PackageList(this).getPackages();
            new ReactNativePushNotificationPackage();
            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        isRooted();
        SoLoader.init(this, false);
        SoLoader.loadLibrary("zoom");
    }

    private boolean isRooted() {
        RootBeer rootBeer = new RootBeer(this);
        return  rootBeer.isRooted();
    }
}
