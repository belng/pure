package io.scrollback.neighborhoods.modules.gcm;

import android.content.Intent;
import android.util.Log;

import com.google.android.gms.iid.InstanceIDListenerService;

public class GCMInstanceIDListenerService extends InstanceIDListenerService {

    @Override
    public void onTokenRefresh() {
        Log.d("TokenRefresh", "Token is refreshed");
        Intent intent = new Intent(this, GCMRegistrationIntentService.class);
        startService(intent);
    }
}
