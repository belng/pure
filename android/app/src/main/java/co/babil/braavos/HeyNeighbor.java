package co.babil.braavos;

import android.app.Application;

import com.crashlytics.android.Crashlytics;

import io.fabric.sdk.android.Fabric;
import co.babil.braavos.modules.analytics.LifeCycleTracker;

public class HeyNeighbor extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        Fabric.with(this, new Crashlytics());

        AppState.init(this);
        LifeCycleTracker.init(this);
    }
}
