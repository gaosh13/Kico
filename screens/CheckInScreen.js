import React from 'react';
import { ScrollView, FlatList, TouchableHighlight, StyleSheet, View, Text, Image, Button, TouchableOpacity, Dimensions } from 'react-native';
import { Constants ,Svg } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import ChangeScreen from './ChangeScreen.js';
import Fire from '../components/Fire';
import KiVisual from '../components/KiVisual';
import Canvas from 'react-native-canvas';
import AsyncImageAnimated from 'react-native-async-image-animated';
const { width, height } = Dimensions.get("window");



export default class CheckInScreen extends React.Component {
  static navigationOptions = ( {navigation} ) => {
    const { getParam } = navigation; 
    return {
      headerTitle: (
        <View style={styles.titleCenter}>
          <Text style={styles.titleText}>
            {getParam('name', 'Steven Ballmar Building')}
          </Text>
          {/*
          <TouchableOpacity style={styles.titleButton} onPress={getParam('jump', ()=>{})}>
            <Text style={styles.titleChangeText}>
              Change location
            </Text>
          </TouchableOpacity>
          */}
        </View>
      ),
    }
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
    if (this.state.pool.length){
      console.log('ZZZZZZZZ',this.state.sum);
      return (
        <View style={styles.kiContainer}>
          {KiVisual.shared.generateCircles(this.state.pool,this.state.sum,this.props.navigation)}
          
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
    const { navigate, getParam, pop } = this.props.navigation;
    const likes = 31, comments = 2;
    return (
      <ScrollView style={styles.container}>

        {this.drawKiView()}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => pop()}
            style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {this._collect(); this._put(); pop();}}
            style={styles.confirmButton}>
            <Text style={styles.confirmText}>Check In</Text>
          </TouchableOpacity>
        </View>

        { !this.state.description ? null:        
          (<View style={styles.descriptionContainer}>
            <Text style = {styles.generalText}>
              Suzzallo Library is the central library of the University of Washington in Seattle,
              and perhaps the most recognizable building on campus.
            </Text>
          </View>)
        }  

        <View style={styles.commentContainer}>
          <Ionicons name='ios-heart' size={20} color="#000"/>
          <Text style={styles.commentNumber}>&nbsp;{likes}&nbsp;&nbsp;&nbsp;</Text>
          <Ionicons name='ios-chatbubbles' size={20} color="#000"/>
          <Text style={styles.commentNumber}>&nbsp;{comments}</Text>
        </View>
        
        <View style={styles.imagePropmtContainer}>
          <Text style={styles.imagePropmtText}>
            Album of {getParam('name', 'Steven Ballmar Building')}
          </Text>
        </View>
        
        <View style={styles.imageContainer} contentContainerStyle={styles.endPadding}>
          <ScrollView horizontal={true}>
            {this.ImageSlide()}
            {this.ImageSlide()}
            {this.ImageSlide()}
          </ScrollView>
        </View>
       
        <FlatList
          data={this.state.pool}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderPool}
          style={styles.container}>
        </FlatList>
      </ScrollView>
    );
  }

  ImageSlide = (w,h) => {
    const { manifest } = Constants;
    const iconUrl = manifest.iconUrl;
    w = Number(w) || 128;
    h = Number(h) || 128;
    return (
      <Image
        source={{ uri: this.props.navigation.getParam("uri", iconUrl) }}
        style={{ width: w, height: h , marginLeft:5}}
        resizeMode="cover"
      />
    )
  }

  _keyExtractor = (item, index) => {return "pool" + index.toString()}

  _renderPool = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Image
            source={require("../assets/images/robot-dev.png")}
            style={{ width: 30, height: 30 }}
            resizeMode="cover"
          />
          <Text style={{fontSize: 18}}>{item.name}</Text>
        </View>

        <View style={styles.itemRight}>
          <Text style={{fontSize: 18, color: 'blue'}}>{item.value ? item.value.toString() : 0}</Text>
          {/* <Button title="Add Friend" onPress={() => {this.addFriend(item.uid)}}/> */}
        </View>
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
    width: width-30,
    height: width-30, 
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
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
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

});
