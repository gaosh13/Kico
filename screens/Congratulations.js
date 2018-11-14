import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Button,Dimensions } from 'react-native';
import { WebBrowser, Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';
import AsyncImageAnimated from '../components/AsyncImageAnimated';
import AwesomeButton from 'react-native-really-awesome-button';
import {
  Menu,
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

const { width, height } = Dimensions.get("window");

const hRatio = (value) => {
  return value /812*height;
}

const wRatio = (value) => {
  return value /375*width;
}

export default class Congratulations extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      item: "MewTwo",
      uri: "https://lh3.googleusercontent.com/-FNeWVeNRqTo/AAAAAAAAAAI/AAAAAAAAAA0/qHilVKwlKbI/photo.jpg",
      friendmode:true,
    };
  }

  async componentDidMount() {
    // const uid = this.props.navigation.getParam('uid', '0');
//    let uid = null;
    if(this.props.navigation.getParam('uid')){
      let uid = this.props.navigation.getParam('uid');
      Fire.shared.getNameNAvatar(uid).then( (data) => {
      //console.log(data);
      this.setState({name:data.name,uri:data.uri,friendmode:true});
    });
    }if(this.props.navigation.getParam('where')){
      Fire.shared.getPlaceInfo(this.props.navigation.getParam('where')).then((data)=>{
      this.setState({item:this.props.navigation.getParam('what')+'@'+data.description,uri:data.uri,friendmode:false});
    })
    }else{
      console.log('somedata has not been passing correctly')
    }

  }

  textOption(){
    if(this.state.friendmode){
      console.log('LAAAAAA')
      return (
        <Text style={styles.normalText}>{this.state.item} is now your connection!</Text>
      )
    }else{
      return (
        <View style={{alignItems:'center'}}>
          <Text style={styles.normalText}>{this.state.item}</Text>
          <Text style={styles.normalText}>your task is created!</Text>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{marginTop:hRatio(258),alignItems:'center',flex:1}}>
          <AsyncImageAnimated
            style={styles.userImage}
            source={{
              uri: this.state.uri
            }}
            placeholderColor='transparent'
            animationStyle='fade'/>
          <Text style={styles.titleText}>Congratulations!</Text>
          {this.textOption()}
        </View>
        <View style={styles.buttonContainer}>
         <AwesomeButton
            // progress
            height={68/812*height}
            backgroundColor="#FFFFFF"
            borderRadius= {34/812*height}
            onPress={(next) => {
              this.props.navigation.navigate('Home');
              next();
            }}>
            <Text style={{fontSize:15, fontFamily:'GR', fontWeight:'bold'}}>Confirm</Text>
          </AwesomeButton>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingTop: 15,
    alignItems:'center',
    backgroundColor: '#fff',
  },
  userImage: {
    borderRadius: wRatio(84),
    height: wRatio(168),
    width: wRatio(168),
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  titleText:{
    marginTop: hRatio(47),
    fontFamily: 'GSB',
    fontSize: 32,
    color:'rgb(7,43,79)'
  },
  normalText:{
    marginTop:hRatio(9),
    fontFamily:'GR',
    fontSize:14,
    color:'rgb(7,43,79)',
    opacity:0.6
  },
  buttonContainer:{
    marginBottom:hRatio(50),
    alignItems:'center',
    borderRadius:34/812*height,
    shadowOffset:{width:0,height:10},
    shadowRadius: 30,
    shadowColor: "rgba(0,0,0,1)",
    shadowOpacity:0.2,
  },
});
