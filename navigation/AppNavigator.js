import React from 'react';

import { createSwitchNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import { ScrollView, StyleSheet, Icon, View, Button, Text, Image, AsyncStorage,ImageBackground ,TouchableHighlight} from 'react-native';
import Expo from 'expo';
import GoogleSignInButton from '../components/GoogleSignInButton';
import FacebookSignInButton from '../components/FacebookSignInButton';
import { Ionicons } from '@expo/vector-icons';

// import MainTabNavigator from './MainTabNavigator';
import HomeScreen from '../screens/HomeScreen';
import DrawerView from './DrawerView.js';
import ProfileScreen from '../screens/ProfileScreen';
import EditScreen from '../screens/EditScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import DevelopmentScreen from '../screens/DevelopmentScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ChangeScreen from '../screens/ChangeScreen';
import OtherProfileScreen from '../screens/OtherProfileScreen';

import ReadyPage from '../screens/ReadyPage';
import Login from '../screens/Login';
import * as firebase from 'firebase';


class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user=> {
      this.props.navigation.navigate(user ? 'Ready' : 'Auth');
    })
  }
  render() {
    return (null);
  }
}


const PersonalDrawer = createDrawerNavigator({
  // Main: createStackNavigator({
  //   MainTabView: {
  //     screen: MainTabNavigator,
  //     navigationOptions: {
  //       header: null,
  //     },
  //   }
  // }),
  Home: createStackNavigator({HomeScreen, CheckIn: CheckInScreen, ViewOther:OtherProfileScreen}),
  Profile: createStackNavigator({ProfileScreen, Edit: EditScreen}),
  Settings: createStackNavigator({SettingsScreen}),
  Help: createStackNavigator({HelpScreen}),
  Development: createStackNavigator({DevelopmentScreen}),
}, {
  initialRouteName: 'Home',
  drawerPosition: 'left',
  contentComponent: DrawerView,
});

// const CheckInStack = createStackNavigator({
//   CheckIn: CheckInScreen,
//   Change: ChangeScreen,
// });

export default createSwitchNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  Pre: AuthLoadingScreen,
  Auth: Login,
  Ready:ReadyPage,
  PersonalDrawer,
  // CheckInStack,
},
{
  initialRouteName: 'Pre',
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    fontSize: 30,
    color:"black",
    textAlign: "center",
    fontWeight: '300',
  },
  back: {
    fontSize: 10,
    color:"white",
    textAlign: "center",
    fontWeight: '100',
  },
  image: {
    marginTop: 35,
    marginBottom: 25,
    width: 150,
    height: 150,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 7,
    borderRadius: 75
  }
})
