package io.scrollback.neighborhoods.modules.gcm;

import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.gcm.GcmListenerService;

public class GCMListenerService extends GcmListenerService {

    private static final String TAG = "GCMListenerService";
    private static final int NOTIFICATION_ID = 0;

    @Override
    public void onMessageReceived(String from, Bundle data) {
        String message = data.getString("message");

        Log.d(TAG, "From: " + from);
        Log.d(TAG, "Message: " + data);

        GCMNotificationHandler.send(this, NOTIFICATION_ID, AppNotification.fromBundle(this, data));
    }
}
