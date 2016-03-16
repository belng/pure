package io.scrollback.neighborhoods.modules.contacts;

import android.database.Cursor;
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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class ContactsModule extends ReactContextBaseJavaModule {

    private static final String ERR_READING_CONTACTS = "Failed to read contacts";

    public ContactsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ContactsModule";
    }

    private @Nullable WritableMap getEmailDetails(final String id) {
        Cursor cursor = getReactApplicationContext().getContentResolver().query(
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

    private @Nullable WritableMap getAddressDetails(final String id) {
        Cursor cursor = getReactApplicationContext().getContentResolver().query(
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

    private @Nullable WritableMap getContactDetails(final String id) {
        String number = null;
        String name = null;
        String photo = null;
        String thumbnail = null;

        WritableMap email = getEmailDetails(id);

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

        Cursor cursor = getReactApplicationContext().getContentResolver().query(
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

        WritableMap address = getAddressDetails(id);

        if (address != null) {
            details.putMap("address", address);
        }

        details.putString("id", id);

        return details;
    }

    @ReactMethod
    public void getContacts(final Promise promise) {
        WritableArray contactsList = Arguments.createArray();
        Cursor cursor = getReactApplicationContext().getContentResolver().query(
                Contacts.CONTENT_URI, null, null, null, null
        );

        if (cursor == null) {
            promise.reject(ERR_READING_CONTACTS);
            return;
        }

        try {
            while (cursor.moveToNext()) {
                String id = cursor.getString(cursor.getColumnIndex(Contacts._ID));
                WritableMap details = getContactDetails(id);

                if (details != null) {
                    contactsList.pushMap(details);
                }
            }
        } catch (Exception e) {
            promise.reject(e);
        } finally {
            cursor.close();
        }

        promise.resolve(contactsList);
    }
}
