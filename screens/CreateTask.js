import React from 'react';
import { Alert, Text, TextInput, Image, StyleSheet, View, FlatList, ScrollView, Dimensions, TouchableOpacity} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncImageAnimated from '../components/AsyncImageAnimated';
import AwesomeButton from 'react-native-really-awesome-button';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {generateMultiChoiceCirclesRow} from '../components/KiVisual';
import Fire from '../components/Fire';

const { width, height } = Dimensions.get("window");

const hRatio = (value) => {
  return value /812*height;
}

const wRatio = (value) => {
  return value /375*width;
}


export default class App extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            isDateTimePickerVisible:false,
            selectedDate:false,
            where: undefined,
            whereItems: [
                {
                    label: 'Global Innovation Exchange',
                    // value: '12280 NE District Way, Bellevue, WA 98005',
                    value:'59bb267a805e3f59823645a3'
                },
                {
                    label: 'Odegaard library',
                    // value: '4060 George Washington Lane Northeast, Seattle, WA 98195',
                    value:'4a99e654f964a520063120e3'

                },
                {
                    label: 'Husky Union Building',
                    // value: '4001 E Stevens Way NE, Seattle, WA 98195',
                    value:'441eb908f964a5207c311fe3'
                },
                {
                    label: 'IMA',
                    // value: '3924 Montlake Blvd NE, Seattle, WA 98195',
                    value:'4ad7da23f964a520710f21e3'
                },
                {
                    label: 'Starbucks @ Bellevue',
                    // value: '10214 NE 8th St Bellevue WA 98004',
                    value:'52869068498e3289da673edf'
                },
                {
                    label: 'Starbucks Reserve @ Pike',
                    // value: '1912 Pike Pl Seattle WA 98101',
                    value:'58ad168cd8e55956ea9db67e'
                },
                {
                    label: 'Space Needle',
                    // value: '400 Broad St, Seattle, WA 98109',
                    value:'416dc180f964a5209b1d1fe3'
                },
                {
                    label: 'Gas work Park',
                    // value: '2101 N Northlake Way, Seattle, WA 98103',
                    value:'430bb880f964a5203a271fe3'
                },
                {
                    label: 'LA Fitness Bellevue',
                    // value: '550 106th Ave NE #215 Bellevue WA 98004',
                    value:'49cac644f964a520de581fe3'
                },
                {
                    label: 'Starbucks @ UW',
                    // value: '4147 University Way NE Seattle WA 98105',
                    value:'4470775ef964a52093331fe3'
                }],
            whatIndex: undefined,
            selectedWhatBool:false,
            selectedWhat: new Set(),
            selectedWho: new Set(),
            whatItems: [
              {
                activity: 'Coffee Break',
                source:require('../assets/images/coffee.jpeg'),
              },
              {
                activity: 'WorkOut',
                source:require('../assets/images/workout.jpg'),
              },
              {
                activity: 'Library',
                source:require('../assets/images/library.jpg'),
              },
              {
                activity: 'Sightseeing',
                source:require('../assets/images/sightseeing.jpg'),
              },
            ],
        };

        this.inputRefs = {};
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true })

    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false })

    _handleDatePicked = (date) => {
        console.log('A date has been picked: ', date);
        this.setState({selectedDate: date})
        this._hideDateTimePicker();
    }

    _handleActivity = (index) => {
      this.setState((state) => {
        const selected = new Set(state.selectedWhat);
        if (this.state.whatIndex != undefined) selected.delete(this.state.whatIndex);
        selected.add(index);
        return {selectedWhat: selected, whatIndex: index};
      });
    }

    _handleInvite = (index) => {
      this.setState((state) => {
        const selected = new Set(state.selectedWho);
        selected.has(index) ? selected.delete(index) : selected.add(index);
        return {selectedWho: selected}
      });
    }

    _renderActivities = ({item, index}) => (
      <ActivityItem
        item={item}
        index={index}
        onPressItem={this._handleActivity}
        selected={this.state.selectedWhat.has(index)}
      />
    )

    render() {
      const { getParam } = this.props.navigation;
      return (
        <ScrollView bounces={false}>
          <View style={styles.container}>
            <Text style={styles.titleText}>Create Task</Text>
            <Text style={styles.subTitleText}>Where?</Text>
            <View style={{ paddingVertical: hRatio(12)}} />
            <View style={{paddingHorizontal:20}}>
              <RNPickerSelect
                placeholder={{
                  label: 'Select a location...',
                  value: null,
                }}
                items={this.state.whereItems}
                onValueChange={(value) => {
                  this.setState({
                    where: value,
                  });
                }}
                style={{ ...pickerSelectStyles }}
                value={this.state.where}
                ref={(el) => {
                  this.inputRefs.picker = el;
                }}
              />
            </View>

            <Text style={styles.subTitleText}>What?</Text>

            <FlatList
              horizontal
              scrollEventThrottle={1}
              showsHorizontalScrollIndicator={false}
              snapToInterval={wRatio(200+12)}
              style={{
                paddingTop:hRatio(24),
                paddingBottom:hRatio(40),
                shadowOffset:{width:0,height:10},
                shadowRadius: wRatio(15),
                shadowColor: "rgb(0,0,0)",
                shadowOpacity:0.2,
              }}
              contentContainerStyle={{
                paddingLeft:wRatio(20),
                paddingRight:wRatio(20)
              }}
              keyExtractor={(item, index) => ("notification" + index)}
              data={this.state.whatItems}
              // extraData={this.state}
              renderItem={this._renderActivities}
              decelerationRate='fast'/>

            <Text style={styles.subTitleTextWhen}>When?</Text>

            <TouchableOpacity style={{alignItems:'center', marginTop:hRatio(24)}} onPress={this._showDateTimePicker}>
              { this.state.selectedDate ? (
                <View style={styles.timeContainer}>    
                  <Text style={styles.timeText}>{this.state.selectedDate.toString().slice(0,21)}</Text>
                </View>
              ) : (
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>Select Date & Time</Text>
                </View>
              )} 
            </TouchableOpacity>
            
            <DateTimePicker
              isVisible={this.state.isDateTimePickerVisible}
              onConfirm={this._handleDatePicked}
              onCancel={this._hideDateTimePicker}
              mode='datetime'
            />

            <Text style={styles.subTitleText}>Participants</Text>
            
            <View style={styles.kiContainer}>
              {/*console.log(this.state.whatItems)*/}
              {generateMultiChoiceCirclesRow(getParam('pool'), this._handleInvite, this.state.selectedWho)}
            </View>

            <View style={styles.buttonContainer}>
              <AwesomeButton
                height={68/812*height}
                backgroundColor="#FFFFFF"
                borderRadius= {34/812*height}
                onPress={(next) => {
                  const users = Array.from(this.state.selectedWho).map((userIndex) => getParam('pool')[userIndex].uid);
                  console.log('what:', this.state.whatItems[this.state.whatIndex].activity);
                  console.log('where:', this.state.where);
                  console.log('when:', this.state.selectedDate);
                  console.log('who:', users);
                  // console.log('IDK', Fire.shared.toTimeStamp(this.state.selectedDate));
                  if (this.state.whatItems[this.state.whatIndex] && this.state.where && this.state.selectedDate && users){
                    // Fire.shared.startTasks(['3QcHJ8jc6WQYcAs82JN9E7z4a422'], {'where': '0', 'when': '0', 'what': '0'});
                    this.props.navigation.navigate('Congrats',{
                      what: this.state.whatItems[this.state.whatIndex].activity,
                      where: this.state.where,
                      when: this.state.selectedDate,
                      who:users,
                    });
                  }else{
                    Alert.alert(
                      'Player Attention',
                      'one of the required fields is missing',
                      [
                        {text: 'OK', onPress: () => console.log('OK Pressed')},
                      ],
                    )
                  }          
                  next();
                }}>
                <Text style={styles.text}>{"Next"}</Text>
              </AwesomeButton>
            </View>
            <TouchableOpacity
              style={styles.closeButtonContainer}
              onPress={() => {this.props.navigation.navigate("Home")}}>
              <Image source={require('../assets/icons/back.png')} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
}

class ActivityItem extends React.PureComponent {
  render() {
    const item = this.props.item;
    const opacity = this.props.selected ? 1.0 : 0.5;
    const bgc = this.props.selected ? 'red' : 'blue';
    // console.log("refresh", this.props.index, this.props.selected, opacity);
    return (
      <TouchableOpacity
        onPress={() => this.props.onPressItem(this.props.index)}
        style={styles.card}>
        <View>
          <Image
            style={{
              width: wRatio(200),
              height: hRatio(156),
              opacity}}
            source={item.source}
          />
          <View style={styles.cardDescription}>
            <Text style={styles.cardText}> {item.activity}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 60,
        left: 30,
        borderRadius: 30,
        width: 30,
        height: 30,
        alignItems:'center',
        backgroundColor:"#fff",
        shadowColor: "#000000",
        shadowRadius: 15,
        shadowOpacity: 0.2,
        shadowOffset: { x: 0, y: 10 },
    },
    titleText:{
        marginTop:hRatio(121),
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:36,
        paddingLeft:hRatio(20)
    },
    subTitleText:{
        marginTop:hRatio(24),
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:24,
        paddingLeft:hRatio(20)
    },
    subTitleTextWhen:{
        marginTop:hRatio(-16),
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:24,
        paddingLeft:hRatio(20)
    },
    cardText:{
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:14,
        marginTop:hRatio(18),
        marginLeft:wRatio(18),
        marginBottom:hRatio(18),
    },
    kiContainer: {
        width: width,
        height: 91/812*height,
        marginTop: 17/812*height, 
    },
    card:{
        borderRadius:15,
        marginHorizontal:wRatio(12),
        //elevation:5,
        width:wRatio(200),
        height:hRatio(209),
        overflow:'hidden',      
    },
    cardDescription:{
        backgroundColor:'white',
    },
    timeContainer:{
        paddingHorizontal: 20,
        paddingBottom: 13,
        borderWidth: 1,
        borderColor: 'rgba(148,148,148,0.16)',
        borderRadius: 8,
        backgroundColor: 'white',
        shadowOffset:{width:0,height:2},
        shadowRadius: 4,
        shadowColor: "rgb(148,148,148)",
        shadowOpacity:0.16,
    },
    timeText:{
        fontSize: 14,
        fontFamily:'GR',
        paddingTop: 11,
        color: 'rgb(217,217,217)',
    },
    buttonContainer:{
        alignItems:'center',
        marginTop:hRatio(24),
        borderRadius:34/812*height,
        shadowOffset:{width:0,height:10},
        shadowRadius: 30,
        shadowColor: "rgba(0,0,0,1)",
        shadowOpacity:0.2,
        paddingBottom:hRatio(75)
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 14,
        fontFamily:'GR',
        paddingTop: 11,
        paddingHorizontal: 20,
        paddingBottom: 13,
        borderWidth: 1,
        borderColor: 'rgba(148,148,148,0.16)',
        borderRadius: 8,
        backgroundColor: 'white',
        color: 'rgb(217,217,217)',
        shadowOffset:{width:0,height:2},
        shadowRadius: 4,
        shadowColor: "rgb(148,148,148)",
        shadowOpacity:0.16,
    },
});
