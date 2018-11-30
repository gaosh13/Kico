import React from 'react'
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import { WebBrowser } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import Touchable from 'react-native-platform-touchable'
import Fire from '../components/Fire'

const { width, height } = Dimensions.get('window')
const hRatio = value => {
  return (value / 812) * height
}
const wRatio = value => {
  return (value / 375) * width
}

export default class TaskListScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor() {
    super()
    this.mountState = false
    this.state = {
      task: [],
    }
  }

  componentDidMount() {
    this.mountState = true
    Fire.shared.getTaskList().then(data => {
      if (this.mountState) this.setState({ task: data })
    })
  }

  componentWillUnmount() {
    this.mountState = false
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText}>Missions</Text>
        </View>
        <FlatList
          data={this.state.task}
          contentContainerStyle={{ alignItems: 'center' }}
          keyExtractor={(item, index) => {
            return 'task' + index
          }}
          showsVerticalScrollIndicator={false}
          renderItem={this._renderListItem}
        />
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home')
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
      </View>
    )
  }

  _handlePress = item => {
    this.props.navigation.navigate('JoinTaskScreen', {
      taskID: item.id,
      remove: taskID => {
        this._removeItem(taskID)
      },
    })
  }

  _removeItem = taskID => {
    let task = this.state.task
    for (let i = 0; i < task.length; ++i) {
      if (taskID.toString() == task[i].id.toString()) {
        task.splice(i, 1)
        break
      }
    }
    // console.log('newList', task)
    this.setState({ task })
  }

  _renderListItem = ({ item }) => <TaskItem item={item} onPressItem={this._handlePress} />
}

class TaskItem extends React.PureComponent {
  render() {
    const item = this.props.item
    // console.log('item', item)
    return (
      <TouchableOpacity onPress={() => this.props.onPressItem(item)} style={styles.card}>
        <View>
          <Image
            style={{
              width: wRatio(300),
              height: hRatio(150),
            }}
            source={
              item.where.uri ? { uri: item.where.uri } : require('../assets/images/library.jpg')
            }
            defaultSource={require('../assets/images/PlayerX_logo.png')}
          />
          <View style={styles.cardDescription}>
            <View style={{ flex: 0.5, justifyContent: 'center', paddingLeft: wRatio(10) }}>
              <Text style={styles.activityText}>{item.what}</Text>
              {/*<Text style={styles.activityText}>Coffee Break</Text>*/}
              {/*<Text style={styles.furtherText}>Suzzallo Cafe, Today @ 3:30pm</Text>*/}
              <Text style={styles.furtherText}>
                {item.where.name}, {item.when.toString()}
              </Text>
            </View>
            {/*
            <View style={{flex: 0.5}}>
              {generateSmallCircles(item.users)}
            </View>
            */}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  activityText: {
    color: 'rgb(7,43,79)',
    fontFamily: 'GSB',
    fontSize: 16,
  },
  furtherText: {
    color: '#aaa',
    fontFamily: 'GSB',
    fontSize: 10,
  },
  card: {
    borderRadius: 15,
    // borderWidth: 2,
    marginVertical: wRatio(5),
    //elevation:5,
    width: wRatio(300),
    // height:hRatio(280),
    overflow: 'hidden',
  },
  cardDescription: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 5,
  },
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
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
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
