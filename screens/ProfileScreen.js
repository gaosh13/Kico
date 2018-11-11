import React from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TextInput,
  Platform,
  Icon,
  ImageBackground,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  TabViewAnimated,
  TabBar,
  TabViewPagerScroll,
  TabViewPagerPan,
} from 'react-native-tab-view'
import Fire from '../components/Fire';
import { Ionicons } from '@expo/vector-icons';
import KiVisual from '../components/KiVisual';
import AwesomeButton from 'react-native-really-awesome-button';
import GenericScreen from '../components/GenericScreen';

const isOdd=require('is-odd')
const { width, height } = Dimensions.get("window");
const sum=7;

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: 'Player',
      gender: 'undefined',
      age: '18',
      ki: undefined,
      friendsLoaded: false,
      photoUrl: '../assets/images/icon.png',
      pool:[],
      friends:null,
    };
  }

  async componentDidMount() {
    await this.fetchdata();
  }

  async fetchdata(){
    let data = await Fire.shared.readInfo();
    let moredata = await Fire.shared.readAuth();
    let frienddata = await Fire.shared.getFriends();
    if (data && moredata && frienddata) {
      const {name, gender, age, ki} = data;
      const {photoURL} = moredata;
      this.setState({name: name, gender: gender, friends: frienddata.length, age: age.toString(),ki: ki,photoUrl: photoURL});
    }
  }

  drawKiLog() {
    return(
      <View>
        <View style={styles.kiLogContainer}>
          <Text style={styles.kiLogText}>Ki Log</Text>
        </View>
        {this.drawNode_odd()}
        {this.drawNode_even()}
        {this.drawNode_odd()}
        {this.drawNode_even()}
        {this.drawNode_odd()}
        {this.drawNode_even()}
        {this.drawNode_odd()}
        {this.drawNode_even()}
      </View>

    )
  }

  drawNode(){
    for (var i = 0; i <= sum; i++) {
      if (isOdd) {
        this.drawNode_odd();
      } else {
        this.drawNode_even();
      }
    }
  }

  drawNode_odd(){
    return(
      <View style={{flexDirection:'row',justifyContent: 'space-evenly', height:104}}>
        <Image style = {styles.checkInImage} source={require('../assets/images/PlayerX_logo.png')}/>
        <View style={{alignItems:'center'}}>
          <View style={styles.bar}/>
          <View style={styles.outerCircle}/>
          <View style={styles.innerCircle}/>
        </View>
        <View>
          <Text style={styles.venueNameText_odd}> Suzzalo Library </Text>
          <Text style={styles.venueTimeText_odd}> 9/30/2018 </Text> 
        </View>
      </View>
    )
  }

  drawNode_even(){
    return(
      <View style={{flexDirection:'row',justifyContent: 'space-evenly', height:104}}>
        <View>
          <Text style={styles.venueNameText_even}> Suzzalo Library </Text>
          <Text style={styles.venueTimeText_even}> 9/30/2018 </Text> 
        </View>        
        <View style={{alignItems:'center'}}>
          <View style={styles.bar}/>
          <View style={styles.outerCircle}/>
          <View style={styles.innerCircle}/>
        </View>
        <Image style = {styles.checkInImage} source={require('../assets/images/PlayerX_logo.png')}/>
      </View>
    )
  }

  render() {
    return (
      <ScrollView 
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      snapToInterval={104/812*height}
      decelerationRate='fast'>
        <View>
          <GenericScreen
            source={this.state.photoUrl}
            name={this.state.name}
            description={this.state.gender}
            note={this.state.age}
            friends={this.state.friends}
            ki={this.state.ki}>
            <View style={{flexDirection:'row',justifyContent: 'space-evenly'}}>
              <View>
                <Text style={styles.numberText}> {this.state.friends} </Text>
                <Text style={styles.descriptionText}> # of Friends </Text> 
              </View>
              <View>
                <Text style={styles.numberText}> {this.state.ki}/300 </Text>
                <Text style={styles.descriptionText}> # of Ki Left</Text> 
              </View>
              <View>
                <Text style={styles.numberText}> 25 </Text>
                <Text style={styles.descriptionText}> # of CheckIns </Text> 
              </View>
            </View>
            {this.drawKiLog()}  
          </GenericScreen>
          <TouchableOpacity
            style={styles.closeButtonContainer}
            onPress={() => {this.props.navigation.navigate("Home")}}>
            <Ionicons name='ios-close' size={25} color="#000"/>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}


// opacity: 0.2;
// background: #0B9AF5;
// background: #0B9AF5;

// background: #0B9AF5;

const styles = StyleSheet.create({
  kiLogContainer:{
    width: width,
  },
  kiLogText:{
    color:'black',
    textAlign: "left",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 25/812*height,
    marginLeft: 25/812*height,
    marginBottom:25/812*height,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    borderWidth: 0.5,
    borderColor: '#000',
    backgroundColor:"#fff",
    // backgroundColor: '#fff',
  },
  bar:{
    width:8,
    height:104,
    backgroundColor:'#EEEEEE',
  },
  outerCircle:{
    width:18,
    height:18,
    borderRadius:9,
    backgroundColor:'#0B9AF5',
    opacity:0.2,
    position:'absolute',
    top:43,
  },
  innerCircle:{
    width:14,
    height:14,
    borderRadius:7,
    backgroundColor:'#0B9AF5',
    position:'absolute',
    top:45,
  },
  buttonContainer:{
    position:"absolute",
    left:84/812*height,
    bottom:55/812*height,
    borderRadius:34/812*height,
    shadowOffset:{width:0,height:10},
    shadowRadius: 30,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity:0.2,
  },
  textContent: {
    position:"absolute",
    alignItems:"center",
    bottom:50/812*height,
    height:100/812*height,
    left:0,
    width:'100%',
    height:'25%',
  },
  numberText:{
    fontSize:15,
    color:'rgb(7,43,79)',
    textAlign: "center",
    marginTop:25,
  },
  checkInImage:{
    height:68,
    width:114,
    borderRadius:15,
    shadowOffset:{width:0,height:10},
    shadowRadius: 10,
    shadowColor: "rgb(0,0,0)",
    shadowOpacity:0.2,
    marginVertical:18
  },
  venueNameText_odd:{
    fontSize:14,
    color:'rgb(7,43,79)',
    textAlign: "left",
    marginTop:34.5,
    fontWeight:'bold',
  },
  venueTimeText_odd:{
    marginTop:5,
    marginBottom:34.5,
    fontSize:12,
    color:'rgb(7,43,79)',
    textAlign: "right"
  },
  venueNameText_even:{
    fontSize:14,
    color:'rgb(7,43,79)',
    textAlign: "left",
    marginTop:34.5,
    fontWeight:'bold',
  },
  venueTimeText_even:{
    marginTop:5,
    marginBottom:34.5,
    fontSize:12,
    color:'rgb(7,43,79)',
    textAlign: "right"
  },
  descriptionText:{
    marginTop:4,
    color:'rgb(7,43,79)',
    opacity:0.5,
    textAlign: "center",
  },
  kiContainer: {
    width: width,
    position:"absolute",
    bottom: 140/812*height, 
  },
});
