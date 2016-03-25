package chat.heyneighbor.app.modules.contacts;

import android.content.ContentProviderClient;
import android.content.ContentResolver;
import android.database.Cursor;
import android.os.AsyncTask;
import android.os.RemoteException;
import android.provider.ContactsContract.CommonDataKinds.Email;
import android.provider.ContactsContract.CommonDataKinds.Phone;
import android.provider.ContactsContract.CommonDataKinds.StructuredPostal;
import android.provider.ContactsContract.Contacts;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

public class ContactsModule extends ReactContextBaseJavaModule {

    private static final String ERR_READING_CONTACTS = "Failed to read contacts";

    public ContactsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ContactsModule";
    }

    @Nullable
    private WritableMap getEmailDetails(final ContentProviderClient client, final String id) throws RemoteException {
        Cursor cursor = client.query(
                Email.CONTENT_URI, null,
                Email.CONTACT_ID + " = ?", new String[] { id }, null
        );

        if (cursor != null) {
            try {
                if (cursor.moveToNext()) {
                    String address = cursor.getString(cursor.getColumnIndex(Email.ADDRESS));
                    String name = cursor.getString(cursor.getColumnIndex(Email.DISPLAY_NAME));
                    String photo = cursor.getString(cursor.getColumnIndex(Email.PHOTO_URI));
                    String thumbnail = cursor.getString(cursor.getColumnIndex(Email.PHOTO_THUMBNAIL_URI));

                    if (address == null && name == null && photo == null && thumbnail == null) {
                        return null;
                    }

                    WritableMap details = Arguments.createMap();

                    if (address != null) {
                        details.putString("address", address);
                    }

                    if (name != null) {
                        details.putString("name", name);
                    }

                    if (photo != null) {
                        details.putString("photo", photo);
                    }

                    if (thumbnail != null) {
                        details.putString("thumbnail", thumbnail);
                    }

                    return details;
                }
            } catch (Exception e) {
                return null;
            } finally {
                cursor.close();
            }
        }

        return null;
    }

    @Nullable
    private WritableMap getAddressDetails(final ContentProviderClient client, final String id) throws RemoteException {
        Cursor cursor = client.query(
                StructuredPostal.CONTENT_URI, null,
                StructuredPostal.CONTACT_ID + " = ?", new String[] { id }, null
        );

        if (cursor != null) {
            try {
                if (cursor.moveToNext()) {
                    String street = cursor.getString(cursor.getColumnIndex(StructuredPostal.STREET));
                    String city = cursor.getString(cursor.getColumnIndex(StructuredPostal.CITY));
                    String country = cursor.getString(cursor.getColumnIndex(StructuredPostal.COUNTRY));
                    String region = cursor.getString(cursor.getColumnIndex(StructuredPostal.REGION));
                    String neighborhood = cursor.getString(cursor.getColumnIndex(StructuredPostal.NEIGHBORHOOD));
                    String postcode = cursor.getString(cursor.getColumnIndex(StructuredPostal.POSTCODE));
                    String pobox = cursor.getString(cursor.getColumnIndex(StructuredPostal.POBOX));

                    if (street == null && city == null && country == null && region == null && neighborhood == null && postcode == null && pobox == null) {
                        return null;
                    }

                    WritableMap details = Arguments.createMap();

                    if (street != null) {
                        details.putString("street", street);
                    }

                    if (city != null) {
                        details.putString("city", city);
                    }

                    if (country != null) {
                        details.putString("country", country);
                    }

                    if (region != null) {
                        details.putString("region", region);
                    }

                    if (neighborhood != null) {
                        details.putString("neighborhood", neighborhood);
                    }

                    if (postcode != null) {
                        details.putString("postcode", postcode);
                    }

                    if (pobox != null) {
                        details.putString("pobox", pobox);
                    }

                    return details;
                }
            } catch (Exception e) {
                return null;
            } finally {
                cursor.close();
            }
        }

        return null;
    }

    @Nullable
    private WritableMap getContactDetails(final ContentProviderClient client, final String id) throws RemoteException {
        String number = null;
        String name = null;
        String photo = null;
        String thumbnail = null;

        WritableMap email = getEmailDetails(client, id);

        if (email != null) {
            if (email.hasKey("name")) {
                name = email.getString("name");
            }

            if (email.hasKey("photo")) {
                photo = email.getString("photo");
            }

            if (email.hasKey("thumbnail")) {
                thumbnail = email.getString("thumbnail");
            }
        }

        Cursor cursor = client.query(
                Phone.CONTENT_URI, null,
                Phone.CONTACT_ID + " = ?", new String[] { id }, null
        );

        if (cursor != null) {
            try {
                if (cursor.moveToNext()) {
                    number = cursor.getString(cursor.getColumnIndex(Phone.NORMALIZED_NUMBER));

                    if (name == null) {
                        name = cursor.getString(cursor.getColumnIndex(Phone.DISPLAY_NAME));
                    }

                    if (photo == null) {
                        photo = cursor.getString(cursor.getColumnIndex(Phone.PHOTO_URI));
                    }

                    if (thumbnail == null) {
                        thumbnail = cursor.getString(cursor.getColumnIndex(Phone.PHOTO_THUMBNAIL_URI));
                    }
                }
            } catch (Exception e) {
                return null;
            } finally {
                cursor.close();
            }
        }

        if (email == null && number == null && name == null && photo == null && thumbnail == null) {
            return null;
        }

        WritableMap details = Arguments.createMap();

        if (email != null && email.hasKey("address")) {
            details.putString("email", email.getString("address"));
        }

        if (number != null) {
            details.putString("number", number);
        }

        if (name != null) {
            details.putString("name", name);
        }

        if (photo != null) {
            details.putString("photo", photo);
        }

        if (thumbnail != null) {
            details.putString("thumbnail", thumbnail);
        }

        WritableMap address = getAddressDetails(client, id);

        if (address != null) {
            details.putMap("address", address);
        }

        details.putString("id", id);

        return details;
    }

    @Nullable
    public WritableArray getContactsList() throws Exception {
        WritableArray contactsList = Arguments.createArray();
        ContentResolver resolver = getReactApplicationContext().getContentResolver();
        ContentProviderClient client = resolver.acquireContentProviderClient(Contacts.CONTENT_URI);

        if (client == null) {
            throw new Exception(ERR_READING_CONTACTS);
        }

        try {
            Cursor cursor = client.query(
                    Contacts.CONTENT_URI, null, null, null, null
            );

            if (cursor == null) {
                throw new Exception(ERR_READING_CONTACTS);
            }

            try {
                while (cursor.moveToNext()) {
                    String id = cursor.getString(cursor.getColumnIndex(Contacts._ID));
                    WritableMap details = getContactDetails(client, id);

                    if (details != null) {
                        contactsList.pushMap(details);
                    }
                }
            } finally {
                cursor.close();
            }
        } finally {
            client.release();
        }

        return contactsList;
    }

    @ReactMethod
    public void getContacts(final Promise promise) {
        (new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... voids) {
                try {
                    promise.resolve(getContactsList());
                } catch (Exception e) {
                    promise.reject(e);
                }

                return null;
            }
        }).execute();
    }

    @ReactMethod
    public void sendContacts(final String endpoint, @Nullable final ReadableMap metadata, final Promise promise) {
        final JSONObject data = new JSONObject();

        if (metadata != null) {
            final ReadableMapKeySetIterator iterator = metadata.keySetIterator();

            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();

                try {
                    switch (metadata.getType(key)) {
                        case Null:
                            data.put(key, null);
                            break;
                        case String:
                            data.put(key, metadata.getString(key));
                            break;
                        case Number:
                            data.put(key, metadata.getDouble(key));
                            break;
                        case Boolean:
                            data.put(key, metadata.getBoolean(key));
                            break;
                        case Map:
                            data.put(key, JSONHelpers.ReadableMapToJSON(metadata.getMap(key)));
                            break;
                        case Array:
                            data.put(key, JSONHelpers.ReadableArrayToJSON(metadata.getArray(key)));
                            break;
                        default:
                            throw new IllegalArgumentException("Unsupported data type passed");

                    }
                } catch (JSONException | IllegalArgumentException e) {
                    promise.reject(e);
                    return;
                }
            }
        }

        (new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... voids) {
                try {
                    data.put("data", JSONHelpers.ReadableArrayToJSON(getContactsList()));

                    HttpURLConnection connection;

                    connection = (HttpURLConnection) ((new URL(endpoint).openConnection()));

                    connection.setDoOutput(true);
                    connection.setRequestProperty("Content-Type", "application/json");
                    connection.setRequestProperty("Accept", "application/json");
                    connection.setRequestMethod("POST");

                    connection.connect();

                    OutputStream os = connection.getOutputStream();

                    try {
                        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"));

                        try {
                            writer.write(data.toString());
                        } finally {
                            writer.close();
                        }
                    } finally {
                        os.close();
                    }

                    promise.resolve(true);
                } catch (Exception e) {
                    promise.reject(e);
                }

                return null;
            }
        }).execute();
    }
}
