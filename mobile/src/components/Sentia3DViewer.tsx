import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { RotateCw, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, BorderRadius, Spacing } from '../theme/tokens';
import { Bag3DModelMeta, get3DModelForBag, CDN_BASE_URL } from '../assets/modelMap';

interface Sentia3DViewerProps {
  bagId?: string;
  modelMeta?: Bag3DModelMeta;
  height?: number;
  autoRotate?: boolean;
  showControls?: boolean;
}

export const Sentia3DViewer: React.FC<Sentia3DViewerProps> = ({
  bagId = 'bag-01',
  modelMeta: propMeta,
  height = 280,
  autoRotate = true,
  showControls = true,
}) => {
  const meta = propMeta || get3DModelForBag(bagId);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeAngle, setActiveAngle] = useState<'front' | 'side' | 'back'>('front');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Fallback timer: ensure overlay is dismissed after 5s if event is missed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [meta.id]);

  const handleAngleChange = (angle: 'front' | 'side' | 'back') => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setActiveAngle(angle);
    webViewRef.current?.injectJavaScript(`
      if (window.setCameraAngle) {
        window.setCameraAngle('${angle}');
      }
      true;
    `);
  };

  const handleRetry = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsLoading(true);
    setHasError(false);
    webViewRef.current?.reload();
  };

  const modelSourceUrl = useMemo(() => {
    if (meta.webUrl && meta.webUrl.startsWith('http')) {
      return meta.webUrl;
    }
    return `${CDN_BASE_URL}${meta.webUrl.startsWith('/') ? '' : '/'}${meta.webUrl}`;
  }, [meta.webUrl]);

  const htmlContent = useMemo(() => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: transparent;
        }
        model-viewer {
          width: 100%;
          height: 100%;
          background-color: transparent;
          --poster-color: transparent;
          --progress-bar-color: #064E3B;
          --progress-mask: transparent;
          touch-action: none;
        }
      </style>
    </head>
    <body>
      <model-viewer
        id="sentia-bag-viewer"
        src="${modelSourceUrl}"
        camera-controls
        touch-action="none"
        ${autoRotate ? 'auto-rotate auto-rotate-delay="600" rotation-per-second="18deg"' : ''}
        camera-orbit="${meta.cameraOrbit || '0deg 75deg 105%'}"
        field-of-view="${meta.fieldOfView || '30deg'}"
        shadow-intensity="1.4"
        shadow-softness="0.75"
        exposure="1.08"
        environment-image="neutral"
        interaction-prompt="none"
        loading="eager"
      >
      </model-viewer>
      <script>
        const mv = document.getElementById('sentia-bag-viewer');
        if (mv) {
          mv.addEventListener('load', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MODEL_LOADED' }));
            }
          });
          mv.addEventListener('error', function(e) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'MODEL_ERROR', 
                detail: e && e.detail ? String(e.detail) : 'GLB decode error' 
              }));
            }
          });
        }

        window.setCameraAngle = function(angle) {
          if (!mv) return;
          if (angle === 'front') mv.cameraOrbit = '0deg 75deg 105%';
          if (angle === 'side') mv.cameraOrbit = '90deg 75deg 105%';
          if (angle === 'back') mv.cameraOrbit = '180deg 75deg 105%';
        };
      </script>
    </body>
    </html>
  `, [modelSourceUrl, meta.cameraOrbit, meta.fieldOfView, autoRotate]);

  return (
    <View style={[styles.container, { height }]}>
      {isLoading && !hasError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Streaming 3D Digital Twin...</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.errorOverlay}>
          <AlertTriangle size={20} color={Colors.statusWarning} />
          <Text style={styles.errorText}>Digital twin stream interrupted</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <RotateCw size={12} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.retryBtnText}>Reload Model</Text>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{
          html: htmlContent,
          baseUrl: CDN_BASE_URL,
        }}
        style={styles.webview}
        scrollEnabled={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        mixedContentMode="always"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MODEL_LOADED') {
              setIsLoading(false);
              setHasError(false);
            } else if (data.type === 'MODEL_ERROR') {
              setIsLoading(false);
              setHasError(true);
            }
          } catch {}
        }}
        onLoadEnd={() => {
          // WebView container loaded
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {showControls && !hasError && (
        <View style={styles.controlsBar}>
          <View style={styles.angleButtonGroup}>
            <TouchableOpacity
              style={[styles.angleBtn, activeAngle === 'front' && styles.angleBtnActive]}
              onPress={() => handleAngleChange('front')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.angleBtnText,
                  activeAngle === 'front' && styles.angleBtnTextActive,
                ]}
              >
                Front
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.angleBtn, activeAngle === 'side' && styles.angleBtnActive]}
              onPress={() => handleAngleChange('side')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.angleBtnText,
                  activeAngle === 'side' && styles.angleBtnTextActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.angleBtn, activeAngle === 'back' && styles.angleBtnActive]}
              onPress={() => handleAngleChange('back')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.angleBtnText,
                  activeAngle === 'back' && styles.angleBtnTextActive,
                ]}
              >
                Harness
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badgePill}>
            <RotateCw size={11} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.badgePillText}>360 Orbit</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 246, 238, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 246, 238, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    gap: 6,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    marginTop: 4,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  controlsBar: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  angleButtonGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: BorderRadius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.subtle,
  },
  angleBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  angleBtnActive: {
    backgroundColor: Colors.primary,
  },
  angleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  angleBtnTextActive: {
    color: '#FAF6EE',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EEDCC0',
    ...Shadows.subtle,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
});
