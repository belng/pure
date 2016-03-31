package co.babil.braavos;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import co.babil.braavos.modules.analytics.AnswersInstallTracker;

public class InstallReferrerReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && intent.getAction().equals("com.android.vending.INSTALL_REFERRER")) {
            final String referrer = intent.getStringExtra("referrer");

            if (referrer != null && referrer.length() != 0) {
                AnswersInstallTracker.getInstance(context).setReferrer(referrer);
            }
        }
    }
}
