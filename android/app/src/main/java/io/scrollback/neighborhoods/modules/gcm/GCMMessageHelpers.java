package io.scrollback.neighborhoods.modules.gcm;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;

import io.scrollback.neighborhoods.R;

public class GCMMessageHelpers {

    public static void sendUpstreamMessage(Context context, final String token) {
        final GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(context);
        final String senderId = context.getString(R.string.gcm_defaultSenderId);
        final Bundle data = new Bundle();
        (new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... voids) {
                try {
                    Log.d("Helper", "Sending upstream message");
                    data.putString("my_message", "Hello World");
                    data.putString("my_action","SAY_HELLO");
                    data.putString("Token", token);
                    gcm.send(senderId + "@gcm.googleapis.com", "gsa8tdsagd-gsds65", data);
                } catch (Exception e) {
                }

                return null;
            }
        }).execute();
    }
}
