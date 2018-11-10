import React,{ Component } from 'react';
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
  FlatList,
  AppRegistry,
  Button,
} from 'react-native';
import { WebBrowser,Constants,Location,Permissions } from 'expo';
import Touchable from 'react-native-platform-touchable';
import { MonoText } from '../components/StyledText';
import { MapView, MapContainer } from "expo";
import { Ionicons } from '@expo/vector-icons';
import Fire from '../components/Fire';
import { REACT_APP_FOURSQUARE_ID, REACT_APP_FOURSQUARE_SECRET } from 'react-native-dotenv'
import AsyncImageAnimated from 'react-native-async-image-animated';

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 3;
const CARD_WIDTH = width / 1.1;

//https://codedaily.io/tutorials/9/Build-a-Map-with-Custom-Animated-Markers-and-Region-Focus-when-Content-is-Scrolled-in-React-Native


export default class HomeScreen extends React.Component {

  static navigationOptions = {
    header: null,
  };

  constructor(){
    super();
    this.mountState = false;
    this.location = null; 
    this.state = {
      location:{coords:{latitude:0,longitude:0}},
      errorMessage: null,
      showNotification: false,
      notification: [],
      markers:[],
      loaded: false,
    };
    this.index = 0;
    this.loadingMarkers = false;
    this.animation = new Animated.Value(0);
    this.somefunction();
  }

  componentDidMount() {
    this.mountState = true;
  }

  componentWillUnmount() {
    this.mountState = false;
    if (this.location) {
      this.location.remove();
      this.location = null;
    }
  }

