import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Constants ,Svg, LinearGradient } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { withNavigation, ScrollView } from 'react-navigation';
import { Text, TouchableOpacity,Image,View,Dimensions,StyleSheet } from 'react-native';
import AwesomeButton from 'react-native-really-awesome-button';


const { width, height } = Dimensions.get("window");

class GenericScreen extends Component {
  static propTypes = {
    //Source: PropTypes.string.isRequired}
    // textStyles: PropTypes.oneOfType([
    //   PropTypes.array,
    //   PropTypes.number,
    //   PropTypes.shape({}),
    // ]).isRequired,
    // buttonStyles: PropTypes.oneOfType([
    //   PropTypes.array,
    //   PropTypes.number,
    //   PropTypes.shape({}),
    // ]).isRequired,


  // static defaultProps = {
  //   onClose: null,
  //   onCancel: null,
  //   closeInterval: 4000,
  //   startDelta: -100,
  //   endDelta: 0,
  //   titleNumOfLines: 1,
  //   messageNumOfLines: 3,
  //   imageSrc: null
    }



  render = () => {
    const { source ,children , name, description, note,ki,friends} = this.props; 
    return (
    		<View style={styles.container}>
    			<View style={{ width: width, height: width/375*520}}>
  			    <Image
		          source={{
                uri: source
              }}
			        style={{ width: width, height: width/375*520}}
			        resizeMode="cover"
  			    />
  			    <LinearGradient colors={['rgba(0,0,0,0)','rgba(0,0,0,0.6)' ,'rgba(0,0,0,0.9)','rgba(0,0,0,1)','rgba(0,0,0,1)']} style={styles.blurView}/>
  			    <View style={styles.textContent} >
              <Text numberOfLines={1} style={styles.cardtitle}>
                {name}
              </Text>
              <Text numberOfLines={1} style={styles.cardDescription}>
                {description},{note}
              </Text>
            </View>
  		    </View>
		      <View style={styles.cardContainer}>
    			  {children}
  	  		</View>
  	  	</View>
    );
  }


}



const styles = StyleSheet.create({
  container:{
  	flex:1
  },
  cardContainer: {
    marginTop: -23,
    left: 0,
    right: 0,
    //height:315/812*height,
    backgroundColor:'#FFFFFF',
    borderTopLeftRadius:10,
    borderTopRightRadius:10,

  },
  blurView: {
    marginTop:400/812*height,
    left:0,
    width:'100%',
    height:120/812*height,
  },
  textContent: {
    alignItems:"center",
    marginTop:392/812*height,
    height:100/812*height,
    left:0,
    width:'100%',
    height:'25%',
  },
  cardtitle: {
  	marginTop:32,
    color:'#FFFFFF',
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
  },
  cardDescription: {
    marginTop:4,
    textAlign: "center",
    color:'#FFFFFF',
    opacity:0.6,
    fontSize: 14
  }
});


export default withNavigation(GenericScreen);