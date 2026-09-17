package com.sentia.smartliving.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.sentia.smartliving.R

/**
 * SentiaWidgetProvider
 * Native Android AppWidgetProvider delivering the 2x2 Living Companion Aura
 * and 4x4 Vanguard Hardware Command Center.
 */
class SentiaWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val appWidgetInfo = appWidgetManager.getAppWidgetInfo(appWidgetId)
            val isSmall = appWidgetInfo?.minWidth ?: 0 < 200

            val views = if (isSmall) {
                RemoteViews(context.packageName, R.layout.sentia_widget_2x2).apply {
                    // Tap opens app
                    val openAppIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sentia://open")).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    }
                    val pendingIntent = PendingIntent.getActivity(
                        context,
                        0,
                        openAppIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setOnClickPendingIntent(R.id.widget_2x2_root, pendingIntent)
                }
            } else {
                RemoteViews(context.packageName, R.layout.sentia_widget_4x4).apply {
                    // Tap Talk button triggers Hands-Free Voice Chat directly
                    val voiceIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sentia://voice-chat")).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    }
                    val voicePendingIntent = PendingIntent.getActivity(
                        context,
                        1,
                        voiceIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setOnClickPendingIntent(R.id.widget_btn_talk, voicePendingIntent)

                    // Tap root opens Dashboard
                    val openAppIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sentia://open")).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    }
                    val mainPendingIntent = PendingIntent.getActivity(
                        context,
                        2,
                        openAppIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setOnClickPendingIntent(R.id.widget_4x4_root, mainPendingIntent)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        /**
         * Push real-time telemetry updates from React Native to the active Android widgets
         */
        fun updateTelemetry(
            context: Context,
            battery: Int,
            isLocked: Boolean,
            weightKg: Double,
            hydrationProgress: Int,
            moodCode: String
        ) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, SentiaWidgetProvider::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)

            for (widgetId in allWidgetIds) {
                val views = RemoteViews(context.packageName, R.layout.sentia_widget_4x4).apply {
                    setTextViewText(R.id.widget_telemetry_battery, "$battery% Pwr")
                    setTextViewText(R.id.widget_telemetry_lock, if (isLocked) "TSA Locked" else "Unlocked")
                    setTextViewText(R.id.widget_telemetry_weight, "$weightKg kg Load")
                    setProgressBar(R.id.widget_hydration_bar, 100, hydrationProgress, false)
                }
                appWidgetManager.partiallyUpdateAppWidget(widgetId, views)
            }
        }
    }
}
