package io.scrollback.neighborhoods.modules.places;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.places.AutocompleteFilter;
import com.google.android.gms.location.places.AutocompletePrediction;
import com.google.android.gms.location.places.AutocompletePredictionBuffer;
import com.google.android.gms.location.places.Place;
import com.google.android.gms.location.places.Places;
import com.google.android.gms.location.places.ui.PlaceAutocomplete;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


public class GooglePlacesModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

    private static final String ACTIVITY_DOES_NOT_EXIST_ERROR = "Activity doesn't exist";
    private static final String GOOGLE_API_NOT_INITIALIZED_ERROR = "Google API client not initialized";
    private static final String PICKER_CANCELLED_ERROR = "Places picker was cancelled";

    private static final int PLACE_AUTOCOMPLETE_REQUEST_CODE = 1090;

    private Promise mRetrievePromise;
    private GoogleApiClient mGoogleApiClient;

    public GooglePlacesModule(ReactApplicationContext reactContext) {
        super(reactContext);

        reactContext.addActivityEventListener(this);
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "GooglePlacesModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        // https://developers.google.com/places/android-api/autocomplete#get_place_predictions_programmatically
        constants.put("TYPE_FILTER_ADDRESS", AutocompleteFilter.TYPE_FILTER_ADDRESS);
        constants.put("TYPE_FILTER_CITIES", AutocompleteFilter.TYPE_FILTER_CITIES);
        constants.put("TYPE_FILTER_ESTABLISHMENT", AutocompleteFilter.TYPE_FILTER_ESTABLISHMENT);
        constants.put("TYPE_FILTER_GEOCODE", AutocompleteFilter.TYPE_FILTER_GEOCODE);
        constants.put("TYPE_FILTER_NONE", AutocompleteFilter.TYPE_FILTER_NONE);
        constants.put("TYPE_FILTER_REGIONS", AutocompleteFilter.TYPE_FILTER_REGIONS);

        return constants;
    }

    private void resolvePromise(WritableMap map) {
        if (mRetrievePromise != null) {
            mRetrievePromise.resolve(map);
            mRetrievePromise = null;
        }
    }

    private void rejectPromise(Exception reason) {
        if (mRetrievePromise != null) {
            mRetrievePromise.reject(reason);
            mRetrievePromise = null;
        }
    }

    private void rejectPromise(String reason) {
        if (mRetrievePromise != null) {
            mRetrievePromise.reject(reason);
            mRetrievePromise = null;
        }
    }

    @ReactMethod
    public void findPlace(final Promise promise) {
        if (mGoogleApiClient == null) {
            promise.reject(GOOGLE_API_NOT_INITIALIZED_ERROR);
            return;
        }

        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject(ACTIVITY_DOES_NOT_EXIST_ERROR);
            return;
        }

        mRetrievePromise = promise;

        try {
            Intent intent =
                    new PlaceAutocomplete.IntentBuilder(PlaceAutocomplete.MODE_OVERLAY)
                            .build(currentActivity);

            currentActivity.startActivityForResult(intent, PLACE_AUTOCOMPLETE_REQUEST_CODE);
        } catch (GooglePlayServicesRepairableException | GooglePlayServicesNotAvailableException e) {
            rejectPromise(e);
        }
    }

    @ReactMethod
    public void getAutoCompletePredictions(
            final String query, final ReadableArray bounds, @Nullable final ReadableArray filter,
            final Promise promise
    ) {
        LatLngBounds.Builder boundsBuilder = new LatLngBounds.Builder();

        for (int i = 0, l = bounds.size(); i < l; i++) {
            ReadableMap map = bounds.getMap(i);

            boundsBuilder.include(new LatLng(map.getDouble("latitude"), map.getDouble("longitude")));
        }

        LatLngBounds latLngBounds = boundsBuilder.build();

        AutocompleteFilter autoCompleteFilter = null;

        if (filter != null) {
            AutocompleteFilter.Builder filterBuilder = new AutocompleteFilter.Builder();

            for (int i = 0, l = filter.size(); i < l; i++) {
                filterBuilder.setTypeFilter(filter.getInt(i));
            }

            autoCompleteFilter = filterBuilder.build();
        }

        PendingResult<AutocompletePredictionBuffer> result =
                Places.GeoDataApi.getAutocompletePredictions(mGoogleApiClient, query, latLngBounds, autoCompleteFilter);

        result.setResultCallback(new ResultCallback<AutocompletePredictionBuffer>() {
            @Override
            public void onResult(@NonNull AutocompletePredictionBuffer autocompletePredictions) {
                WritableArray predictions = Arguments.createArray();

                for (AutocompletePrediction prediction : autocompletePredictions) {
                    WritableMap details = Arguments.createMap();

                    details.putString("full_text", prediction.getFullText(null).toString());
                    details.putString("primary_text", prediction.getPrimaryText(null).toString());
                    details.putString("secondary_text", prediction.getSecondaryText(null).toString());
                    details.putString("place_id", prediction.getPlaceId());

                    List<Integer> placeTypes = prediction.getPlaceTypes();

                    details.putArray("place_types",
                            placeTypes != null ? Arguments.fromArray(prediction.getPlaceTypes()) : Arguments.createArray());

                    predictions.pushMap(details);
                }

                promise.resolve(predictions);
                autocompletePredictions.release();
            }
        });
    }

    private WritableMap buildPlacesMap(Place place) {
        CharSequence address = place.getAddress();
        CharSequence attributions = place.getAttributions();
        CharSequence name = place.getName();
        CharSequence phoneNumber = place.getPhoneNumber();
        Locale locale = place.getLocale();
        Uri websiteUri = place.getWebsiteUri();

        WritableMap map = Arguments.createMap();

        if (address != null) {
            map.putString("address", address.toString());
        }

        if (attributions != null) {
            map.putString("attributions", attributions.toString());
        }

        if (name != null) {
            map.putString("name", name.toString());
        }

        if (phoneNumber != null) {
            map.putString("phoneNumber", phoneNumber.toString());
        }

        if (locale != null) {
            map.putString("locale", locale.toString());
        }

        if (websiteUri != null) {
            map.putString("websiteUrl", websiteUri.toString());
        }

        map.putString("id", place.getId());
        map.putInt("priceLevel", place.getPriceLevel());
        map.putDouble("rating", place.getRating());

        WritableMap latLngMap = Arguments.createMap();
        LatLng latLng = place.getLatLng();

        latLngMap.putDouble("latitude", latLng.latitude);
        latLngMap.putDouble("longitude", latLng.longitude);

        map.putMap("latLng", latLngMap);
        map.putArray("placeTypes", Arguments.fromArray(place.getPlaceTypes()));

        return map;
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        if (requestCode == PLACE_AUTOCOMPLETE_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_CANCELED) {
                rejectPromise(PICKER_CANCELLED_ERROR);
            } else if (resultCode == PlaceAutocomplete.RESULT_ERROR) {
                Activity currentActivity = getCurrentActivity();

                if (currentActivity != null) {
                    Status status = PlaceAutocomplete.getStatus(currentActivity, data);
                    rejectPromise(status.getStatusMessage());
                } else {
                    rejectPromise(ACTIVITY_DOES_NOT_EXIST_ERROR);
                }
            } else if (resultCode == Activity.RESULT_OK) {
                Activity currentActivity = getCurrentActivity();

                if (currentActivity != null) {
                    resolvePromise(buildPlacesMap(PlaceAutocomplete.getPlace(currentActivity, data)));
                } else {
                    rejectPromise(ACTIVITY_DOES_NOT_EXIST_ERROR);
                }

            }
        }
    }

    private void initializeGoogleApi() {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity != null) {
            mGoogleApiClient = new GoogleApiClient
                    .Builder(currentActivity)
                    .addApi(Places.GEO_DATA_API)
                    .addApi(Places.PLACE_DETECTION_API)
                    .build();
        }
    }

    @Override
    public void onHostResume() {
        if (mGoogleApiClient == null) {
            initializeGoogleApi();
        }

        mGoogleApiClient.connect();
    }

    @Override
    public void onHostPause() {
        mGoogleApiClient.disconnect();
    }

    @Override
    public void onHostDestroy() {
    }
}
