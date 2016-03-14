package io.scrollback.neighborhoods.modules.gcm;

import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.gcm.GcmListenerService;

import org.json.JSONException;

public class GCMListenerService extends GcmListenerService {

    private static final String TAG = "GCMListenerService";
    private static final int NOTIFICATION_ID = 0;

    @Override
    public void onMessageReceived(String from, Bundle data) {

        Log.d(TAG, "Got notification: " + data);

        GCMNotificationHandler.send(this, NOTIFICATION_ID, data);
    }
}
