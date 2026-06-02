import 'react-native-gesture-handler';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ListFormScreen } from './src/screens/ListFormScreen';
import { colors } from './src/config/theme';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ListForm: { mode: 'create' } | { mode: 'edit'; listId: string };
  Tasks: { listId: string };
  Search: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

function HeaderLogoutButton() {
  const { signOut } = useAuth();

  const handlePress = () => {
    Alert.alert('Logout', 'Close your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          signOut().catch(() => undefined);
        },
      },
    ]);
  };

  return (
    <Pressable onPress={handlePress} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Logout</Text>
    </Pressable>
  );
}

function AppNavigator() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <View style={styles.bootScreen} />;
  }

  return (
    <NavigationContainer theme={appTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerRight: user ? () => <HeaderLogoutButton /> : undefined,
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login', headerRight: undefined }}
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
            <Stack.Screen
              name="ListForm"
              component={ListFormScreen}
              options={({ route }) => ({
                title: route.params.mode === 'edit' ? 'Edit list' : 'Create list',
              })}
            />
            <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.subtle,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  bootScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
