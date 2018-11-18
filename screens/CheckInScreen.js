import React from 'react'
import {
  ScrollView,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { Constants, Svg } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import Touchable from 'react-native-platform-touchable'
import ChangeScreen from './ChangeScreen.js'
import Fire from '../components/Fire'
import { generateCirclesRow } from '../components/KiVisual'
import Canvas from 'react-native-canvas'
import AsyncImageAnimated from '../components/AsyncImageAnimated'
import GenericScreen from '../components/GenericScreen'
import AwesomeButton from 'react-native-really-awesome-button'

const { width, height } = Dimensions.get('window')

export default class CheckInScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
    this.actionTaken = false
    this.mountState = false
    this.state = {
      pool: [],
      poolLoaded: false,
      isVisited: true,
      circles: [],
    }

    console.log('checking params', this.props.navigation.state.params)

    // this.props.navigation.setParams({ jump: this._onPress });
    //this.fetchdata();
  }

  componentDidMount() {
    this.mountState = true
    this.fetchdata()
    // await this.fetchVenueData();
  }

  componentWillUnmount() {
    this.mountState = false
    this.actionTaken = false
  }

  fetchdata() {
    const place = this.props.navigation.getParam('placeID', '0')
    // console.log("begin fetching");
    Promise.all([Fire.shared.getPlacePool(place), Fire.shared.isVisited(place)]).then(
      ([pool, isVisited]) => {
        // console.log("changed", isVisited);
        if (this.mountState) this.setState({ pool, isVisited, poolLoaded: true })
      }
    )
  }

  drawKiView() {
    // follows this tutorial:
    // https://www.youtube.com/watch?v=XATr_jdh-44
    // console.log(this.state.pool)
    if (this.state.poolLoaded) {
      //console.log('ZZZZZZZZ',this.state.sum);
      return <View style={styles.kiContainer}>{generateCirclesRow(this.state.pool)}</View>
    } else {
      return <View style={styles.kiContainer} />
    }
  }

  render() {
    const { navigate, getParam, pop } = this.props.navigation
    const displayText = this.state.isVisited ? 'Take back Ki' : 'Deposit Ki'
    const place = this.props.navigation.getParam('placeID', '0')
    return (
      <View style={{ flex: 1 }}>
        <GenericScreen
          source={getParam('uri')}
          name={getParam('name')}
          description={getParam('location')}
        >
          <Text style={styles.numberText}> {this.state.pool.length} </Text>
          <Text style={styles.descriptionText}> # of Ki </Text>
          {this.drawKiView()}
          <View style={styles.buttonContainer}>
            <AwesomeButton
              // progress
              height={(68 / 812) * height}
              backgroundColor="#FFFFFF"
              borderRadius={(34 / 812) * height}
              onPress={next => {
                this.actionTaken = true
                ;(this.state.isVisited
                  ? Fire.shared.checkout(place)
                  : Fire.shared.checkin(place)
                ).then(() => {
                  this.fetchdata()
                })
                next()
              }}
            >
              <Text style={{ fontSize: 15, fontFamily: 'GR', fontWeight: 'bold' }}>
                {displayText}
              </Text>
            </AwesomeButton>
          </View>
        </GenericScreen>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home', { shouldUpdate: this.actionTaken })
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    fontFamily: 'kontakt',
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    fontWeight: '900',
  },
  kiContainer: {
    width: width,
    height: (91 / 812) * height,
    marginTop: (17 / 812) * height,
  },
  container: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FFF',
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  commentContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  commentNumber: {
    fontFamily: 'kontakt',
    fontSize: 15,
  },
  imagePropmtContainer: {
    marginBottom: 5,
  },
  imagePropmtText: {
    fontFamily: 'kontakt',
    fontSize: 15,
  },
  imageContainer: {
    marginBottom: 20,
  },
  cancelButton: {
    flex: 0.5,
    marginLeft: 20,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#222',
  },
  cancelText: {
    fontFamily: 'kontakt',
    fontSize: 18,
    textAlign: 'center',
  },
  confirmButton: {
    flex: 0.5,
    marginLeft: 10,
    marginRight: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  confirmText: {
    fontFamily: 'kontakt',
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    marginTop: 15,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endPadding: {
    paddingRight: 8,
  },
  titleCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
  },
  titleButton: {
    backgroundColor: '#fff',
  },
  titleChangeText: {
    fontFamily: 'kontakt',
    fontSize: 10,
    color: 'blue',
  },
  titleText: {
    fontFamily: 'kontakt',
    fontSize: 18,
    fontWeight: 'bold',
  },
  generalText: {
    fontFamily: 'kontakt',
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
    opacity: 0.8,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: (17 / 812) * height,
    borderRadius: (34 / 812) * height,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    paddingBottom: 55,
  },
  textContent: {
    position: 'absolute',
    alignItems: 'center',
    bottom: (50 / 812) * height,
    height: (100 / 812) * height,
    left: 0,
    width: '100%',
    height: '25%',
  },
  numberText: {
    fontSize: 15,
    color: 'rgb(7,43,79)',
    textAlign: 'center',
    marginTop: 25,
  },
  descriptionText: {
    marginTop: 4,
    color: 'rgb(7,43,79)',
    opacity: 0.5,
    textAlign: 'center',
  },
})
