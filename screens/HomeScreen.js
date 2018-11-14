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
import {RandomCircles} from '../components/KiVisual';
import { BlurView, VibrancyView } from 'react-native-blur';
import ActionButton from 'react-native-action-button';
import DateTimePicker from 'react-native-modal-datetime-picker';

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
      showOption: false,
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
                if (url) {
                  Fire.shared.addPlaceURI(marker.id, url);
                  return {
                    id: marker.id,
                    uri: url,
                    name: marker.name,
                    location: marker.location,
                  }
                }else{
                  return null;
                }
              });
            }
          });
        }));
      }).then( (markersInfo) => {
        if (this.mountState)
          this.setState({location,region,markers:markersInfo.filter((obj)=>obj)});
        this.loadingMarkers = false;
        console.log('total promise time', new Date().getTime() - v0);
      })
    }
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
      console.log('Marker Data Fetching Failed');
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
      console.log('Marker Photo Failed');
      if (this.mountState) this.setState({
          errorMessage: err,
      });
    }
  }

  drawKiView() {
// follows this tutorial:
// https://www.youtube.com/watch?v=XATr_jdh-44
    if (this.mountState){
      // let friendSum = this.state.pool.reduce((prev,next) => prev + next.value,0);
      return (
        <View style={styles.kiContainer}>
          <RandomCircles pool={this.state.pool} navigation={this.props.navigation}/>
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
                  <LinearGradient colors={['rgba(0,0,0,0)','rgba(0,0,0,1)']} style={styles.blurView}/>
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
            <Image source={require('../assets/icons/notification.png')} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.showOptionContainer}
            onPress={() => {this.setState({showOption: !this.state.showOption})}}>
            <Image source={this.state.showOption ? require( '../assets/icons/close2.png') : require('../assets/icons/addTask.png')} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.congratsContainer}
            onPress={() => {this.props.navigation.navigate("Congrats")}}>
            <Image source={require('../assets/icons/drawer.png')} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerContainer}
            onPress={() => {this.props.navigation.openDrawer()}}>
            <Image source={require('../assets/icons/drawer.png')} />
          </TouchableOpacity>
          {this._renderOption()}
      </View>
    );
  }

  _renderOption() {
    if (this.state.showOption) {
      return (
        <ImageBackground style={styles.optionContainer} source={require('../assets/images/PlayerX_logo.png')}>
          <View style={{/*borderWidth: 1, borderColor: 'blue'*/}}>
            <TouchableOpacity
              style={{paddingVertical: 10}}
              onPress={() => {this.props.navigation.navigate("CreateTask",{
                pool:this.state.pool
              })}}>
              <Text style={styles.optionText}>Create Task</Text>
            </TouchableOpacity>
            <View style={{borderBottomWidth: 1, borderBottomColor: '#ccc', height: 1}}></View>
            <TouchableOpacity
              style={{paddingVertical: 10}}
              onPress={() => {this.props.navigation.navigate("QRScanner")}}>
              <Text style={styles.optionText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    } else return null;
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
    backgroundColor: '#fff',
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  showOptionContainer: {
    position: 'absolute',
    top: 60,
    right: 80,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    backgroundColor: '#fff',
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  congratsContainer:{
    position: 'absolute',
    top: 100,
    right: 100,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  optionContainer:{
    position: 'absolute',
    top: 110,
    right: 30,
    width: 160,
    height: 90,
    // borderWidth: 1,
    // borderRadius: 10,
    justifyContent: 'flex-end',
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    shadowColor: "#000000",
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
  createTaskContainer:{
    position: 'absolute',
    top: 95,
    right: 65,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    backgroundColor: '#fff',
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
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
    backgroundColor: '#fff',
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
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
    height:83/812*height,
  },
  cardtitle: {
    marginLeft:10,
    marginTop:20,
    color:'white',
    textAlign: "left",
    fontFamily:"GSB",
    fontSize: 24/812*height,
    fontWeight: "bold",
  },
  cardDescription: {
    marginTop:0,
    marginLeft:10,
    textAlign: "left", 
    fontFamily:"GR",
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