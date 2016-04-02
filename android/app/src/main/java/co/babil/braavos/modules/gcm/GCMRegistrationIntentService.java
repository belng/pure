package co.babil.braavos.modules.gcm;

import android.app.IntentService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

import co.babil.braavos.R;

public class GCMRegistrationIntentService extends IntentService {
    private static final String TAG = "IntentService";

    public GCMRegistrationIntentService() {
        super(GCMRegistrationIntentService.class.getName());
        Log.d(TAG, "gcm service started");

    }

    @Override
    protected void onHandleIntent(Intent intent) {
        SharedPreferences sharedPreferences = GCMPreferences.get(this);
        Log.d(TAG, "gcm service");

        try {
            InstanceID instanceID = InstanceID.getInstance(this);
            String token = instanceID.getToken(getString(R.string.gcm_defaultSenderId),
                    GoogleCloudMessaging.INSTANCE_ID_SCOPE, null);

            Log.i(TAG, "GCM Registration Token: " + token);
            GCMMessageHelpers.sendUpstreamMessageWithToken(getApplicationContext(), token);

            sharedPreferences.edit().putString(GCMPreferences.TOKEN, token).apply();
        } catch (Exception e) {
            Log.d(TAG, "Failed to complete token refresh", e);
        }

        Intent registrationComplete = new Intent(GCMPreferences.SAVED_TO_SERVER);
        LocalBroadcastManager.getInstance(this).sendBroadcast(registrationComplete);
    }

//    private void subscribeTopics(String token) throws IOException {
//        GcmPubSub pubSub = GcmPubSub.getInstance(this);
//
//        for (String topic : TOPICS) {
//            pubSub.subscribe(token, "/topics/" + topic, null);
//        }
//    }
}
