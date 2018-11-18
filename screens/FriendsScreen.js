import React, { Component } from 'react'
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native'
import AtoZList from 'react-native-atoz-list'
import _ from 'lodash'
import { SearchBar } from 'react-native-elements'
import Fire from '../components/Fire'
import { generateRowNoFunction } from '../components/KiVisual'
import AwesomeButton from 'react-native-really-awesome-button'

const { width, height } = Dimensions.get('window')

const hRatio = value => {
  return (value / 812) * height
}

const wRatio = value => {
  return (value / 375) * width
}

export default class App extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      data: {},
      error: null,
      pool: [],
    }
    // this.arrayholder = names;
    // console.log('Blah????',  names);
    this.dataArray = []
  }

  componentDidMount() {
    this.retrieveFriendList()
  }

  retrieveFriendList = async () => {
    let rawData = await Fire.shared.getFriends()
    // friends = _.forEach(friends,function(friend){_.assign(friend,{that:this.state.loading})})
    let friends = []
    rawData.forEach((oneData, index) => {
      friends.push(Object.assign(oneData, { that: this, index }))
    })
    this.dataArray = friends
    let res = _.groupBy(friends, friend => friend.name[0].toUpperCase())
    // console.log('BOOOO', res);
    this.setState({
      data: res,
      error: res.error || null,
      loading: false,
    })
    // this.arrayholder = res;
  }

  _renderHeader(data) {
    return (
      <View
        style={{ height: 35, justifyContent: 'center', backgroundColor: '#eee', paddingLeft: 10 }}
      >
        <Text>{data.sectionId}</Text>
      </View>
    )
  }

  addPool(data) {
    let existingPool = this.state.pool
    // existingPool.map(value=>value.name).sort().sort((a,b)=>{
    // })
    let flag = false
    for (let i = 0; i < existingPool.length; ++i) {
      if (existingPool[i].index == data.index) {
        existingPool.splice(i, 1)
        flag = true
        break
      }
    }
    if (!flag) existingPool.push(data)
    this.setState({ pool: existingPool })
  }

  _renderCell(data) {
    return (
      <TouchableOpacity
        style={styles.cell}
        onPress={() => {
          data.that.props.navigation.navigate('ChatScreen', {
            uri: data.uri,
            name: data.name,
            uid: data.uid,
          })
        }}
      >
        <Image source={{ uri: data.uri }} style={styles.placeholderCircle} />
        <View style={styles.nameBox}>
          <Text style={styles.nameText}>{data.name}</Text>
          <Text style={styles.descriptionText}> Who is the AI if they don't know</Text>
        </View>
      </TouchableOpacity>
    )
  }

  searchFilterFunction = text => {
    // console.log(this.state.data);
    const newData = this.dataArray.filter(item => {
      const itemData = `${item.name.toUpperCase()}`
      const textData = text.toUpperCase()
      return itemData.indexOf(textData) > -1
    })
    let groupedNewData = _.groupBy(newData, data => data.name[0].toUpperCase())
    this.setState({
      data: groupedNewData,
    })
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Text style={styles.titleText}>Friends</Text>
        <SearchBar
          placeholder="Type Here..."
          platform="ios"
          containerStyle={{ backgroundColor: 'white' }}
          // placeholderTextColor="rgb(7,43,49)"
          onChangeText={text => this.searchFilterFunction(text)}
          autoCorrect={false}

          // showLoading={true}
        />
        <AtoZList
          sectionHeaderHeight={hRatio(35)}
          cellHeight={hRatio(72)}
          data={this.state.data}
          renderCell={this._renderCell}
          renderSection={this._renderHeader}
        />

        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home')
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home')
            this.props.navigation.openDrawer()
          }}
        >
          <Image source={require('../assets/icons/back.png')} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: '#fff',
  },
  swipeContainer: {},
  alphabetSidebar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    marginTop: hRatio(121),
    color: 'rgb(7,43,79)',
    fontFamily: 'GSB',
    fontSize: 36,
    paddingLeft: hRatio(20),
  },
  placeholderCircle: {
    width: wRatio(72),
    height: wRatio(72),
    borderRadius: wRatio(72) / 2,
    marginRight: wRatio(24),
    marginLeft: wRatio(18),
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
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
  nameBox: {
    flex: 1,
  },
  nameText: {
    fontSize: 24,
    fontFamily: 'GSB',
    color: 'rgb(7,43,49)',
    marginTop: hRatio(2.5),
  },
  descriptionText: {
    marginTop: hRatio(12),
    marginBottom: hRatio(2.5),
    fontSize: 18,
    fontFamily: 'GR',
    color: 'rgb(200,199,207)',
  },
  cell: {
    marginTop: hRatio(12),
    marginBottom: hRatio(12),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  kiContainer: {
    width: width,
    height: (91 / 812) * height,
    marginTop: (17 / 812) * height,
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: hRatio(55),
    left: wRatio(175 / 2),
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
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
