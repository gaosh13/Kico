import React from 'react';
//import ReadyPage from '../screens/ReadyPage';
import ReadyPage from '../screens/ReadyPage';
import {  StyleSheet, View, Button, Text, Image, AsyncStorage,ImageBackground ,TouchableHighlight} from 'react-native';
import * as firebase from 'firebase';

import Fire from '../components/Fire';

//https://medium.com/@chrisbianca/getting-started-with-firebase-authentication-on-react-native-a1ed3d2d6d91

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {signedIn: false, name: "", photoUrl: "", userid:"",method:""}
    this.mountedState = false;
  }


  //Add a check if the login was successful and if it was, set the state accordingly. 
  GooglesignIn = async () => {
    try {
      const result = await Expo.Google.logInAsync({
        iosClientId: "170596970815-ahntllu95qsbqmf4kbjqia19momth7no.apps.googleusercontent.com",
        //iandriodClientId: YOUR_CLIENT_ID_HERE,  <-- if you use android
        scopes: ["profile", "email"]
      })
      if (result.type === "success") {
        const { idToken, accessToken } = result;
        const credential = await firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
        await firebase.auth().signInAndRetrieveDataWithCredential(credential);
        console.log('google signed in, userID: ', Fire.shared.uid);
        await this.upload(result.user.name,result.user.photoUrl,result.user.id,'google');
        await console.log('firebase has been updated');
        if (this.mountedState) this.setState({
          signedIn: true,
        })
     } else {
        console.log("cancelled")
      }
    } catch (e) {
      console.log("error", e)
    }

  }

  async upload(name,photoUrl,userid,method){
    var docData = {
      name:name,
      photoUrl:photoUrl,
      userid:userid,
      method: method
    }
    await Fire.shared.setAuth(docData);
    await Fire.shared.setInfo(docData);
  }

  FacebooksignIn = async () => {

    try {
      const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync('264052254250223', {
          permissions: ['public_profile'],
        });
      if (type === 'success') {
          // Build Firebase credential with the Facebook access token.
          const credential = await firebase.auth.FacebookAuthProvider.credential(token);
          // Sign in with credential from the Facebook user.
          await firebase.auth().signInAndRetrieveDataWithCredential(credential).catch((error) => {
            console.log('error');
          });
          // Get the user's name using Facebook's Graph API
          const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,picture.type(large)`);
          const { picture, name, id } = await response.json();
          console.log('facebook signed in, userID: ', Fire.shared.uid);
          await this.upload(name,picture.data.url,id,'facebook');
          await console.log('firebase has been updated'); 
          if (this.mountedState) this.setState({
            signedIn: true,
          })   
      } else {
          console.log("cancelled")
          }
    } catch (e) {
        console.log("error", e)
      }
    }

  //renders either LoggedInPage or LoginPage component depending on if we set the signedIn state to true or false
  render() {
    return (
        <ImageBackground style={{width: '100%', height: '100%'}} source={require('../assets/images/load.gif')}>
          <View style={styles.container}>
            {this.state.signedIn ? (
              <ReadyPage state={this.state} navigation={this.props.navigation}/>
            ) : (
              <LoginPage GsignIn={this.GooglesignIn} FsignIn={this.FacebooksignIn}/>
            )}
          </View>
       </ImageBackground>
      )
    }

  componentDidMount() {
    this.mountedState = true;
  }
  componentWillUnmount() {
    this.mountedState = false;
  }
}


//Create the stateless component LoginPage that we will display if the user is not signed in.
const LoginPage = (props) => {
  return (
    <View>
      <Text style={styles.header}>WELCOME{"\n"}</Text>
      <Text style={styles.h3}>You are about to enter a world without the surveillance of Malexa. The future of humans is now in your hands{"\n"}</Text>
      <View style={{marginTop:75}} />
      <FaceBookSignInButton
      onPress={async() => await props.FsignIn()} />
      <View style={{marginTop:10}} />
      <GoogleSignInButton
      onPress={async() => await props.GsignIn()} />
    </View>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    fontFamily :"GSB",
    fontSize: 40,
    color:"white",
    textAlign: "center",
  },
  h3: {
    fontFamily :"GR",
    fontSize: 14,
    color:"white",
    textAlign: "center",
  },
  back: {
    fontFamily :"GR",
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