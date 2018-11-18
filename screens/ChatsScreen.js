import React from 'react';
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';
import {generateCirclesRow} from '../components/KiVisual';

const { width, height } = Dimensions.get("window");

const hRatio = (value) => {
  return value /812*height;
}

const wRatio = (value) => {
  return value /375*width;
}


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
        data.forEach((element) => {
          element.time = Fire.shared.timeSince(timestamp) + " ago";
        });
        let strangersList = [];
        let friendsList = [];
        for (let i = 0; i < 10; ++i) {
          strangersList.push(data[i % data.length]);
          friendsList.push(data[i % data.length]);
        }
        // this.setState({strangers: strangersList, friends: friendsList});
        this.setState({strangers: data, friends: data});
      }
    });
  }

  componentDidMount() {
    this.mountState = true;
  }

  componentWillUnmount() {
    this.mountState = false;
  }

  drawKiView() {
    if (this.state.strangers.length){
      return (
        <View style={styles.kiContainer}>
          {generateCirclesRow(this.state.strangers)}          
        </View>
      )
    } else{
      return (
        <View style={styles.kiContainer} />
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{marginBottom: 10}}>
          <Text style={styles.titleText}>Recent</Text>
        </View>
        {this.drawKiView()}
        <View style={{borderBottomColor: '#ccc', borderBottomWidth: 1, marginTop: 10, marginBottom: 10,}}/>
        <FlatList
          showsVerticalScrollIndicator={false}
          style={{marginLeft:wRatio(18)}}
          data={this.state.friends}
          keyExtractor={(item, index) => {return "friend" + index}}
          renderItem={this._renderFriendListItem}>
        </FlatList>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {this.props.navigation.navigate('Home')}}>
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
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
    backgroundColor: '#FAFBFD',
  },
  kiContainer: {
    width: width,
    height: 91/812*height,
    // marginTop: 17/812*height, 
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
    marginLeft: wRatio(18),
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
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
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
