import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { Spinner } from '../components/UI';
import { analyzeFootImage } from '../services/claudeApi';

const STEPS = [
  'Detecting foot geometry…',
  'Mapping arch curvature…',
  'Analyzing pressure zones…',
  'Calculating spacer positions…',
  'Generating mold profile…',
  'Finalizing report…',
];

export default function AnalysisScreen({ route, navigation }) {
  const { base64, uri, footSide } = route.params;
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Scan bar animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Cycle status text
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Run analysis
  useEffect(() => {
    let cancelled = false;
    analyzeFootImage(base64, footSide)
      .then((result) => {
        if (cancelled) return;
        navigation.replace('Results', { result, uri, footSide });
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || 'Analysis failed. Please try again.');
      });
    return () => { cancelled = true; };
  }, []);

  const imageHeight = 220;
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, imageHeight],
  });

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <View style={styles.errorActions}>
            <Text style={styles.errorHint}>
              Make sure your Anthropic API key is set in{'\n'}src/constants/index.js
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>

        <Text style={styles.title}>Analyzing Foot</Text>
        <Text style={styles.sub}>{footSide} Foot · Claude Vision AI</Text>

        {/* Image with scan bar */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageDim} />
          <Animated.View style={[styles.scanBar, { transform: [{ translateY }] }]} />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{footSide.toUpperCase()} FOOT</Text>
          </View>
        </View>

        {/* Spinner + status */}
        <View style={styles.statusRow}>
          <Spinner color={COLORS.cyan} size={36} />
          <View style={styles.statusText}>
            <Text style={styles.statusStep}>{STEPS[stepIndex]}</Text>
            <Text style={styles.statusNote}>Do not close the app</Text>
          </View>
        </View>

        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              { backgroundColor: i <= stepIndex ? COLORS.cyan : COLORS.textDim }
            ]} />
          ))}
        </View>

        <Text style={styles.hint}>
          Claude AI is examining your foot geometry,{'\n'}
          pressure distribution, and optimal spacer zones.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },

  title: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  sub: { fontSize: 12, color: COLORS.cyan, letterSpacing: 1, marginBottom: 28 },

  imageWrapper: {
    width: '100%', maxWidth: 320, height: 220,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: 28, position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080f0f88',
  },
  scanBar: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan, shadowOpacity: 1, shadowRadius: 8, elevation: 6,
  },
  imageBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: '#000000cc', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  imageBadgeText: { fontSize: 10, color: COLORS.cyan, fontWeight: '700' },

  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20,
  },
  statusText: { flex: 1 },
  statusStep: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600', marginBottom: 2 },
  statusNote: { fontSize: 11, color: COLORS.textDim },

  dots: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  hint: {
    fontSize: 13, color: COLORS.textDim, textAlign: 'center', lineHeight: 20,
  },

  // Error
  errorContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  errorEmoji: { fontSize: 52, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '800', color: '#ff6655', marginBottom: 10 },
  errorMsg: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  errorActions: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 16, width: '100%',
  },
  errorHint: { fontSize: 12, color: COLORS.orange, textAlign: 'center', lineHeight: 18 },
});
