import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

type TabIconName = 'compass' | 'search' | 'heart' | 'person';

function TabIcon({
  name,
  label,
  focused,
}: {
  name: TabIconName;
  label: string;
  focused: boolean;
}) {
  const iconMap: Record<TabIconName, keyof typeof Ionicons.glyphMap> = {
    compass: focused ? 'compass' : 'compass-outline',
    search: focused ? 'search' : 'search-outline',
    heart: focused ? 'heart' : 'heart-outline',
    person: focused ? 'person' : 'person-outline',
  };

  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons
          name={iconMap[name]}
          size={21}
          color={focused ? Colors.light.primary : Colors.light.textSecondary}
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="compass" label="Explorer" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="search" label="Chercher" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="heart" label="Favoris" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" label="Profil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 28,
    backgroundColor: Colors.light.surfaceGlass,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: Colors.light.surfaceGlassBorder,
    paddingBottom: 0,
    paddingTop: 0,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.1,
          shadowRadius: 32,
        }
      : {
          elevation: 20,
          shadowColor: '#1A3C34',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        }),
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.light.primaryLight,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
