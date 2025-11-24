import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const theme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#bb86fc',
        secondary: '#03dac6',
        background: '#121212',
        surface: '#1e1e1e',
    },
};

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <NavigationContainer theme={theme}>
                    <Tab.Navigator
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ focused, color, size }) => {
                                let iconName;

                                if (route.name === 'Home') {
                                    iconName = focused ? 'home' : 'home-outline';
                                } else if (route.name === 'History') {
                                    iconName = focused ? 'history' : 'history';
                                } else if (route.name === 'Settings') {
                                    iconName = focused ? 'cog' : 'cog-outline';
                                }

                                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                            },
                            headerStyle: { backgroundColor: '#1e1e1e' },
                            headerTintColor: '#fff',
                            tabBarStyle: { backgroundColor: '#1e1e1e' },
                        })}
                    >
                        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'AI Popup Info' }} />
                        <Tab.Screen name="History" component={HistoryScreen} />
                        <Tab.Screen name="Settings" component={SettingsScreen} />
                    </Tab.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
