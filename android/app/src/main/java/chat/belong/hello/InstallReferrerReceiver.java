package chat.belong.hello;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import chat.belong.hello.modules.analytics.InstallTracker;

public class InstallReferrerReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && intent.getAction().equals("com.android.vending.INSTALL_REFERRER")) {
            final String referrer = intent.getStringExtra("referrer");

            if (referrer != null && referrer.length() != 0) {
                InstallTracker.getInstance(context).setReferrer(referrer);
            }
        }
    }
}
