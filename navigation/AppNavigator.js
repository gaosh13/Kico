import React from 'react';

import { createSwitchNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation';
import { ScrollView, StyleSheet, Icon, View, Button, Text, Image, AsyncStorage,ImageBackground ,TouchableHighlight, Dimensions} from 'react-native';
import Expo from 'expo';
import GoogleSignInButton from '../components/GoogleSignInButton';
import FacebookSignInButton from '../components/FacebookSignInButton';
import { Ionicons } from '@expo/vector-icons';

// import MainTabNavigator from './MainTabNavigator';
import HomeScreen from '../screens/HomeScreen';
import DrawerView from './DrawerView.js';
import ProfileScreen from '../screens/ProfileScreen';
import EditScreen from '../screens/EditScreen';
import ChatsScreen from '../screens/ChatsScreen';
import QRScanner from '../screens/QRScanner';
import QRCodeScreen from '../screens/QRCodeScreen';
import DevelopmentScreen from '../screens/DevelopmentScreen';
import CheckInScreen from '../screens/CheckInScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ChangeScreen from '../screens/ChangeScreen';
import OtherProfileScreen from '../screens/OtherProfileScreen';
import JoinTaskScreen from '../screens/JoinTask';
import TaskListScreen from '../screens/TaskListScreen';
import CreateTaskScreen from '../screens/CreateTask';
import Congratulations from '../screens/Congratulations.js';
import FriendListScreen from '../screens/FriendListScreen.js';

import ReadyPage from '../screens/ReadyPage';
import Login from '../screens/Login';
import * as firebase from 'firebase';

const { width, height } = Dimensions.get("window");


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
  // checkIn:CheckInScreen,
  HomeStack: createStackNavigator({
    Home: HomeScreen,
    CheckIn: CheckInScreen,
    Notification: NotificationScreen,
    ViewOther: OtherProfileScreen,
    QRScanner,
    CreateTask: CreateTaskScreen,
    Congrats:Congratulations,
    InviteFriends:FriendListScreen,
  }, {
    initialRouteName: 'Home',
  }),
  Profile: createStackNavigator({ProfileScreen, Edit: EditScreen}),
  Chat: createStackNavigator({ChatsScreen}),
  Development: createStackNavigator({DevelopmentScreen}),
  QRCode: createStackNavigator({QRCodeScreen}),
  TaskListStack: createStackNavigator({TaskListScreen, JoinTaskScreen}),
}, {
  initialRouteName: 'HomeStack',
  drawerWidth: width,
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
