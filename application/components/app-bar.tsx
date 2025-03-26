// components/app-bar.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AppBar = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-200))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogOut = async () => {
    await AsyncStorage.removeItem("access_token");
    setIsLoggedIn(false);
  }

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      setProfileMenuVisible(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleProfileMenu = () => {
    if (profileMenuVisible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setProfileMenuVisible(false));
    } else {
      setProfileMenuVisible(true);
      setMenuVisible(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
    toggleMenu();
    if (profileMenuVisible) {
      toggleProfileMenu();
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      zIndex: 1000,
    },
    appBar: {
      height: 70,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 70,
    },
    title: {
      color: 'white',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    icon: {
      padding: 8,
      borderRadius: 20,
    },
    avatar: {
      width: 40,
      height: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.4)',
    },
    sideMenu: {
      position: 'absolute',
      top: 70,
      left: 0,
      width: 250,
      height: 800,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      zIndex: 1001,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    menuHeader: {
      paddingVertical: 30,
      paddingHorizontal: 20,
      backgroundColor: '#f97316',
      alignItems: 'center',
    },
    menuTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    menuItemHome: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 30, // Increase vertical padding
      marginBottom: 0, // Add margin at the bottom of each item
      backgroundColor: '#fff',
     },
    menuItemText: {
      color: "#f97316",
      fontSize: 16,
      marginLeft: 16,
    },
    overlay: {
      position: 'absolute',
      top: 70,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
    },
    profileMenu: {
      position: 'absolute',
      top: 70,
      right: 10,
      width: 190,
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 5,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      zIndex: 1001,
    },
    profileMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 4,
    },
    profileMenuItemText: {
      color: '#1f2937',
      fontSize: 15,
      marginLeft: 12,
    },
    rightIconsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <LinearGradient
          colors={['#f97316', '#ea580c', '#c2410c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
        {/* Hamburger Menu */}
        <TouchableOpacity
          onPress={toggleMenu}
          style={[styles.icon, { backgroundColor: menuVisible ? 'rgba(255,255,255,0.2)' : 'transparent' }]}
        >
          <Ionicons name={menuVisible ? "close" : "menu"} size={26} color="white" />
        </TouchableOpacity>

        {/* App Title */}
        <Text style={styles.title}>FortiFit</Text>

        {/* Right side icons (chat + avatar) */}
        <View style={styles.rightIconsContainer}>
          {/* Chat Icon */}
          <TouchableOpacity 
            onPress={() => navigateTo('/chat')} 
            style={[styles.icon, { marginRight: 10 }]}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
          </TouchableOpacity>

          {/* Profile Avatar */}
          <TouchableOpacity onPress={toggleProfileMenu} style={styles.icon}>
            <View style={styles.avatar}>
              <Image
                source={{ uri: 'https://picsum.photos/200' }}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar Menu with Animation */}
      {menuVisible && (
        <>
          <Animated.View
            style={[
              styles.sideMenu,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <TouchableOpacity
              onPress={() => navigateTo('/home')}
              style={styles.menuItemHome}
            >
              <Ionicons name="home" size={24} color="#f97316" />
              <Text style={styles.menuItemText}>Home</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => navigateTo('/community')}
              style={styles.menuItemHome}
            >
              <Ionicons name="people" size={24} color="#f97316"/>
              <Text style={styles.menuItemText}>Community</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => navigateTo('/progress')}
              style={styles.menuItemHome}
            >
              <Ionicons name="trending-up" size={24} color="#f97316" />
              <Text style={styles.menuItemText}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo('/challenges')}
              style={styles.menuItemHome}
            >
              <Ionicons name="trophy" size={24} color="#f97316" />
              <Text style={styles.menuItemText}>Challenges</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo('/settings')}
              style={styles.menuItemHome}
            >
              <Ionicons name="settings" size={24} color="#f97316" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo('/help')}
              style={styles.menuItemHome}
            >
              <Ionicons name="help-circle" size={24} color="#f97316" />
              <Text style={styles.menuItemText}>Help</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Overlay to close menu when clicking outside */}
          <TouchableOpacity
            style={styles.overlay}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        </>
      )}

      {/* Profile Menu Dropdown with Animation */}
      {profileMenuVisible && (
        <>
          <Animated.View
            style={[
              styles.profileMenu,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity
              onPress={() => navigateTo('/UserProfile')}
              style={styles.profileMenuItem}
            >
              <MaterialIcons name="person" size={20} color="#f97316" />
              <Text style={styles.profileMenuItemText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo('/account')}
              style={styles.profileMenuItem}
            >
              <Ionicons name="key" size={20} color="#f97316" />
              <Text style={styles.profileMenuItemText}>Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogOut}
              style={styles.profileMenuItem}
            >
              <Ionicons name="log-out" size={20} color="#f97316" />
              <Text style={styles.profileMenuItemText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Transparent overlay to close profile menu */}
          <TouchableOpacity
            style={styles.overlay}
            onPress={toggleProfileMenu}
            activeOpacity={1}
          />
        </>
      )}
    </View>
  );
};

export default AppBar;