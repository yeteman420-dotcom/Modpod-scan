import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Image, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants';
import { FootSelector, PrimaryButton, GhostButton, Spinner } from '../components/UI';
import { uriToBase64 } from '../services/claudeApi';

const MODES = ['Camera', 'Upload'];

export default function CaptureScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState('Camera');
  const [footSide, setFootSide] = useState('Left');
  const [capturedUri, setCapturedUri] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  // Tips for good scan
  const tips = [
    'Foot flat on white surface',
    'Camera directly overhead',
    'Good lighting, no shadows',
    'Remove socks & shoes',
  ];

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      setCapturedUri(photo.uri);
    } catch (e) {
      Alert.alert('Error', 'Could not capture photo. Please try again.');
    }
    setCapturing(false);
  };

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload a foot photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      setCapturedUri(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedUri) return;
    try {
      const base64 = await uriToBase64(capturedUri);
      navigation.navigate('Analysis', { base64, uri: capturedUri, footSide });
    } catch (e) {
      Alert.alert('Error', 'Could not process image. Please try again.');
    }
  };

  const retake = () => setCapturedUri(null);

  // ── Captured preview ──────────────────────────────────────────────────────
  if (capturedUri) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.screenTitle}>Review Capture</Text>
          <Text style={styles.screenSub}>{footSide} Foot</Text>

          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>{footSide.toUpperCase()} FOOT</Text>
            </View>
          </View>

          <View style={styles.confirmRow}>
            <View style={styles.confirmTip}>
              <Text style={styles.confirmTipTitle}>Is the foot clearly visible?</Text>
              <Text style={styles.confirmTipDesc}>
                Make sure your entire foot is in frame from above, on a plain surface.
              </Text>
            </View>
          </View>

          <FootSelector selected={footSide} onSelect={setFootSide} />

          <PrimaryButton title="ANALYZE WITH AI ◈" onPress={handleAnalyze} style={{ marginBottom: 12 }} />
          <GhostButton title="↺ Retake" onPress={retake} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Camera mode ───────────────────────────────────────────────────────────
  if (mode === 'Camera') {
    if (!permission) return <View style={styles.safe} />;

    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionEmoji}>📷</Text>
            <Text style={styles.permissionTitle}>Camera Access Needed</Text>
            <Text style={styles.permissionDesc}>
              ModPod Scan needs camera access to photograph your foot for AI analysis.
            </Text>
            <PrimaryButton title="GRANT PERMISSION" onPress={requestPermission} style={{ marginTop: 20 }} />
            <GhostButton title="Use Upload Instead" onPress={() => setMode('Upload')} style={{ marginTop: 12 }} />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        {/* Top bar */}
        <View style={styles.topBar}>
          <FootSelector selected={footSide} onSelect={setFootSide} />
          <TouchableOpacity onPress={() => setMode('Upload')} style={styles.switchBtn}>
            <Text style={styles.switchBtnText}>🖼 Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Camera */}
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            {/* Corner guides */}
            {[
              { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2 },
              { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2 },
              { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2 },
              { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2 },
            ].map((corner, i) => (
              <View key={i} style={[styles.corner, corner, { borderColor: COLORS.cyan }]} />
            ))}

            {/* Foot outline guide */}
            <View style={styles.guideOverlay}>
              <Text style={styles.guideText}>ALIGN FOOT IN FRAME</Text>
            </View>
          </CameraView>
        </View>

        {/* Tips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsRow}>
          {tips.map(t => (
            <View key={t} style={styles.tipChip}>
              <Text style={styles.tipChipText}>✓ {t}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Capture button */}
        <View style={styles.captureRow}>
          <TouchableOpacity
            onPress={handleCapture}
            disabled={capturing}
            activeOpacity={0.8}
            style={styles.captureBtn}
          >
            {capturing
              ? <Spinner color={COLORS.bg} size={32} />
              : <View style={styles.captureBtnInner} />
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Upload mode ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Upload Foot Photo</Text>

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          {MODES.map(m => (
            <TouchableOpacity key={m} onPress={() => setMode(m)}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}>
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                {m === 'Camera' ? '📷 ' : '🖼 '}{m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FootSelector selected={footSide} onSelect={setFootSide} />

        <TouchableOpacity onPress={handleUpload} activeOpacity={0.8} style={styles.uploadArea}>
          <Text style={styles.uploadEmoji}>🦶</Text>
          <Text style={styles.uploadTitle}>Tap to choose photo</Text>
          <Text style={styles.uploadSub}>JPG or PNG • Overhead view works best</Text>
        </TouchableOpacity>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsCardTitle}>Tips for best results</Text>
          {tips.map(t => (
            <Text key={t} style={styles.tipsCardItem}>✓  {t}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 40 },

  screenTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  screenSub: { fontSize: 13, color: COLORS.cyan, marginBottom: 20, letterSpacing: 1 },

  // Permission
  permissionContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  permissionEmoji: { fontSize: 56, marginBottom: 16 },
  permissionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  permissionDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },

  // Top bar
  topBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  switchBtn: {
    alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    marginTop: 4,
  },
  switchBtnText: { fontSize: 12, color: COLORS.textMuted },

  // Camera
  cameraContainer: { flex: 1, margin: 12, borderRadius: 16, overflow: 'hidden' },
  camera: { flex: 1 },
  corner: { position: 'absolute', width: 24, height: 24 },
  guideOverlay: {
    position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center',
  },
  guideText: {
    fontSize: 11, color: COLORS.cyan, letterSpacing: 2,
    backgroundColor: '#00000080', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },

  // Tips
  tipsRow: { paddingHorizontal: 12, paddingVertical: 8, maxHeight: 48 },
  tipChip: {
    backgroundColor: COLORS.bgCard, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
  },
  tipChipText: { fontSize: 11, color: COLORS.cyan },

  // Capture button
  captureRow: { alignItems: 'center', paddingVertical: 20 },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.cyan,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.cyan, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  captureBtnInner: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: COLORS.white,
  },

  // Preview
  previewContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, position: 'relative' },
  previewImage: { width: '100%', height: 280 },
  previewBadge: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: '#000000bb', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  previewBadgeText: { fontSize: 11, color: COLORS.cyan, fontWeight: '700' },
  confirmRow: { marginBottom: 16 },
  confirmTip: {
    backgroundColor: COLORS.bgCardAlt, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  confirmTipTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  confirmTipDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row', borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: 'transparent' },
  modeBtnActive: { backgroundColor: COLORS.cyan + '15' },
  modeBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDim },
  modeBtnTextActive: { color: COLORS.cyan },

  // Upload
  uploadArea: {
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    borderRadius: 16, padding: 48, alignItems: 'center', marginBottom: 20,
  },
  uploadEmoji: { fontSize: 52, marginBottom: 12 },
  uploadTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  uploadSub: { fontSize: 12, color: COLORS.textDim },

  // Tips card
  tipsCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#00ffe718', padding: 16,
  },
  tipsCardTitle: { fontSize: 12, color: COLORS.cyan, fontWeight: '700', marginBottom: 10, letterSpacing: 1 },
  tipsCardItem: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6, lineHeight: 18 },
});
