import React from 'react';
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';

export default class NotificationScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(){
    super();
    this.mountState = false;
    this.state = {
      notification: [],
    };
    Fire.shared.getNotification().then((data) => {
      if (this.mountState && data.length) {
        // this.setState({notification: data});
        let dataArray = [];
        for (let i = 0; i < 10; ++i) {
          dataArray.push(data[i % data.length]);
        }
        this.setState({notification: dataArray});
      }
    });
  }

  componentDidMount() {
    this.mountState = true;
  }

  componentWillUnmount() {
    this.mountState = false;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{marginBottom: 10}}>
          <Text style={styles.titleText}>Notification</Text>
        </View>
        <FlatList
          style={styles.notificationList}
          data={this.state.notification}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderListItem}>
        </FlatList>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {this.props.navigation.navigate("Home")}}>
          <Ionicons name='ios-close' size={25} color="#000"/>
        </TouchableOpacity>
      </View>
    );
  }

  _keyExtractor = (item, index) => {return "notification" + index}

  _renderSingleItem = (item) => {
    if (item.type == 'sys1') {
      return (
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      );
    } else if (item.type == 'taski') {
      return (
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageText}>{item.name + " invite you to an event"}</Text>
        </View>
      );
    } else if (item.type == 'add1') {
      return (
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageText}>{item.name + " becomes your friend"}</Text>
        </View>
      );
    } else if (item.type == 'add2') {
      return (
        <View style={styles.messageTextContainer}>
          <Button title="Confirm" onPress={()=>{}} />
          <Button title="Reject" onPress={()=>{}} />
        </View>
      );
    } else {
      return null;
    }
  }

  _getImage(item) {
    if (item.type == 'sys1')
      return require("../assets/images/PlayerX_logo.png");
    else
      return {uri: item.uri};
  }

  _pressSingleItem = (item) => {
    if (item.type == 'taski') {
      // console.log("item.task", item.task);
      this.props.navigation.navigate("JoinTaskScreen", {taskID: item.task});
    } else if (item.type == 'add1') {
      Alert.alert(
        'Congratulations',
        'You and ' + item.name + ' are friends now.',
        // [
        //   {text: 'No', onPress: () => console.warn('NO Pressed'), style: 'cancel'},
        //   {text: 'Yes', onPress: () => {console.warn('YES Pressed'); Fire.shared.addFriend(item.uid2, "add2")} },
        // ]
      );
    }
  }

  _renderListItem = ({item}) => {
    let displayText = 'Here comes a new message';
    // console.log("item.uri", item.uri);
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => this._pressSingleItem(item)}>
        <View style={{flex: 0.25,
          // borderWidth: 1, borderColor: '#000'
        }}>
          <Image
            style={styles.userImage}
            source={this._getImage(item)}
          />
        </View>
        <View style={{flex: 0.75, justifyContent: 'center',
          // borderWidth: 1, borderColor: '#000',
        }}>
          {this._renderSingleItem(item)}
          <Text style={styles.timestampText}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FAFBFD',
  },
  userImage: {
    borderRadius: 32,
    height: 64,
    width: 64,
  },
  messageText: {
    fontSize: 15,
    color: '#072A4E',
  },
  timestampText: {
    fontSize: 10,
    color: '#C7C6CE',
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 32,
    color: '#313254',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  itemContainer: {
    // borderWidth: 1,
    // borderColor: '#ccc',
    marginTop: 5,
    marginBottom: 5,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTextContainer: {
    height: '60%',
    // justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: '#f00',
  },
  notificationList: {
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    borderWidth: 1.5,
    borderColor: '#000',
    // backgroundColor: '#fff',
  },
});
