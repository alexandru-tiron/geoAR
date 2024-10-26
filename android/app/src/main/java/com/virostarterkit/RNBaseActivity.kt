package com.geoar

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import org.json.JSONObject
import android.util.Log
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RNBaseActivity : ReactActivity() {
    private var targetLocations: String? = null
    private var latitude: Double? = null
    private var longitude: Double? = null

    private val coroutineScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private val intentProcessed = CompletableDeferred<Unit>()
    private var isReactNativeInitialized = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        coroutineScope.launch {
            handleIncomingIntent()
            intentProcessed.complete(Unit)
            initializeReactNative()
        }
    }

    private suspend fun handleIncomingIntent() = withContext(Dispatchers.IO) {
        val intent = intent
        if (intent != null && intent.action == "com.example.ACTION_OPEN") {
             targetLocations = intent.getStringExtra("SHOPS")
            latitude = intent.getDoubleExtra("LOCATION_LAT", Double.NaN)
            longitude = intent.getDoubleExtra("LOCATION_LNG", Double.NaN)

            if (latitude != null && longitude != null && (latitude!!.isNaN() || longitude!!.isNaN())) {
                Log.d("TargetMainActivity", "Invalid latitude or longitude received")
                latitude = null
                longitude = null
            }

            if (targetLocations != null && latitude != null && longitude != null) {
                Log.d("TargetMainActivity", "Received SHOPS: $targetLocations")
                Log.d("TargetMainActivity", "Received LOCATION_LAT: $latitude")
                Log.d("TargetMainActivity", "Received LOCATION_LNG: $longitude")
            } else {
                Log.d("Initial Props", "Missing or invalid data received")
            }
        }
    }
    private fun initializeReactNative() {
        if (isReactNativeInitialized) {
            Log.d("ReactNativeInitialization", "React Native already initialized, skipping.")
            return
        }

        if (targetLocations == null || latitude == null || longitude == null) {
            Log.d("ReactNativeInitialization", "Skipping initialization due to missing data.")
            return
        }

        isReactNativeInitialized = true

        runOnUiThread {
            val initialLocation = JSONObject()
            initialLocation.put("latitude", latitude)
            initialLocation.put("longitude", longitude)

            val bundle = Bundle().apply {
                putString("targetLocations", targetLocations)
                putString("initialLocation", initialLocation.toString())
            }

            val reactRootView = ReactRootView(this)
            val reactInstanceManager = reactNativeHost.reactInstanceManager
            reactRootView.startReactApplication(
                reactInstanceManager,
                mainComponentName,
                bundle
            )
            setContentView(reactRootView)
        }
    }
    override fun getMainComponentName(): String = "geoar"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return object : ReactActivityDelegate(this, mainComponentName) {
            override fun getLaunchOptions(): Bundle? {
                Log.d("ReactNativeInitialization", " initialization.")
                return null
            }
        }
    }
    override fun onPause() {
        super.onPause()
        reactInstanceManager?.onHostPause(this)
    }

    override fun onResume() {
        super.onResume()
        reactInstanceManager?.onHostResume(this, this)
    }

    override fun onDestroy() {
        super.onDestroy()
        coroutineScope.cancel()
        reactInstanceManager?.onHostDestroy(this)
    }

    override fun onBackPressed() {
        reactInstanceManager?.onBackPressed()
    }

    override fun invokeDefaultOnBackPressed() {
        super.onBackPressed()
    }
}

