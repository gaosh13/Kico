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
  ImageBackground,
} from 'react-native';
import { WebBrowser,Constants,Location,Permissions,LinearGradient } from 'expo';
import Touchable from 'react-native-platform-touchable';
import { MonoText } from '../components/StyledText';
import { MapView, MapContainer } from "expo";
import { Ionicons } from '@expo/vector-icons';
import Fire from '../components/Fire';
import { REACT_APP_FOURSQUARE_ID, REACT_APP_FOURSQUARE_SECRET } from 'react-native-dotenv'
import AsyncImageAnimated from '../components/AsyncImageAnimated';
import {generateRandomCircles} from '../components/KiVisual';
import { BlurView, VibrancyView } from 'react-native-blur';

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = 212/812*height;
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
      pool:[],
      markers:[],
      loaded: false,
    };
    this.index = 0;
    this.loadingMarkers = false;
    this.animation = new Animated.Value(0);   
  }

  componentDidMount() {
    this.somefunction();
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
      this.fetchPool();
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
    let v0 = new Date().getTime();
    if (!this.loadingMarkers) {
      this.loadingMarkers = true;
      this.fetchMarkerData(location).then( (markers) => {
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
          this.setState({location,region,markers:markersInfo});
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


  async fetchPool() {
    Fire.shared.getPersonalPool().then( (Data) => {
        return Promise.all(Data.map( (users, index) => {
          return Fire.shared.readUserAvatar(users.uid).then( (uri) => {
            if (uri) {
              return {
                uid: users.uid,
                uri: uri,
                value:users.value,
                name: users.name,
              };
            } else {
              console.log('URL fetching failed')
                }
          });
        }))
    }).then( (updatedData)=>{
      if (updatedData) {
        console.log('personalpool Data has been pulled', updatedData);
        let checkinSum = updatedData.reduce((prev,next) => prev + next.value,0); 
        this.setState({pool: updatedData, sum: checkinSum});
      }else{
        console.log('personalpool Data fetch has failed');
      }
    })      
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

  drawKiView() {
// follows this tutorial:
// https://www.youtube.com/watch?v=XATr_jdh-44
    if (this.state.pool.length && this.mountState){
      // let friendSum = this.state.pool.reduce((prev,next) => prev + next.value,0);
      return (
        <View style={styles.kiContainer}>
          {generateRandomCircles(this.state.pool,this.state.sum,this.props.navigation)}      
        </View>
      );
    }else{
      // console.log('wait....');
      return (
        <View style={styles.kiContainer} />
      );
    }
  }

  render() {
    let stationaryurl = 'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';
    return (
      <View style={styles.container}>
          <View style={styles.particlesContainer}>
              {this.drawKiView()}
          </View>
          <ScrollView
            horizontal
            scrollEventThrottle={1}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH+5}
            style={styles.scrollView}
            contentContainerStyle={styles.endPadding}
            decelerationRate='fast'
          >
            {this.state.markers.map((marker, index) => (

              <TouchableOpacity key={index} onPress={
                () => this.props.navigation.navigate("CheckIn", {
                  uri: marker.uri,
                  name: marker.name,
                  placeID: marker.id,
                  location:marker.location.formattedAddress.slice(0,-1)
                })
              }>

                <View style={styles.card}>
                  <AsyncImageAnimated
                    style={styles.cardImage}
                    source={{
                      uri: marker.uri
                    }}
                    placeholderColor='#cfd8dc'
                    animationStyle='fade'
                    >
                  </AsyncImageAnimated>  
                  <LinearGradient colors={['rgba(0,0,0,0)','rgba(0,0,0,0.6)']} style={styles.blurView}/>
                  <View style={styles.textContent} >
                    <Text numberOfLines={1} style={styles.cardtitle}>
                      {marker.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.cardDescription}>
                      {marker.location.formattedAddress.slice(0,-1)}
                    </Text>
                  </View>
                  <View style={styles.handle}/> 
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={() => {this.props.navigation.navigate("Notification")}}>
            <Ionicons name='ios-notifications-outline' size={25} color="#000"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.scannerContainer}
            onPress={() => {this.props.navigation.navigate("QRScanner")}}>
            <Ionicons name='ios-add' size={25} color="#000"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.taskContainer}
            onPress={() => {this.props.navigation.navigate("JoinTask")}}>
            <Ionicons name='ios-add' size={25} color="#000"/>
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
    backgroundColor:'white'
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
  scannerContainer: {
    position: 'absolute',
    top: 60,
    right: 65,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  taskContainer:{
    position: 'absolute',
    top: 60,
    right: 100,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  particlesContainer:{
    marginTop : height/8,
    height: height*2/3,
    width: width,
  },
  kiContainer: {
    width: width,
    height: (1-212/height)*height+20, 
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
    paddingLeft: (width - CARD_WIDTH)/2,
    paddingRight: (width - CARD_WIDTH)/2,
  },
  card: {
    alignItems: 'center',
    elevation: 2,
    backgroundColor: "#FFF",
    marginHorizontal: 2.5,
    borderTopLeftRadius:5,
    borderTopRightRadius:5,
    shadowColor: "#000000",
    shadowRadius: 1.5,
    shadowOpacity: 0.1,
    shadowOffset: { x: 1, y: 1 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  handle:{
    position:"absolute",
    top:12,
    backgroundColor:"#D8D8D8",
    borderRadius:2,
    width:40,
    height:4,
  },
  blurView: {
    position:"absolute",
    bottom:0,
    left:0,
    width:'100%',
    height:'50%',
  },
  textContent: {
    position:"absolute",
    bottom:0,
    left:0,
    width:'100%',
    height:'40%',
  },
  cardtitle: {
    left:10,
    top:20,
    color:'white',
    textAlign: "left",
    fontFamily :"kontakt",
    fontSize: 18,
    marginTop: 12,
    fontWeight: "bold",
  },
  cardDescription: {
    top:20,
    left:10,
    textAlign: "left", 
    color:'#FFFFFF',
    fontSize: 14,
    opacity: 0.6
  },
  markerWrap: {
    resizeMode:"cover",
  },
  headerBackgroundImage: {
    flex:1,
    width: width, 
    height: height
  },
});

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
