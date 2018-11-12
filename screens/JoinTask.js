import React from 'react';
import { ScrollView, FlatList, TouchableHighlight, StyleSheet, View, Text, Image, Button, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Fire from '../components/Fire';
import {generateCirclesRow} from '../components/KiVisual';
import AsyncImageAnimated from '../components/AsyncImageAnimated';
import GenericScreen from '../components/GenericScreen';
import AwesomeButton from 'react-native-really-awesome-button';
import QRCode from 'react-native-qrcode';

const { width, height } = Dimensions.get("window");

export default class CheckInScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      pool: [],
      where: '',
      what: '',
      when: '',
      isGoing: false,
    };
  }

  async componentDidMount() {
    await this.fetchdata();
  }

  async fetchdata() {
    const task = this.props.navigation.getParam('task', '0');
    // console.log("begin fetching");
    // console.log("task", task);
    Fire.shared.getTaskInfo(task).then( (taskInfo) => {
      const {users:pool, where, what, when, isGoing} = taskInfo;
      this.setState({pool, where, what, when, isGoing});
    });
  }  

  drawKiView() {
    if (this.state.pool.length){
      return (
        <View style={styles.kiContainer}>
          {generateCirclesRow(this.state.pool)}          
        </View>
      )
    } else{
      return (
        <View style={styles.kiContainer} />
      )
    }
  }

  _generateQRCode() {
    const task = this.props.navigation.getParam('task', '0');
    return JSON.stringify({"uid": Fire.shared.uid, "task": task});
  }

  _renderQRCode() {
    if (this.state.isGoing) {
      return (
        <View style={{paddingTop: 20, paddingBottom: 20}}>
          <QRCode
            value={this._generateQRCode()}
            size={200}
            bgColor='black'
            fgColor='white'/>
        </View>
      );
    } else return null;
  }

  render() {
    const { getParam } = this.props.navigation;
    const displayText = this.state.isGoing ? "Ungoing" : "Join";
    const task = this.props.navigation.getParam('task', '0');
    return (
      <ScrollView 
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        snapToInterval={104/812*height}
        decelerationRate='fast'>
        <GenericScreen
          source={getParam("uri")}
          name={getParam("name")}
          description={getParam("location")}>
          <Text style={styles.numberText}> {this.state.pool.length} </Text>
          <Text style={styles.descriptionText}> # of Attenders </Text>
          {this.drawKiView()}
          <View style={styles.buttonContainer}>
              {this._renderQRCode()}
              <AwesomeButton
                // progress
                height={68/812*height}
                backgroundColor="#FFFFFF"
                borderRadius= {34/812*height}
                onPress={(next) => {
                  ((this.state.isGoing) ? Fire.shared.ungoingTask(task) : Fire.shared.joinTask(task)).then(()=>{
                    this.fetchdata();
                  });
                  next();
                }}>
                <Text style={styles.text}>{displayText}</Text>
              </AwesomeButton>
          </View>
        </GenericScreen>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {this.props.navigation.navigate("Home")}}>
          <Ionicons name='ios-close' size={25} color="#000"/>
        </TouchableOpacity>
      </ScrollView>
    );
  }
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
  buttonContainer:{
    marginLeft:84/812*height,
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
