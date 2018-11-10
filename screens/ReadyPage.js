import React from 'react';
import {  StyleSheet, View, Button, Text, Image, AsyncStorage,ImageBackground ,TouchableHighlight} from 'react-native';
import firebase from 'firebase';
import Fire from '../components/Fire';
import Login from '../screens/Login';
import AwesomeButtonRick from 'react-native-really-awesome-button';
import ButtonComponent, { CircleButton, RoundButton, RectangleButton } from 'react-native-button-component';

require('firebase/firestore');

export default class ReadyPage extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      FirebaseLoginStatus:true, name:"",photoUrl:"../assets/images/icon.png",loaded:false,
    };
    this.Logout=this.Logout.bind(this);
    this.mountState = false;
  }

  async componentDidMount() {
    this.mountState = true;
    await this.fetchdata();
  }

  componentWillUnmount() {
    this.mountState = false;
  }

  async fetchdata(){
    const uid = Fire.shared.uid;
    let data = await Fire.shared.readAuth();
    console.log('data received from firebase: ', data );
    const {name, photoURL} = data;
    if (this.mountState) this.setState({name: name, photoUrl: photoURL,});
  }

  Logout = async(props) =>{
    await firebase.auth().signOut()
    .then(function() {
      console.log('successfully logged out')
    }, function(error) {
        console.error('Sign Out Error', error);
    });
    props.navigation.navigate('Pre');
  }

  render() {
    return (
      <ImageBackground style={{width: '100%', height: '100%'}} source={require('../assets/images/load.gif')}>
      <View style={styles.container}>
          <Text style={styles.header}>Player </Text>
          <Text style={styles.back}>{"\n"}</Text>
          <Text style={styles.header}>{this.state.name}</Text>
          <Text style={styles.back}>{"\n"}</Text>
          <Image style={styles.image} source={{ uri: this.state.photoUrl }}/>
          <Text style={styles.back}>{"\n"}</Text>
          <AwesomeButtonRick type="primary" progress={true} height={50} onPress={() => this.props.navigation.navigate('PersonalDrawer')}>
            <Text style={styles.back}>{"Synchronize to Game"}</Text>
          </AwesomeButtonRick>
          <Text style={styles.back}>{"\n"}</Text>       
          <AwesomeButtonRick type="secondary" height={50} onPress={() => this.Logout(this.props)}>
            <Text style={styles.back}>{"Switch Account"}</Text>
          </AwesomeButtonRick> 
      </View>
      </ImageBackground>
      )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    fontFamily :"kontakt",
    fontSize: 30,
    color:"white",
    textAlign: "center",
    fontWeight: '300',
  },
  back: {
    fontFamily :"kontakt",
    fontSize: 10,
    color:"white",
    textAlign: "center",
    fontWeight: '100',
  },
  image: {
    marginTop: 35,
    marginBottom: 25,
    width: 150,
    height: 150,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 7,
    borderRadius: 75
  }
})