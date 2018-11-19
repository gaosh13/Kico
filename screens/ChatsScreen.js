import React from 'react'
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import { WebBrowser } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import Touchable from 'react-native-platform-touchable'
import Fire from '../components/Fire'
import { generateCirclesRow } from '../components/KiVisual'
import moment, { relativeTimeThreshold } from 'moment'

const { width, height } = Dimensions.get('window')

const hRatio = value => {
  return (value / 812) * height
}

const wRatio = value => {
  return (value / 375) * width
}

export default class ChatsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor() {
    super()
    this.mountState = false
    this.state = {
      strangers: [],
      friends: [],
    }
  }

  refreshChat() {
    Fire.shared.getChatHistory().then(chatList => {
      if (chatList && chatList.length) {
        const friends = [],
          strangers = []
        chatList.forEach(chat => {
          if (chat.isFriend) {
            friends.push(chat)
          } else {
            strangers.push(chat)
          }
        })
        if (this.mountState) {
          this.setState({
            strangers,
            friends,
          })
        }
      }
    })
  }

  componentDidMount() {
    this.mountState = true
    this.refreshChat()
  }

  componentWillUnmount() {
    this.mountState = false
  }

  // drawKiView() {
  //   if (this.state.strangers.length) {
  //     return <View style={styles.kiContainer}>{generateCirclesRow(this.state.strangers)}</View>
  //   } else {
  //     return <View style={styles.kiContainer} />
  //   }
  // }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText}>Recent</Text>
        </View>
        <View style={{ height: 64 }}>
          <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.strangerList}
            data={this.state.strangers}
            keyExtractor={(item, index) => {
              return 'stranger' + index
            }}
            renderItem={this._renderStrangerListItem}
          />
        </View>
        <View
          style={{
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
            marginTop: 10,
            marginBottom: 10,
            height: 1,
          }}
        />
        <FlatList
          showsVerticalScrollIndicator={false}
          style={{ paddingRight: 15 }}
          data={this.state.friends}
          keyExtractor={(item, index) => {
            return 'friend' + index
          }}
          renderItem={this._renderFriendListItem}
        />
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home')
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home')
            this.props.navigation.openDrawer()
          }}
        >
          <Image source={require('../assets/icons/back.png')} />
        </TouchableOpacity> */}
      </View>
    )
  }

  _renderStrangerListItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ marginRight: wRatio(12) }}
        onPress={() => {
          this.props.navigation.navigate('ChatScreen', {
            uri: item.uri,
            name: item.name,
            uid: item.uid,
            refresh: () => this.refreshChat(),
          })
        }}
      >
        <Image style={styles.userImage} source={{ uri: item.uri }} />
      </TouchableOpacity>
    )
  }

  _renderFriendListItem = ({ item }) => {
    let displayText = 'Here comes a new message'
    // console.log("item.uri", item.uri);
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate('ChatScreen', {
            uri: item.uri,
            name: item.name,
            uid: item.uid,
            refresh: () => this.refreshChat(),
          })
        }}
      >
        <View style={styles.itemContainer}>
          <View
            style={{
              flex: 0.25,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Image style={styles.userImage} source={{ uri: item.uri }} />
            {item.unreadCount ? (
              <View
                style={{
                  position: 'absolute',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#FD563F',
                  height: 24,
                  width: 24,
                  borderRadius: 12,
                  top: 1,
                  right: 4,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, lineHeight: 24 }}>
                  {item.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
          <View
            style={{
              flex: 0.75,
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={styles.usernameText}>{item.name}</Text>
              <Text style={styles.timestampText}>
                {item.updatedAt ? moment(item.updatedAt).fromNow() : ''}
              </Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              {item.text || ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
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
    height: (91 / 812) * height,
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
  // messageTextContainer: {
  //   height: '60%',
  //   // justifyContent: 'center',
  //   // borderWidth: 1,
  //   // borderColor: '#f00',
  // },
  friendList: {
    flex: 1,
    // marginTop: 10,
    // borderTopWidth: 2,
    // borderTopColor: '#ccc',
  },
  strangerList: {
    // height: 90,
    paddingHorizontal: 15,
    // borderWidth: 1,
    // marginBottom: 10,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: hRatio(60),
    right: wRatio(30),
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
    // backgroundColor: '#fff',
  },
  backButtonContainer: {
    position: 'absolute',
    top: hRatio(60),
    left: wRatio(30),
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
})
