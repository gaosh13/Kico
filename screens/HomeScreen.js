import React, { Component } from 'react'
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ImageBackground,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native'
import { Constants, Location, Permissions, LinearGradient } from 'expo'
import Fire from '../components/Fire'
import { REACT_APP_FOURSQUARE_ID, REACT_APP_FOURSQUARE_SECRET } from 'react-native-dotenv'
import AsyncImageAnimated from '../components/AsyncImageAnimated'
import { RandomCircles } from '../components/KiVisual'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import MapView, { Marker } from 'react-native-maps'

const { width, height } = Dimensions.get('window')

const hRatio = value => {
  return (value / 812) * height
}

const wRatio = value => {
  return (value / 375) * width
}

const CARD_HEIGHT = hRatio(230)
const CARD_WIDTH = wRatio(230)

//https://codedaily.io/tutorials/9/Build-a-Map-with-Custom-Animated-Markers-and-Region-Focus-when-Content-is-Scrolled-in-React-Native

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
    const channel = Math.floor(Math.random() * 7)
    // console.log('!!!!!',JSON.parse(REACT_APP_FOURSQUARE_SECRET)[0],typeof JSON.parse(REACT_APP_FOURSQUARE_SECRET)[0]);
    this.Key = JSON.parse(REACT_APP_FOURSQUARE_ID)[channel]
    this.Secret = JSON.parse(REACT_APP_FOURSQUARE_SECRET)[channel]
    this.mountState = false
    this.updatePool = false
    this.location = null
    this.updatePool = false
    this.state = {
      location: { coords: { latitude: 0, longitude: 0 } },
      errorMessage: null,
      showOption: false,
      notification: [],
      pool: [],
      markers: [],
      loaded: false,
      poolLoaded: false,
      is_updated: false,
      activeSlide: 0,
      notification: {},
      refreshing: false,
    }
    this.index = 0
    this.loadingMarkers = false
    this.animation = new Animated.Value(0)
  }

  _onRefresh = () => {
    this.setState({ refreshing: true })
    Promise.all([this.fetchPool(), this._getLocationAsync()]).then(() => {
      this.setState({ refreshing: false })
    })
  }

  componentDidMount() {
    this.updatePool = this.props.navigation.addListener('willFocus', payload => {
      // console.log("checking params", this.props.navigation.state.params);
      // console.log("top addlistener is called", payload.state);
      if (this.props.navigation.getParam('shouldUpdate', false)) {
        this.props.navigation.setParams({ shouldUpdate: false })
        console.log('we want to refetch to pool')
        this.setState({ poolLoaded: false })
        this.fetchPool()
      }
      // this.setState(
      //   { is_updated: this.props.navigation.getParam("shouldUpdate", false) },
      //   function() {this.props.navigation.setParams({shouldUpdate:false})}
      // );
    })
    // this.subscription = Notifications.addListener(this.handleNotification);
    this.somefunction()
    this.mountState = true
  }

  componentWillUnmount() {
    this.mountState = false
    if (this.location) {
      this.location.remove()
      this.location = null
    }
    if (this.updatePool) {
      this.updatePool.remove()
      this.updatePool = null
    }
  }

  // handleNotification = notification => {
  //   Alert.alert('title')
  //   console.log(notification)
  //   this.setState({
  //     notification:notification,
  //   });
  // }

  somefunction() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      if (this.mountState)
        this.setState({
          errorMessage:
            'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
        })
    } else {
      this._getLocationAsync()
      this.fetchPool()
    }
  }

  _getLocationAsync = async () => {
    // console.log('inside getlocationasync')
    //https://docs.expo.io/versions/v30.0.0/sdk/location
    let { status } = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      if (this.mountState)
        this.setState({
          errorMessage: 'Permission to access location was denied',
        })
    }
    this.location = await Location.watchPositionAsync(
      {
        enableHighAccuracy: false,
        // timeInterval: 60000,
        distanceInterval: 25,
      },
      this.locationChanged
    )
    //this.locationChanged is called on each location update;
  }

  locationChanged = async location => {
    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0025,
      longitudeDelta: 0.0025,
    }
    // console.log("region has been retrieved", region)
    if (!this.mountState) return
    let v0 = new Date().getTime()
    if (!this.loadingMarkers) {
      this.loadingMarkers = true
      this.fetchMarkerData(location)
        .then(markers => {
          // console.log('this is were venues are fetched', markers);
          if (markers === undefined) return []
          return Promise.all(
            markers.map((marker, index) => {
              return Fire.shared.getPlaceURI(marker.id, marker).then(uri => {
                if (uri) {
                  return {
                    id: marker.id,
                    uri: uri,
                    name: marker.name,
                    location: marker.location,
                    that: this,
                  }
                } else {
                  return this.fetchMarkerPhoto(marker.id).then(url => {
                    if (url) {
                      Fire.shared.addPlaceURI(marker.id, url)
                      return {
                        id: marker.id,
                        uri: url,
                        name: marker.name,
                        location: marker.location,
                        that: this,
                      }
                    } else {
                      return null
                    }
                  })
                }
              })
            })
          )
        })
        .then(markersInfo => {
          // console.log('we are at markersInfo', typeof markersInfo);
          markersInfo = markersInfo.filter(obj => obj)
          if (markersInfo.length === 0) {
            markersInfo = [
              {
                id: -1,
                uri:
                  'https://fastly.4sqi.net/img/general/original/12663058_yYaUf_8928od9lFGD3RJAipi1V76TuYJHSeQNONcmmA.jpg',
                name: 'No Place Around You Right Now',
                location: 'walk around or wait for a while',
                that: this,
              },
            ]
          }
          if (this.mountState)
            this.setState({
              location,
              region,
              markers: markersInfo,
            })
          this.loadingMarkers = false
          // console.log("total promise time", new Date().getTime() - v0);
        })
    }
  }

  async fetchPool() {
    // console.log('inside fetch pool')
    Fire.shared
      .getPersonalPool()
      .then(Data => {
        return Promise.all(
          Data.map((users, index) => {
            return Fire.shared.readUserAvatar(users.uid).then(uri => {
              if (uri) {
                return {
                  uid: users.uid,
                  uri: uri,
                  value: users.value,
                  name: users.name,
                }
              } else {
                console.log('URL fetching failed')
              }
            })
          })
        )
      })
      .then(updatedData => {
        if (updatedData) {
          // console.log("personalpool Data has been pulled", typeof updatedData);
          // let checkinSum = updatedData.reduce((prev,next) => prev + next.value,0);
          this.setState({ pool: updatedData, poolLoaded: true })
        } else {
          console.log('personalpool Data fetch has failed')
        }
      })
  }

  fetchMarkerData = async location => {
    /*Returns a list of recommended venues near the current location. For more robust information about the venues themselves (photos/tips/etc.), please see our venue details endpoint.
      If authenticated, the method will personalize the ranking based on you and your friends.
      Radius to search within, in meters. If radius is not specified, a suggested radius will be used based on the density of venues in the area. The maximum supported radius is currently 100,000 meters.
      */

    const channel = Math.floor(Math.random() * 7)
    this.Key = Object.values(JSON.parse(REACT_APP_FOURSQUARE_ID))[channel]
    this.Secret = Object.values(JSON.parse(REACT_APP_FOURSQUARE_SECRET))[channel]
    // console.log("channel", channel, this.Key, this.Secret)

    let fetchurl =
      'https://api.foursquare.com/v2/venues/search?client_id=' +
      this.Key +
      '&client_secret=' +
      this.Secret +
      '&v=20180323&radius=25&limit=6&ll=' +
      location.coords.latitude +
      ',' +
      location.coords.longitude
    // console.log('fetchurl: ', fetchurl)
    try {
      let response = await fetch(fetchurl)
      let data = await response.json()
      // console.log('AAAa',data.response.venues)
      return data.response.venues
      // return data.response.groups[0].items.map(item => item.venue)
      // the following code is for recommended search, research search in fetchurl with recommended return data.response.groups[0].items
    } catch (err) {
      console.log('Marker Data Fetching Failed')
      if (this.mountState)
        this.setState({
          errorMessage: err,
        })
    }
  }

  fetchMarkerPhoto = async ID => {
    let fetchurl =
      'https://api.foursquare.com/v2/venues/' +
      ID +
      '?client_id=' +
      this.Key +
      '&client_secret=' +
      this.Secret +
      '&v=20180323'
    try {
      let response = await fetch(fetchurl)
      let data = await response.json()
      // console.log("foursquare photo data: ", data.response.venue.bestPhoto);
      return (
        data.response.venue.bestPhoto.prefix + 'original' + data.response.venue.bestPhoto.suffix
      )
      // the following code is for recommended search, research search in fetchurl with recommended return data.response.groups[0].items
    } catch (err) {
      console.log('Marker Photo Failed')
      if (this.mountState)
        this.setState({
          errorMessage: err,
        })
    }
  }

  drawKiView() {
    // follows this tutorial:
    // https://www.youtube.com/watch?v=XATr_jdh-44
    if (this.mountState && this.state.poolLoaded) {
      // let friendSum = this.state.pool.reduce((prev,next) => prev + next.value,0);
      return (
        <View style={styles.kiContainer}>
          <RandomCircles pool={this.state.pool} navigation={this.props.navigation} />
        </View>
      )
    } else {
      // console.log('wait....');
      return <View style={styles.kiContainer} />
    }
  }

  drawMarkers() {
    if (this.mountState && this.state.markers.length) {
      return (
        <View>
          <Carousel
            data={this.state.markers}
            renderItem={this._renderItem}
            sliderWidth={CARD_WIDTH * 1.2}
            itemWidth={CARD_WIDTH}
            containerCustomStyle={styles.slider}
            contentContainerCustomStyle={styles.sliderContentContainer}
            onSnapToItem={index => {
              clearTimeout(this.regionTimeout)
              this.regionTimeout = setTimeout(() => {
                if (this.index !== index) {
                  this.index = index
                  const coordinate = {
                    latitude: this.state.markers[index].location.lat,
                    longitude: this.state.markers[index].location.lng,
                  }
                  this.map.animateToRegion(
                    {
                      ...coordinate,
                      latitudeDelta: 0.0025,
                      longitudeDelta: 0.0025,
                    },
                    350
                  )
                }
              }, 10)
              this.setState({
                activeSlide: index,
              })
            }}
            layout={'stack'}
            layoutCardOffset={`9`}
            // loop={true}
          />
          {this.pagination}
        </View>
      )
    } else {
      return null
    }
  }

  _renderItem({ item, index }) {
    // console.log(item);
    return (
      <TouchableWithoutFeedback
        key={index}
        onPress={() => {
          if (item.id !== -1) {
            item.that.setState({ showOption: false }, function() {
              item.that.props.navigation.navigate('CheckIn', {
                shouldUpdate: false,
                uri: item.uri,
                name: item.name,
                placeID: item.id,
                location: item.location.formattedAddress.slice(0, -1),
              })
            })
          }
        }}
      >
        <View style={styles.card}>
          <AsyncImageAnimated
            style={styles.cardImage}
            source={{
              uri: item.uri,
            }}
            placeholderColor="#cfd8dc"
            animationStyle="fade"
          />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']} style={styles.blurView} />
          <View style={styles.textContent}>
            <Text numberOfLines={1} style={styles.cardtitle}>
              {item.name}
            </Text>
            <Text numberOfLines={1} style={styles.cardDescription}>
              {item.id === -1 ? item.location : item.location.formattedAddress.slice(0, -1)}
            </Text>
          </View>
          {/* <View style={styles.handle} /> */}
        </View>
      </TouchableWithoutFeedback>
    )
  }

  get pagination() {
    const { markers, activeSlide } = this.state
    return (
      <Pagination
        dotsLength={markers.length}
        activeDotIndex={activeSlide}
        containerStyle={{ paddingVertical: 2, backgroundColor: 'rgba(0, 0, 0, 0)' }}
        dotContainerStyle={{ height: 12 }}
        dotStyle={{
          marginHorizontal: -4,
          paddingVertical: 0,
          backgroundColor: 'rgba(0, 0, 0, 1)',
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.4}
      />
    )
  }

  render() {
    return (
      // <ImageBackground
      //   style={{ width: '100%', height: '100%' }}
      //   source={require('../assets/images/particles.jpg')}
      // >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />
        }
      >
        {/* <View style={styles.container}> */}
        <Text style={styles.yourPoolText}> Your Pool</Text>
        <ScrollView horizontal contentOffset={{ x: 0.5 * width }} style={{ zIndex: 2 }}>
          {this.drawKiView()}
        </ScrollView>
        <View style={{ height: hRatio(349), width: width * 1.61 }}>
          <MapView
            ref={map => (this.map = map)}
            style={{ width: width * 1.61, height: hRatio(349), zIndex: 0 }}
            region={this.state.region}
            provider="google"
            showsUserLocation
            followsUserLocation
            showsBuildings
            showsIndoors
            showsIndoorLevelPicker
            rotateEnabled={false}
            scrollEnabled={false}
            pitchEnabled={false}
            loadingEnabled={true}
            onRegionChangeComplete={region => {
              this.setState({
                region: region,
              })
            }}
          >
            {this.state.markers.map(marker => (
              <Marker
                coordinate={{ latitude: marker.location.lat, longitude: marker.location.lng }}
                // title={marker.title}
                // description={marker.description}
              />
            ))}
          </MapView>
          <LinearGradient
            colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
            style={{ height: hRatio(108), width: width, zIndex: 1, position: 'absolute', top: 0 }}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
            style={{
              height: hRatio(108),
              width: width,
              zIndex: 1,
              position: 'absolute',
              bottom: 0,
            }}
          />
          <View style={styles.cardContainer}>{this.drawMarkers()}</View>
        </View>
        <Text style={styles.venuesText}> Venues</Text>

        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() => {
            this.setState({ showOption: false }, function() {
              this.props.navigation.navigate('Notification', {
                shouldUpdate: false,
              })
            })
          }}
        >
          <Image source={require('../assets/icons/notification.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.showOptionContainer}
          onPress={() => {
            this.setState({ showOption: !this.state.showOption })
          }}
        >
          <Image
            source={
              this.state.showOption
                ? require('../assets/icons/close.png')
                : require('../assets/icons/addTask.png')
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerContainer}
          onPress={() => {
            this.setState({ showOption: false }, function() {
              this.props.navigation.openDrawer()
            })
          }}
        >
          <Image source={require('../assets/icons/drawer.png')} />
        </TouchableOpacity>
        {this._renderOption()}
        {/* </View> */}
      </ScrollView>
      // </ImageBackground>
    )
  }

  _renderOption() {
    if (this.state.showOption) {
      return (
        <View style={styles.optionContainer}>
          {/* <ImageBackground style={styles.optionContainer} source={require('../assets/icons/optionContainer.png')}> */}
          <View
            style={
              {
                /*borderWidth: 1, borderColor: 'blue'*/
              }
            }
          >
            <TouchableOpacity
              style={{ paddingVertical: 10, zIndex: 10 }}
              onPress={() => {
                this.setState({ showOption: false }, function() {
                  this.props.navigation.navigate('CreateTask', {
                    shouldUpdate: false,
                    pool: this.state.pool,
                  })
                })
              }}
            >
              <Text style={styles.optionText}>Create Mission</Text>
            </TouchableOpacity>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                height: 1,
              }}
            />
            <TouchableOpacity
              style={{ paddingVertical: 10, zIndex: 10 }}
              onPress={() => {
                this.setState({ showOption: false }, function() {
                  this.props.navigation.navigate('QRScanner', {
                    shouldUpdate: false,
                  })
                })
              }}
            >
              <Text style={styles.optionText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else return null
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  notificationContainer: {
    // opacity: 0.5,
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
  showOptionContainer: {
    zIndex: 8,
    position: 'absolute',
    // opacity: 0.5,
    top: 60,
    right: 80,
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
  optionContainer: {
    zIndex: 9,
    position: 'absolute',
    // opacity: 0.75,
    top: 110,
    right: 30,
    width: 160,
    height: 90,
    borderRadius: 10,
    // borderWidth: 1,
    // borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  optionText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#313254',
    fontWeight: 'bold',
    fontFamily: 'GSB',
  },
  createTaskContainer: {
    position: 'absolute',
    top: 95,
    right: 65,
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
  yourPoolText: {
    zIndex: 3,
    marginTop: hRatio(121),
    fontSize: hRatio(36),
    fontFamily: 'GSB',
    marginLeft: wRatio(16),
  },
  venuesText: {
    zIndex: 3,
    marginTop: -hRatio(341),
    fontSize: hRatio(36),
    fontFamily: 'GSB',
    marginLeft: wRatio(16),
  },
  kiContainer: {
    // flex: 1,
    marginTop: hRatio(8),
    // marginLeft: -width * 0.5,
    height: hRatio(292),
    width: width * 2,
    // backgroundColor: 'transparent',
    overflow: 'visible',
  },
  itemContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
  },
  flexRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    // opacity: 0.5,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  scrollView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 0,
  },
  endPadding: {
    paddingLeft: (width - CARD_WIDTH) / 2,
    paddingRight: (width - CARD_WIDTH) / 2,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    // marginHorizontal: 2.5,
    // borderTopLeftRadius: 5,
    // borderTopRightRadius: 5,
    borderRadius: 5,
    shadowColor: '#000000',
    shadowRadius: 1.5,
    shadowOpacity: 0.1,
    shadowOffset: { x: 1, y: 1 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: 'hidden',
    zIndex: 5,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: 'cover',
  },
  handle: {
    position: 'absolute',
    top: 12,
    backgroundColor: '#D8D8D8',
    borderRadius: 2,
    width: 40,
    height: 4,
  },
  blurView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '50%',
  },
  textContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: (83 / 812) * height,
  },
  cardtitle: {
    marginLeft: 10,
    marginTop: 20,
    color: 'white',
    textAlign: 'left',
    fontFamily: 'GR',
    fontSize: (22 / 812) * height,
    fontWeight: 'bold',
  },
  cardDescription: {
    marginTop: 0,
    marginLeft: 10,
    textAlign: 'left',
    fontFamily: 'GR',
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.6,
  },
  markerWrap: {
    resizeMode: 'cover',
  },
  headerBackgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  cardContainer: {
    position: 'absolute',
    bottom: hRatio(47),
    left: -23,
    // backgroundColor: 'transparent',
  },
  slider: {
    // marginTop: 15,
    // overflow: 'visible' // for custom animations
  },
  sliderContentContainer: {
    // paddingVertical: 10 // for custom animation
  },
})
