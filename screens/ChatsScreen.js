import React from 'react';
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';

export default class ChatsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(){
    super();
    this.mountState = false;
    this.state = {
      strangers: [],
      friends: [],
    };
    let timestamp = Fire.shared.timestamp;
    Fire.shared.getFriends().then((data) => {
      if (this.mountState && data.length) {
        // this.setState({notification: data});
        data.forEach((element) => {
          element.time = Fire.shared.timeSince(timestamp) + " ago";
        });
        let strangersList = [];
        let friendsList = [];
        for (let i = 0; i < 10; ++i) {
          strangersList.push(data[i % data.length]);
          friendsList.push(data[i % data.length]);
        }
        this.setState({strangers: strangersList, friends: friendsList});
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
          <Text style={styles.titleText}>Recent</Text>
        </View>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.strangerList}
          data={this.state.strangers}
          keyExtractor={(item, index) => {return "stranger" + index}}
          renderItem={this._renderStrangerListItem}>
        </FlatList>
        <View style={{borderBottomColor: '#ccc', borderBottomWidth: 1, marginTop: 10, marginBottom: 10,}}/>
        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.friendList}
          data={this.state.friends}
          keyExtractor={(item, index) => {return "friend" + index}}
          renderItem={this._renderFriendListItem}>
        </FlatList>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {this.props.navigation.openDrawer()}}>
          <Image source={require('../assets/icons/back.png')} />
        </TouchableOpacity>
      </View>
    );
  }

  _renderStrangerListItem = ({item}) => {
    return (
      <View style={{marginRight: 15}}>
        <Image
          style={styles.userImage}
          source={{uri: item.uri}}
        />
      </View>
    );
  }

  _renderFriendListItem = ({item}) => {
    let displayText = 'Here comes a new message';
    // console.log("item.uri", item.uri);
    return (
      <View style={styles.itemContainer}>
        <View style={{flex: 0.25,
          // borderWidth: 1, borderColor: '#000'
        }}>
          <Image
            style={styles.userImage}
            source={{uri: item.uri}}
          />
        </View>
        <View style={{flex: 0.75, justifyContent: 'center',
          // borderWidth: 1, borderColor: '#000',
        }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.usernameText}>{item.name}</Text>
            <Text style={styles.timestampText}>{item.time}</Text>
          </View>
          <Text style={styles.messageText}>Lorem ipsum dolor sit ameta....</Text>
        </View>
      </View>
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
  usernameText: {
    fontSize: 18,
    color: '#072A4E',
    fontWeight: '600', // semi-bold
  },
  timestampText: {
    fontSize: 10,
    color: '#C7C6CE',
    // fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    color: '#C7C6CE',
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
  friendList: {
    // marginTop: 10,
    // borderTopWidth: 2,
    // borderTopColor: '#ccc',
  },
  strangerList: {
    height: 90,
    // paddingRight: 15,
    // borderWidth: 1,
    // marginBottom: 10,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
    // backgroundColor: '#fff',
  },
});
