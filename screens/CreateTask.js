import React from 'react';
import { Alert, Text, TextInput, Image,StyleSheet, View,ScrollView,Dimensions,TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncImageAnimated from '../components/AsyncImageAnimated';
import AwesomeButton from 'react-native-really-awesome-button';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {generateCirclesRow} from '../components/KiVisual';
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

        this.inputRefs = {};

        this.state = {
            isDateTimePickerVisible:false,
            selectedDate:false,
            where: undefined,
            whereItems: [
                {
                    label: 'GIX',
                    value: 'GIX: 12280 NE District Way, Bellevue, WA 98005',
                },
                {
                    label: 'Ode',
                    value: 'Ode: 4060 George Washington Lane Northeast, Seattle, WA 98195',
                },
                {
                    label: 'HUB',
                    value: 'HUB: 4001 E Stevens Way NE, Seattle, WA 98195',
                },
                {
                    label: 'IMA',
                    value: 'IMA: 3924 Montlake Blvd NE, Seattle, WA 98195',
                },
                {
                    label: 'Bellevue Starbucks',
                    value: 'Bellevue Starbucks: 10214 NE 8th St, Bellevue, WA 98004',
                },
                {
                    label: 'Pike Starbucks',
                    value: 'Pike Starbucks: 1912 Pike Pl, Seattle, WA 98101',
                },
                {
                    label: 'Space Needle',
                    value: 'Space Needle: 400 Broad St, Seattle, WA 98109',
                },
                {
                    label: 'Gas work Park',
                    value: 'Gas work Park: 2101 N Northlake Way, Seattle, WA 98103',
                },
                {
                    label: 'LA Fitness Bellevue',
                    value: 'LA Fitness Bellevue: 550 106th Ave NE #215, Bellevue, WA 98004',
                },
                {
                    label: 'UW Starbucks',
                    value: 'UW Starbucks: 4555 University Way NE, Seattle, WA 98105',
                },
            ],
            what: undefined,
            selectedWhatBool:false,
            whatItems: [
              {
                activity: 'Coffee Break',
                source:require('../assets/images/coffee.jpeg'),
                opacity:0.5,
              },
              {
                activity: 'WorkOut',
                source:require('../assets/images/workout.jpg'),
                opacity:0.5,
              },
              {
                activity: 'Library',
                source:require('../assets/images/library.jpg'),
                opacity:0.5,
              },
              {
                activity: 'Sightseeing',
                source:require('../assets/images/sightseeing.jpg'),
                opacity:0.5,
              },
            ],
        };
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

    _handleDatePicked = (date) => {
        console.log('A date has been picked: ', date);
        this.setState({selectedDate:date})
        this._hideDateTimePicker();
    };

    // _handleActivity = (index) =>{
    //     let {whatItems,selectedWhatBool} = this.state;
    //     let selectedActivity = null;
    //     //slight issue here, basically need to click twice on the first go
    //     if (whatItems[index].opacity==0.5 && !selectedWhatBool) {
    //         console.log('AAAAAAA')
    //         whatItems[index].opacity = 1;
    //         selectedWhatBool = true;
    //         selectedActivity = whatItems[index].activity;
    //     } else if (whatItems[index].opacity==1 && selectedWhatBool){
    //         whatItems[index].opacity = 0.5;
    //         selectedWhatBool = false;
    //         selectedActivity = null;
    //         console.log('BBBBBBB');
    //     }        
    //     this.setState({whatItems:whatItems,what:whatItems[index].activity,selectedWhatBool:selectedWhatBool},function(){
    //     console.log('CCCCC',this.state.whatItems, '++++++', this.state.selectedWhatBool);
    //     this.forceUpdate();});     
    // }

     _handleActivity = (index) =>{
        this.setState((prevState) => {
           if (prevState.whatItems[index].opacity==0.5 && !prevState.selectedWhatBool) {
            console.log('AAAAAAA')
            prevState.whatItems[index].opacity = 1;
            prevState.selectedWhatBool = true;
            prevState.what = prevState.whatItems[index].activity;
        } else if (prevState.whatItems[index].opacity==1 && prevState.selectedWhatBool){
            prevState.whatItems[index].opacity = 0.5;
            prevState.selectedWhatBool = false;
            prevState.what = null;
            console.log('BBBBBBB');
        }
        return {what:prevState.what,selectedWhatBool:prevState.selectedWhatBool,whatItems: prevState.whatItems}  
        },function(){console.log('CCCCC',this.state.whatItems, '++++++', this.state.selectedWhatBool);})
    }   


    render() {
        const { getParam} = this.props.navigation;
        console.log('ZZZZZ',this.state.whatItems, '++++++', this.state.selectedWhatBool)
        return (
          <ScrollView
                bounces={false}>
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

                <ScrollView
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
                    decelerationRate='fast'>
                    {this.state.whatItems.map((element, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => this._handleActivity(index)}
                            style={[styles.card,{opacity:element.opacity}]}>
                            <Image
                                style={{
                                  width: wRatio(200),
                                  height: hRatio(156),}}
                                source={element.source}
                                //placeholderColor='#cfd8dc'
                                //animationStyle='fade'
                              >
                            </Image>
                            <View style={styles.cardDescription}>
                                <Text style={styles.cardText}> {element.activity}</Text>
                            </View>
                        </TouchableOpacity>     
                    ))}
                  </ScrollView>


                <Text style={styles.subTitleTextWhen}>When?</Text>

                <TouchableOpacity style={{alignItems:'center', marginTop:hRatio(24)}} onPress={this._showDateTimePicker}>
                    {this.state.selectedDate ? (
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
                    {generateCirclesRow(getParam('pool'))}
                </View>

                <View style={styles.buttonContainer}>
                    <AwesomeButton
                      height={68/812*height}
                      backgroundColor="#FFFFFF"
                      borderRadius= {34/812*height}
                      onPress={(next) => {
                        //Fire.shared.startTasks(['3QcHJ8jc6WQYcAs82JN9E7z4a422'], {'where': '0', 'when': '0', 'what': '0'});
                        
                        this.props.navigation.pop();
                        next();
                      }}>
                      <Text style={styles.text}>{"Next"}</Text>
                    </AwesomeButton>
                </View>
            </View>
          </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        justifyContent: 'center',
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
