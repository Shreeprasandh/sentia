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
import { Asset } from 'expo-asset';
import { RotateCw, Maximize2, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows, BorderRadius, Spacing } from '../theme/tokens';
import { Bag3DModelMeta, get3DModelForBag } from '../assets/modelMap';

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
  const [assetUri, setAssetUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAngle, setActiveAngle] = useState<'front' | 'side' | 'back'>('front');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    (async () => {
      try {
        if (Platform.OS === 'web') {
          if (isMounted) {
            setAssetUri(meta.webUrl);
            setIsLoading(false);
          }
          return;
        }

        const asset = Asset.fromModule(meta.asset);
        await asset.downloadAsync();
        if (isMounted) {
          const resolved = asset.localUri || asset.uri || meta.webUrl;
          setAssetUri(resolved);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setAssetUri(meta.webUrl);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
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
        }
      </style>
    </head>
    <body>
      <model-viewer
        id="sentia-bag-viewer"
        src="${assetUri || meta.webUrl}"
        camera-controls
        touch-action="pan-y"
        ${autoRotate ? 'auto-rotate auto-rotate-delay="800" rotation-per-second="18deg"' : ''}
        camera-orbit="0deg 75deg 105%"
        field-of-view="${meta.fieldOfView}"
        shadow-intensity="1.4"
        shadow-softness="0.75"
        exposure="1.08"
        environment-image="neutral"
        interaction-prompt="none"
        loading="eager"
      >
      </model-viewer>
      <script>
        window.setCameraAngle = function(angle) {
          const mv = document.getElementById('sentia-bag-viewer');
          if (!mv) return;
          if (angle === 'front') mv.cameraOrbit = '0deg 75deg 105%';
          if (angle === 'side') mv.cameraOrbit = '90deg 75deg 105%';
          if (angle === 'back') mv.cameraOrbit = '180deg 75deg 105%';
        };
      </script>
    </body>
    </html>
  `, [assetUri, meta.id, meta.webUrl, meta.fieldOfView, autoRotate]);

  return (
    <View style={[styles.container, { height }]}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Initializing 3D Digital Twin...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        onLoadEnd={() => setIsLoading(false)}
      />

      {showControls && (
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
