package com.geoar

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class IntentModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "IntentModule"
    }

    @ReactMethod
    fun closeActivity() {
        Log.d("IntentModule", "Closing the app")
        val currentActivity = getCurrentActivity()
        if (currentActivity != null) {
            currentActivity.finish()}
    }

    @ReactMethod
    fun checkInShop( shop: ReadableMap) {
        Log.d("IntentModule", "Shop Details: $shop")
        val placeId = shop.getString("place_id")
        val isRegistered = shop.getBoolean("registered")

        val currentActivity = getCurrentActivity()
        if (currentActivity != null) {
            val resultIntent = Intent()
            resultIntent.putExtra("SHOP_PLACE_ID", placeId)
            resultIntent.putExtra("IS_REGISTERED", isRegistered)
            currentActivity.setResult(Activity.RESULT_OK, resultIntent)
            currentActivity.finish()
        }
    }

    fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}