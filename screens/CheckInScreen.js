import React from 'react';
import { ScrollView, FlatList, TouchableHighlight, StyleSheet, View, Text, Image, Button, TouchableOpacity, Dimensions } from 'react-native';
import { Constants ,Svg } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import ChangeScreen from './ChangeScreen.js';
import Fire from '../components/Fire';
import {generateCirclesRow} from '../components/KiVisual';
import Canvas from 'react-native-canvas';
import AsyncImageAnimated from '../components/AsyncImageAnimated';
import GenericScreen from '../components/GenericScreen';
import AwesomeButton from 'react-native-really-awesome-button';


const { width, height } = Dimensions.get("window");



export default class CheckInScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      pool: [],
      sum: 1,
      loaded:false,
      circles:[],
    };
    // this.props.navigation.setParams({ jump: this._onPress });
    //this.fetchdata();
  }

  async componentDidMount() {
    await this.fetchdata();
   // await this.fetchVenueData();
  }

  async fetchdata() {
    Fire.shared.getPlacePool(this.props.navigation.getParam('placeID', '0')).then( (Data) => {
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
        //console.log('marker PlayerX Data has been pulled', updatedData);
        let checkinSum = updatedData.reduce((prev,next) => prev + next.value,0); 
        this.setState({pool: updatedData, sum: checkinSum});
      }else{
        console.log('marker PlayerX Data fetch has failed');
      }
    })      
  }  

  drawKiView(){
// follows this tutorial:
// https://www.youtube.com/watch?v=XATr_jdh-44
console.log(this.state.pool)
    if (this.state.pool.length){
      //console.log('ZZZZZZZZ',this.state.sum);
      return (
        <View style={styles.kiContainer}>
          {generateCirclesRow(this.state.pool)}          
        </View>
        )
    }else{
      console.log('wait....');
      return (
        <View style={styles.kiContainer} />
        )
    }
  }

  render() {
    const {getParam} = this.props.navigation;
    return (
      <View style={{flex:1}}>
        <GenericScreen
          source={getParam("uri") }
          name={getParam("name") }
          description={getParam("location")}>
          <Text style={styles.numberText}> {this.state.pool.length} </Text>
          <Text style={styles.descriptionText}> # of Ki </Text>   
          {this.drawKiView()}
          <View style={styles.buttonContainer}>
              <AwesomeButton
                common
                height={68/812*height}
                backgroundColor="#FFFFFF"
                borderRadius= {34/812*height}
                onPress={(next) => setTimeout(() => { next(console.log('finished')) }, 1000)}>
                <Text style={{fontSize:15, fontFamily:'GR', fontWeight:'bold'}}>{"Deposit Ki"}</Text>
              </AwesomeButton>
          </View>
        </GenericScreen>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {this.props.navigation.navigate("Home")}}>
          <Image source={require('../assets/icons/close2.png')} />
        </TouchableOpacity>
      </View>
    );
  }

  _collect = () => {
    const { getParam } = this.props.navigation;
    Fire.shared.mixPool(getParam('placeID', '0'), {description: getParam('name', '0')});
  }

  _put = () => {
    const { getParam } = this.props.navigation;
    Fire.shared.updateVisit(getParam('placeID', '0'), {description: getParam('name', '0')});
  }

  // _onPress = () => {
  //   this.props.navigation.navigate('Change', {callback: this.returnData.bind(this)});
  // }

  // returnData = (args) => {
  //   this.props.navigation.setParams({ name: args.Location });
  // }
}


const styles = StyleSheet.create({
  header: {
    fontFamily :"kontakt",
    fontSize: 30,
    color:"white",
    textAlign: "center",
    fontWeight: '900',
  },
  kiContainer: {
    width: width,
    height: 91/812*height,
    marginTop: 17/812*height, 
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
    justifyContent: 'space-evenly'

  },
  commentNumber: {
    fontFamily :"kontakt",
    fontSize: 15,
  },
  imagePropmtContainer: {
    marginBottom: 5,
  },
  imagePropmtText: {
    fontFamily :"kontakt",
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
    fontFamily :"kontakt",
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
    fontFamily :"kontakt",
    fontSize: 18,
    textAlign: 'center',
    color: '#fff'
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
    fontFamily :"kontakt",
    fontSize: 10,
    color: 'blue',
  },
  titleText: {
    fontFamily :"kontakt",
    fontSize: 18,
    fontWeight: 'bold',
  },
  generalText:{
    fontFamily :"kontakt",
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    backgroundColor:"#fff",
    opacity: .8,
  },
  buttonContainer:{
    alignItems:'center',
    marginTop:17/812*height,
    borderRadius:34/812*height,
    shadowOffset:{width:0,height:10},
    shadowRadius: 30,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity:0.2,
    paddingBottom:55
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
  descriptionText:{
    marginTop:4,
    color:'rgb(7,43,79)',
    opacity:0.5,
    textAlign: "center"
  }

});
