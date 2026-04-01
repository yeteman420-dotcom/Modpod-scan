import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('scan_history').then(raw => {
        setHistory(raw ? JSON.parse(raw) : []);
      });
    }, [])
  );

  const clearAll = () => {
    Alert.alert(
      'Clear History',
      'Delete all saved scans?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All', style: 'destructive',
          onPress: () => {
            AsyncStorage.removeItem('scan_history');
            setHistory([]);
          },
        },
      ]
    );
  };

  const deleteOne = (id) => {
    Alert.alert('Delete Scan', 'Remove this scan from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          const updated = history.filter(h => h.id !== id);
          setHistory(updated);
          AsyncStorage.setItem('scan_history', JSON.stringify(updated));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.date);
    const archType = item.result?.measurements?.archType || '—';
    const spacerCount = item.result?.spacerPlacements?.length || 0;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Results', {
          result: item.result,
          uri: item.uri,
          footSide: item.footSide,
        })}
        onLongPress={() => deleteOne(item.id)}
        style={styles.card}
      >
        <Image source={{ uri: item.uri }} style={styles.thumb} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardFoot}>{item.footSide} Foot</Text>
          <Text style={styles.cardDate}>
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={styles.cardTags}>
            <View style={styles.miniTag}>
              <Text style={styles.miniTagText}>{archType} Arch</Text>
            </View>
            <View style={styles.miniTag}>
              <Text style={styles.miniTagText}>{spacerCount} Spacers</Text>
            </View>
          </View>
        </View>
        <Text style={styles.cardChevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.topBar}>
        <Text style={styles.title}>Scan History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🦶</Text>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyDesc}>Your saved scans will appear here</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Capture')} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Start First Scan →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Text style={styles.hint}>Long press a scan to delete it</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  clearBtn: { fontSize: 13, color: COLORS.red },

  list: { padding: 16, paddingTop: 8 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 10, overflow: 'hidden',
  },
  thumb: { width: 80, height: 80 },
  cardInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  cardFoot: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  cardDate: { fontSize: 11, color: COLORS.textDim, marginBottom: 6 },
  cardTags: { flexDirection: 'row', gap: 6 },
  miniTag: {
    paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: COLORS.cyan + '15', borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.cyan + '30',
  },
  miniTagText: { fontSize: 10, color: COLORS.cyan, fontWeight: '600' },
  cardChevron: { fontSize: 22, color: COLORS.textDim, paddingRight: 14 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16, opacity: 0.4 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: COLORS.textDim, marginBottom: 24 },
  emptyBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.cyan,
  },
  emptyBtnText: { color: COLORS.cyan, fontSize: 13, fontWeight: '700' },

  hint: { fontSize: 11, color: COLORS.textDim, textAlign: 'center', marginTop: 8, marginBottom: 16 },
});
