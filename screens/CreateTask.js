import React from 'react';
import { Alert, Text, TextInput, StyleSheet, View,ScrollView,Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncImageAnimated from '../components/AsyncImageAnimated';

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
            whatItems: [
              {
                activity: 'Coffee Break',
                source:require('../assets/images/coffee.jpeg')
              },
              {
                activity: 'WorkOut',
                source:require('../assets/images/workout.jpg')
              },
              {
                activity: 'Library',
                source:require('../assets/images/library.jpg')
              },
              {
                activity: 'Sightseeing',
                source:require('../assets/images/sightseeing.jpg')
              },
            ],
        };
    }

    componentDidMount() {
        // if the component is using the optional `value` prop, the parent
        // has the abililty to both set the initial value and also update it
        setTimeout(() => {
            this.setState({
                favColor: 'red',
            });
        }, 1000);

        // parent can also update the `items` prop
        // setTimeout(() => {
        //     this.setState({
        //         items: this.state.items.concat([{ value: 'purple', label: 'Purple' }]),
        //     });
        // }, 2000);
    }

    render() {
        console.log('BBBBB',this.state.whatItems);
        console.log('AAAAA',this.state.whatItems[0].uri);
        console.log('AAAAA','../assets/images/sightseeing.jpg');
        return (
          <ScrollView>
            <View style={styles.container}>
                <Text style={styles.titleText}>Create Task</Text>

                <Text style={styles.subTitleText}>Where?</Text>

                <View style={{ paddingVertical: hRatio(12)}} />

                <RNPickerSelect
                    placeholder={{
                        label: 'Select a location...',
                        value: null,
                    }}
                    items={this.state.whereItems}
                    onValueChange={(value) => {
                        this.setState({
                            favColor: value,
                        });
                    }}
                    style={{ ...pickerSelectStyles }}
                    value={this.state.where}
                    ref={(el) => {
                        this.inputRefs.picker = el;
                    }}
                />

                <Text style={styles.subTitleText}>What?</Text>

                <View style={{ paddingVertical: hRatio(12)}} />

                <ScrollView
                    horizontal
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={wRatio(200+12)}
                    style={{
                      marginLeft:-wRatio(20),
                    }}
                    contentContainerStyle={{
                        paddingLeft:wRatio(20),
                        paddingRight:wRatio(20)
                    }}
                    decelerationRate='fast'>
                    {this.state.whatItems.map((element, index) => (
                        <View 
                            key={index} 
                            style={styles.card}>
                            <AsyncImageAnimated
                                style={{
                                  width: wRatio(200),
                                  height: hRatio(156),}}
                                source={element.source}
                                placeholderColor='#cfd8dc'
                                animationStyle='fade'
                              >
                            </AsyncImageAnimated>
                            <View style={styles.cardDescription}>
                                <Text style={styles.cardText}> {element.activity}</Text>
                            </View>
                        </View>     
                    ))}
                  </ScrollView>


                <View style={{ paddingVertical: 5 }} />


                <View
                            style={styles.card}>
                            <AsyncImageAnimated
                                style={{
                                  width: wRatio(200),
                                  height: hRatio(156),}}
                                source={require('../assets/images/coffee.jpeg')}
                                placeholderColor='#cfd8dc'
                                animationStyle='fade'
                              >
                            </AsyncImageAnimated>
                            <View style={styles.cardDescription}>
                                <Text style={styles.cardText}> hello World</Text>
                            </View>
                        </View> 

                <Text>Company?</Text>
                <TextInput
                    ref={(el) => {
                        this.inputRefs.company = el;
                    }}
                    returnKeyType="go"
                    enablesReturnKeyAutomatically
                    style={pickerSelectStyles.inputIOS}
                    onSubmitEditing={() => {
                        Alert.alert('Success', 'Form submitted', [{ text: 'Okay', onPress: null }]);
                    }}
                />
            </View>
          </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: wRatio(20),
    },
    titleText:{
        marginTop:hRatio(121),
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:36,
    },
    subTitleText:{
        marginTop:hRatio(24),
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:24,
    },
    cardText:{
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:14,
        marginTop:hRatio(18),
        marginLeft:wRatio(18),
    },
    card:{
        borderRadius:15,
        marginHorizontal:wRatio(12),
        elevation:2,
        width:wRatio(200),
        height:hRatio(209),
        shadowOffset:{width:0,height:10},
        shadowRadius: 10,
        shadowColor: "red",
        shadowOpacity:1,
        backgroundColor:'#FFF',
        overflow:'hidden',      
    }
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