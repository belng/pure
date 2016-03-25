package chat.heyneighbor.app;

import android.app.Application;

import com.crashlytics.android.Crashlytics;

import io.fabric.sdk.android.Fabric;
import chat.heyneighbor.app.modules.analytics.LifeCycleTracker;

public class HeyNeighbor extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        Fabric.with(this, new Crashlytics());

        AppState.init(this);
        LifeCycleTracker.init(this);
    }
}
