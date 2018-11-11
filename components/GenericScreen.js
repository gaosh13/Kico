import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Constants ,Svg, LinearGradient } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';
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
    const { source ,children , venueName, venueLocation} = this.props; 
    return (
		<View style={styles.container}>
			<View style={{ width: width, height: width/375*574}}>
			    <Image
			        source={{
                      uri: source
                    }}
			        style={{ width: width, height: width/375*574}}
			        resizeMode="cover"
			    />
			    <LinearGradient colors={['rgba(0,0,0,0)','rgba(0,0,0,0.6)' ,'rgba(0,0,0,0.9)','rgba(0,0,0,1)','rgba(0,0,0,1)']} style={styles.blurView}/>
			    <View style={styles.textContent} >
                    <Text numberOfLines={1} style={styles.cardtitle}>
                      {venueName}
                    </Text>
                    <Text numberOfLines={1} style={styles.cardDescription}>
                      {venueLocation}
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


// background: #FFFFFF;
// box-shadow: 0 10px 30px 0 rgba(0,0,0,0.20);
// font-family: .AppleSystemUIFont;
// font-size: 15px;
// color: #072B4F;
// letter-spacing: 0;
// text-align: center;


const styles = StyleSheet.create({
  container:{
  	flex:1
  },
  cardContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height:315/812*height,
    backgroundColor:'#FFFFFF',
    borderTopLeftRadius:10,
    borderTopRightRadius:10,

  },
  blurView: {
    position:"absolute",
    bottom:0,
    left:0,
    width:'100%',
    height:270/812*height,
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
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems:'center',
    borderWidth: 1.5,
    borderColor: '#000',
    // backgroundColor: '#fff',
  },
});


export default withNavigation(GenericScreen);