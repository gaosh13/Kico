import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Fire from '../components/Fire';
import GenericScreen from '../components/GenericScreen';

const { width, height } = Dimensions.get("window");

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
    let [data, frienddata, pool] = await Promise.all([Fire.shared.readInfo(), Fire.shared.getFriends(), Fire.shared.getCheckedPlaces()]);
    if (data && frienddata) {
      const {name, gender, age, ki, photoURL} = data;
      pool = pool.sort((a,b)=>{return b.rawTime-a.rawTime});
      console.log('pool & data', pool);
      this.setState({
        name: name,
        gender: gender,
        friends: frienddata.length,
        age: age.toString(),
        ki: ki,
        photoUrl: photoURL,
        pool: pool || [],
      });
    }
  }

  drawNode(){
    return (
      <View>
        <View style={styles.kiLogContainer}>
          <Text style={styles.kiLogText}>Ki Log</Text>
        </View>
        {this.drawNodeList()}
      </View>
    );
  }

  drawNodeList() {
    return (
      this.state.pool.map( (item, index) => {
      if (index % 2 == 0) {
        return this.drawNode_odd(item, index);
      } else {
        return this.drawNode_even(item, index);
      }
    })
    )
  }

  drawNode_odd(item, index){
    console.log("item", item, index);
    return(
      <View key={"place"+index} style={{flexDirection:'row',justifyContent: 'space-evenly', height:104}}>
        <Image style = {styles.checkInImage} source={{uri: item.uri}}/>
        <View style={{alignItems:'center'}}>
          <View style={styles.bar}/>
          <View style={styles.outerCircle}/>
          <View style={styles.innerCircle}/>
        </View>
        <View style={{width:114}} >
          <Text numberOfLines={1} style={styles.venueNameText_odd}>{item.name}</Text>
          <Text style={styles.venueTimeText_odd}>{item.time}</Text> 
        </View>
      </View>
    )
  }

  drawNode_even(item, index){
    return(
      <View key={"place"+index} style={{flexDirection:'row',justifyContent: 'space-evenly', height:104}}>
        <View style={{width:114}}>
          <Text numberOfLines={1} style={styles.venueNameText_even}>{item.name}</Text>
          <Text style={styles.venueTimeText_even}>{item.time}</Text> 
        </View>        
        <View style={{alignItems:'center'}}>
          <View style={styles.bar}/>
          <View style={styles.outerCircle}/>
          <View style={styles.innerCircle}/>
        </View>
        <Image style = {styles.checkInImage} source={{uri: item.uri}}/>
      </View>
    )
  }

  render() {
    const totalKi = 100;
    return (
      <ScrollView 
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      snapToInterval={104/812*height}
      bounces={false}
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
              <TouchableOpacity onPress={()=>{this.props.navigation.navigate('ChatsScreen')}}>
                <View>
                  <Text style={styles.numberText}> {this.state.friends} </Text>
                  <Text style={styles.descriptionText}> # of Friends </Text> 
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.numberText}> {totalKi-this.state.friends-this.state.pool.length}/{totalKi} </Text>
                <Text style={styles.descriptionText}> # of Ki Left</Text> 
              </View>
              <View>
                <Text style={styles.numberText}> {this.state.pool.length} </Text>
                <Text style={styles.descriptionText}> # of CheckIns </Text> 
              </View>
            </View>
            {this.drawNode()} 
            <View
              style={styles.bottomImage}>
              <Image source={require('../assets/images/bottom.png')}/>
            </View>
          </GenericScreen>
          <TouchableOpacity
            style={styles.closeButtonContainer}
            onPress={() => {this.props.navigation.navigate('Home')}}>
            <Image source={require('../assets/icons/close.png')} />
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
    fontSize: 36,
    fontFamily:'GSB',
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
    backgroundColor:"#fff",
    shadowColor: "#000000",
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
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
    fontFamily:"GSB",
    marginTop:34.5,
  },
  venueTimeText_odd:{
    marginTop:5,
    marginBottom:34.5,
    fontSize:12,
    fontFamily:"GR",
    color:'rgb(7,43,79)',
    textAlign: "left"
  },
  venueNameText_even:{
    fontSize:14,
    fontFamily:"GSB",
    color:'rgb(7,43,79)',
    textAlign: "right",
    marginTop:34.5,
  },
  venueTimeText_even:{
    marginTop:5,
    fontFamily:"GR",
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
  bottomImage:{
    marginTop:25,
  }
});
