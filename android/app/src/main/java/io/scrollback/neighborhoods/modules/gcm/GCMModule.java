package io.scrollback.neighborhoods.modules.gcm;

import android.content.SharedPreferences;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class GCMModule extends ReactContextBaseJavaModule {

    public GCMModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "GCMModule";
    }

    @ReactMethod
    public void getRegistrationToken(final Promise promise) {
        promise.resolve(GCMPreferences.get(getReactApplicationContext()).getString(GCMPreferences.REGISTRATION_TOKEN, ""));
    }

    @ReactMethod
    public void setPreference(final String key, final String value) {
        SharedPreferences.Editor e = GCMPreferences.get(getReactApplicationContext()).edit();

        e.putString(key, value);
        e.apply();
    }

    @ReactMethod
    public void getPreference(final String key, final Promise promise) {
        promise.resolve(GCMPreferences.get(getReactApplicationContext()).getString(key, ""));
    }
}