  somefunction() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      if (this.mountState) this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      // We should detect when scrolling has stopped then animate
      // We should just debounce the event listener here
      this.animation.addListener(({ value }) => {
        let index = Math.floor(value / CARD_WIDTH +0.3); // animate 30% away from landing on the next item
        if (index >= this.state.markers.length) {
          index = this.state.markers.length - 1;
        }
        if (index <= 0) {
          index = 0;
        }

        clearTimeout(this.regionTimeout);
        this.regionTimeout = setTimeout(() => {
          if (this.index !== index) {
            this.index = index;
            const { coordinate } = this.state.markers[index];
          }
        }, 10);
      });

      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    //https://docs.expo.io/versions/v30.0.0/sdk/location
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      if (this.mountState) this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    this.location = await Location.watchPositionAsync({enableHighAccuracy: false, timeInterval: 60000, distanceInterval: 100},this.locationChanged)
    //this.locationChanged is called on each location update;
  };

  locationChanged = async (location) => {
    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.004,
      longitudeDelta: 0.002,
    };
    if (!this.mountState) return;
    this.setState({location, region});
    let v0 = new Date().getTime();
    if (!this.loadingMarkers) {
      this.loadingMarkers = true;
      this.fetchMarkerData(location).then( (markers) => {
        this.setState({
          markers: markers.map((marker)=>{return {id: marker.id, name: marker.name, location: marker.location}})
        });
        return Promise.all(markers.map( (marker, index) => {
          return Fire.shared.getPlaceURI(marker.id, marker).then( (uri) => {
            if (uri) {
              return {
                id: marker.id,
                uri: uri,
                name: marker.name,
                location: marker.location,
              }
            } else {
              return this.fetchMarkerPhoto(marker.id).then( (url) => {
                if (url) Fire.shared.addPlaceURI(marker.id, url);
                return {
                  id: marker.id,
                  uri: url,
                  name: marker.name,
                  location: marker.location,
                }
              });
            }
          });
        }));
      }).then( (markersInfo) => {
        if (this.mountState)
          this.setState({markers:markersInfo});
        this.loadingMarkers = false;
        console.log('total promise time', new Date().getTime() - v0);
      })
    }

    // let markers = await this.fetchMarkerData(location);
    // let markersInfo = [];
    // for (let index = 0; index < markers.length; ++index) {
    //   marker = markers[index];
    //   let uri = await Fire.shared.getPlaceURI(marker.id, marker);
    //   if (!uri) {
    //     let url = await this.fetchMarkerPhoto(marker.id);
    //     marker.uri=url;
    //     Fire.shared.addPlaceURI(marker.id, url);
    //   } else {
    //     marker.uri=uri;
    //   }
    //   markersInfo.push({
    //     id: marker.id,
    //     uri: marker.uri,
    //     name: marker.name,
    //     location: marker.location,
    //   });
    //   console.log('marker', marker.uri, marker.name);
    // }
    // this.setState({location,region,markers:markersInfo});
    // console.log('total promise time', new Date().getTime() - v0);
  }

  fetchMarkerData = async (location) => {
    /*Returns a list of recommended venues near the current location. For more robust information about the venues themselves (photos/tips/etc.), please see our venue details endpoint.
      If authenticated, the method will personalize the ranking based on you and your friends.
      Radius to search within, in meters. If radius is not specified, a suggested radius will be used based on the density of venues in the area. The maximum supported radius is currently 100,000 meters.
      */
    let fetchurl = "https://api.foursquare.com/v2/venues/search?client_id="+REACT_APP_FOURSQUARE_ID+"&client_secret="+REACT_APP_FOURSQUARE_SECRET+"&v=20180323&radius=250&limit=12&ll="+ location.coords.latitude +"," + location.coords.longitude ;
    try{  
      let response = await fetch(fetchurl);
      let data = await response.json();
      return data.response.venues
      // the following code is for recommended search, research search in fetchurl with recommended return data.response.groups[0].items      
    }catch(err){
      if (this.mountState) this.setState({
          errorMessage: err,
      });
    }
  }

  fetchMarkerPhoto = async (ID) =>{
    let fetchurl = "https://api.foursquare.com/v2/venues/"+ID+"?client_id="+REACT_APP_FOURSQUARE_ID+"&client_secret="+REACT_APP_FOURSQUARE_SECRET+"&v=20180323";
    try{
      let response = await fetch(fetchurl);
      let data = await response.json();
      console.log('foursquare photo data: ', data.response.venue.bestPhoto)
      return data.response.venue.bestPhoto.prefix + "original" + data.response.venue.bestPhoto.suffix
      // the following code is for recommended search, research search in fetchurl with recommended return data.response.groups[0].items      
    }catch(err){
      if (this.mountState) this.setState({
          errorMessage: err,
      });
    }
  }

  render() {
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }

    const interpolations = this.state.markers.map((marker, index) => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        ((index + 1) * CARD_WIDTH),
      ];
      const translate = this.animation.interpolate({
        inputRange,
        outputRange: [0, 1, 0],
        extrapolate: "clamp",
      });
      const scale = this.animation.interpolate({
        inputRange,
        outputRange: [1, 2, 1],
        extrapolate: "clamp",
      });
      const opacity = this.animation.interpolate({
        inputRange,
        outputRange: [0.35, 1, 0.35],
        extrapolate: "clamp",
      });
      return { scale, opacity };
    });

    let stationaryurl = 'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';

    return (
      <View style={styles.container}>
        <MapView
          style={styles.container}
          provider="google"
          ref={ref => { this.map = ref; if (ref) ref.animateToViewingAngle(90,0.1)}}
          showsUserLocation={true}
          //onRegionChange={this.onRegionChange.bind(this)}
          //onUserLocationChange ={changed => this.setUserLocation(changed.nativeEvent.coordinate)}
          //onUserLocationChange ={changed => console.log(changed.nativeEvent)}
          //followsUserLocation={true}
          zoomEnabled={false}
          rotateEnabled={true}
          scrollEnabled={false}
          pitchEnabled={true}
          customMapStyle = {mapStyle}
          region={this.state.region}
          //onPress={()=>this.animateToRandomViewingAngle()}
        >
          {this.state.markers.map((marker, index) => {
            const scaleStyle = {
              transform: ([
                  {
                    scale: interpolations[index].scale,
                   // translateY: interpolations[index].translate,
                },
              ]),
            };
            const translateStyle = {
              transform: [
                  {
                    translateY: interpolations[index].translate,
                },
              ],
            };
            const opacityStyle = {
              opacity: interpolations[index].opacity,
            };
            const coords = {
                latitude: marker.location.lat,
                longitude: marker.location.lng,
            };
            const metadata = `Status: ${marker.id}`;
            
            return (
              <MapView.Marker key={index} coordinate={coords}>
                <Animated.Image
                  style={[styles.markerWrap, opacityStyle, scaleStyle]}
                  resizeMode={'cover'}
                  source={require('../assets/images/humanPin.png')}/>
              </MapView.Marker>
            );
          })}
        </MapView>
        <Animated.ScrollView
          horizontal
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: this.animation,
                  },
                },
              },
            ],
            { useNativeDriver: true }
          )}
          style={styles.scrollView}
          contentContainerStyle={styles.endPadding}
        >
          {this.state.markers.map((marker, index) => (
            <TouchableOpacity key={index} onPress={
              () => this.props.navigation.navigate("CheckIn", {
                uri: marker.uri,
                name: marker.name,
                placeID: marker.id,
              })
            }>
              <View style={styles.card}>
                <View style={styles.textContent}>
                  <Text numberOfLines={1} style={styles.cardtitle}>
                    {marker.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.cardDescription}>
                    {marker.location.formattedAddress.slice(0,-1)}
                  </Text>
                </View>
                <AsyncImageAnimated
                  style={styles.cardImage}
                  source={{
                    uri: marker.uri
                  }}
                  placeholderColor='#cfd8dc'/>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() => {this.props.navigation.navigate("Notification")}}>
          <Ionicons name='ios-notifications-outline' size={25} color="#000"/>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerContainer}
          onPress={() => {this.props.navigation.openDrawer()}}>
          <Ionicons name='ios-menu' size={25} color="#000"/>
        </TouchableOpacity>
        {this._renderList()}
      </View>
    );
  }

  _showNotification = async() => {
    let newState = {showNotification: !this.state.showNotification};
    if (!this.state.showNotification) {
      let data = await Fire.shared.getNotification();
      console.log("notification", data);
      newState.notification = data;
    }
    this.setState(newState);
  }

  _renderList() {
    if (this.state.showNotification) {
      return (
        <FlatList
          style={styles.notificationList}
          data={this.state.notification}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}>
        </FlatList>
      );
    } else {
      return null;
    }
  }

  _keyExtractor = (item, index) => {return "notification" + index}

  _renderItem = ({item}) => {
    let displayText = '';
    if (item.type == 'confirm') {
      displayText = `${item.name} is now your friend`;
    } else if (item.type == 'request') {
      displayText = `${item.name} wants to be your friend`;
    } else if (item.type == 'remove') {
      displayText = `${item.name} is no longer your friend`;
    }
    return (
      <View style={styles.itemContainer}>
        <View style={styles.flexRowContainer}>
          <Ionicons name='ios-information-circle' size={25} color="blue"/>
          <Text style={{marginLeft: 15, fontSize: 18}}>{displayText}</Text>
        </View>
        {
          item.type == 'request' ? (
            <View style={styles.flexRowContainer}>
              <Button title="Confirm" onPress={()=>{this._confirmFriend(item.uid); this._removeNotification(item.id);}} />
              <Button title="Reject" onPress={()=>{this._removeNotification(item.id)}} />
            </View>
          )
          : item.type == 'confirm' ?
          (
            <View style={styles.flexRowContainer}>
              <Button title="Got it" onPress={()=>{this._confirmFriend(item.uid, 'confirm'); this._removeNotification(item.id)}} />
            </View>
          )
          : item.type == 'remove' ?
          (
            <View style={styles.flexRowContainer}>
              <Button title="So sad" onPress={()=>{this._removeFriend(item.uid); this._removeNotification(item.id)}} />
            </View>
          )
          : (null)
        }
      </View>
    );
  }

  _confirmFriend = (uid, type='request') => {
    Fire.shared.confirmFriend(uid, {tag: 'friend'});
    if (type == 'request')
      Fire.shared.addFriend(uid, 'confirm');
  }

  _removeFriend = (uid) => {
    Fire.shared.removeFriend(uid, 'passive');
  }

  _removeNotification = async (id) => {
    await Fire.shared.removeNotification(id);
    let data = await Fire.shared.getNotification();
    this.setState({notification: data});
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
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
    alignItems:'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  notificationList: {
    position: 'absolute',
    top: 100,
    marginLeft: '10%',
    marginRight: '10%',
    width: '80%',
    backgroundColor: '#ffffffa0',
    padding: 10,
  },
  scrollView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 0,
  },
  endPadding: {
    paddingRight: width - CARD_WIDTH,
  },
  card: {
    padding: 1,
    elevation: 2,
    backgroundColor: "#FFF",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  textContent: {
    flex: 1,
  },
  cardtitle: {
    textAlign: "center",
    fontFamily :"kontakt",
    fontSize: 12,
    marginTop: 12,
    fontWeight: "bold",
  },
  cardDescription: {
    textAlign: "center",   
    fontFamily :"mylodon-light",
    fontSize: 12,
    color: "#444",
  },
  markerWrap: {
    resizeMode:"cover",
  }
});

AppRegistry.registerComponent("mapfocus", () => screens);

mapStyle =[
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8ec3b9"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1a3646"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#64779e"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#334e87"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6f9ba5"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3C7680"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#304a7d"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2c6675"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#255763"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#b0d5ce"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3a4762"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0e1626"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4e6d70"
      }
    ]
  }
]
