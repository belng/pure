package chat.belong.hello;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

import chat.belong.hello.modules.gcm.RegistrationManager;


public class MainActivity extends ReactActivity {

    RegistrationManager mRegistrationManager = new RegistrationManager(this);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (checkPlayServices()) {
            mRegistrationManager.startIntentService();
        }
    }

    @Override
    protected String getMainComponentName() {
        return "Belong";
    }

    @Override
    protected void onPause() {
        mRegistrationManager.unRegisterReciever();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        mRegistrationManager.registerReceiver();
    }


    private boolean checkPlayServices() {
        GoogleApiAvailability apiAvailability = GoogleApiAvailability.getInstance();
        int resultCode = apiAvailability.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (apiAvailability.isUserResolvableError(resultCode)) {
                apiAvailability
                        .getErrorDialog(this, resultCode, 9000)
                        .show();
            } else {
                Log.d(this.getClass().getSimpleName(), "Play Services was not found in this device.");
                finish();
            }
            return false;
        }
        return true;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
}
