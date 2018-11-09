import React from 'react';
import { ScrollView, StyleSheet, View, Button, Text, Image, AsyncStorage } from 'react-native';
import Login from './Login';
import Touchable from 'react-native-platform-touchable';
import * as firebase from 'firebase';

export default class SettingsScreen extends React.Component {
  static navigationOptions = ( {navigation} ) => {
    return {
      title: "Settings",
      headerLeft: (
        <Button
          onPress={() => navigation.openDrawer()}
          title="Menu"
          color="#222"
        />
      ),
    }
  };


  render() {
    return (
      <View style={styles.container}>
      		<Button title="Logout" 
	       		//onPress={this._Logout}
	       		onPress={() => this.Logout()}/>
      </View>
    );
  }


  Logout = async() =>{
	console.log('logging out');
	await firebase.auth().signOut()
	.then(function() {
		console.log('successfully logged out')
	}, function(error) {
  		console.error('Sign Out Error', error);
	});
	return (this.props.navigation.navigate('Pre')) ;
	
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    fontSize: 25,
    textAlign: "center",
  },
  image: {
    marginTop: 15,
    width: 150,
    height: 150,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 3,
    borderRadius: 150
  }
})
