package chat.heyneighbor.app.modules.gcm;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;

import chat.heyneighbor.app.R;

public class GCMMessageHelpers {

    private static final String TAG = "GCMMessageHelpers";

    public static void setSavedToServer(Context context, boolean result) {
        SharedPreferences.Editor e = GCMPreferences.get(context).edit();
        Log.d("Helper", "setSavedToServer");
        e.putString(GCMPreferences.SAVED_TO_SERVER, result ?  "true" : "false");
        e.apply();
    }

    public static boolean isSavedToServer(Context context) {
        return GCMPreferences.get(context).getString(GCMPreferences.SAVED_TO_SERVER, "").equals("true");
    }

    public static void sendUpstreamMessage(final Context context, final String session, final String token) {
        final GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(context);
        final String senderId = context.getString(R.string.gcm_defaultSenderId);
        final Bundle data = new Bundle();
        setSavedToServer(context, false);

        if (session.isEmpty() || token.isEmpty()) {
            return;
        }

        (new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... voids) {
                try {
                    String uuid = Settings.Secure.getString(context.getContentResolver(),
                            Settings.Secure.ANDROID_ID);

                    Log.d("Helper", "Sending upstream message");
                    data.putString("uuid", uuid);
                    data.putString("sessionId", session);
                    data.putString("token", token);
                    gcm.send(senderId + "@gcm.googleapis.com", "gsa8tdsagd-gsds65", data);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to send registration message to GCM for token: " + token);
                }

                return null;
            }
        }).execute();
    }

    public static void sendUpstreamMessageWithToken(Context context, final String token) {
        final SharedPreferences preferences = GCMPreferences.get(context);
        final String session = preferences.getString(GCMPreferences.SESSION, "");
        sendUpstreamMessage(context, session, token);
    }

    public static void sendUpstreamMessageWithSession(Context context, final String session) {
        final SharedPreferences preferences = GCMPreferences.get(context);
        final String token = preferences.getString(GCMPreferences.TOKEN, "");
        sendUpstreamMessage(context, session, token);
    }
}
