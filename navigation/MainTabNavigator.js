import React from 'react';
import { Platform, View, TouchableHighlight, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/FontAwesome';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import TabBarIcon from '../components/TabBarIcon';
import CheckInButton from "./CheckInButton.js"

import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import MenuScreen from '../screens/MenuScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckInScreen from '../screens/CheckInScreen';
import PoolScreen from '../screens/PoolScreen';


const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const FriendsStack = createStackNavigator({
  Friends: FriendsScreen,
  Pool: PoolScreen,
});

FriendsStack.navigationOptions = {
  tabBarLabel: 'Friends',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link'}
    />
  ),
};

const MenuStack = createStackNavigator({
  Menu: MenuScreen,
});

MenuStack.navigationOptions = {
  tabBarLabel: 'Menu',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}
    />
  ),
};

const CheckButtonStack = createStackNavigator({
  CheckButton: {screen: () => this.props.navigation.navigate('Stack')},
});

CheckButtonStack.navigationOptions = {
  tabBarLabel: ' ',
  tabBarIcon: () => {
    // console.log(this.props);
    // let { navigate } = this.props.navigation;
    // return (
    //   <View style={{
    //     bottom: '25%',
    //     alignItems: 'center'
    //   }}>
    //     <TouchableHighlight
    //       onPress={() => {console.log("CheckInButton Press"); navigate("CheckIn");}}
    //       underlayColor="#2882D8"
    //       style={styles.touchableButton}>
    //       <Icon name="plus" size={24} color="#fff"/>
    //     </TouchableHighlight>
    //   </View>
    // )
    return (<CheckInButton/>)
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  touchableButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#48A2F8',
  },
});

export default createBottomTabNavigator({
  HomeStack,
  FriendsStack,
  // CheckButtonStack,
  // MenuStack,
});
