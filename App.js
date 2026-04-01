import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { COLORS } from './src/constants';
import HomeScreen from './src/screens/HomeScreen';
import CaptureScreen from './src/screens/CaptureScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.bg, shadowColor: 'transparent', elevation: 0 },
  headerTintColor: COLORS.cyan,
  headerTitleStyle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 16 },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: COLORS.bg },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={COLORS.bg} />
          <Stack.Navigator screenOptions={screenOptions}>

            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: '',
                headerRight: () => null,
              }}
            />

            <Stack.Screen
              name="Capture"
              component={CaptureScreen}
              options={({ navigation }) => ({
                title: 'Scan Foot',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('History')}
                    style={styles.historyBtn}
                  >
                    <Text style={styles.historyBtnText}>History</Text>
                  </TouchableOpacity>
                ),
              })}
            />

            <Stack.Screen
              name="Analysis"
              component={AnalysisScreen}
              options={{
                title: 'Analyzing…',
                headerLeft: () => null, // prevent back during analysis
                gestureEnabled: false,
              }}
            />

            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ title: 'Scan Results' }}
            />

            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'Past Scans' }}
            />

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  historyBtn: { marginRight: 16 },
  historyBtnText: { color: COLORS.cyan, fontSize: 13, fontWeight: '600' },
});
