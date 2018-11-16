import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity
} from 'react-native';
import AtoZList from 'react-native-atoz-list';
import _ from 'lodash';
import { SearchBar } from 'react-native-elements';
import Fire from '../components/Fire';
import {generateRowNoFunction} from '../components/KiVisual';
import AwesomeButton from 'react-native-really-awesome-button';

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
            loading: false,
            data: {},
            error: null,
            pool:[],
        };
        // this.arrayholder = names;
        // console.log('Blah????',  names);
        this.dataArray=[];
    }

    componentDidMount() {
        this.retrieveFriendList();
    }

    retrieveFriendList = async () => {
        let rawData = await Fire.shared.getFriends();
        // friends = _.forEach(friends,function(friend){_.assign(friend,{that:this.state.loading})})
        let friends = []
        rawData.forEach(oneData => {
            friends.push(Object.assign(oneData,{that:this}));
        });        
        this.dataArray = friends;
        let res = _.groupBy(friends, (friend) => friend.name[0].toUpperCase());
        // console.log('BOOOO', res);
            this.setState({
              data: res,
              error: res.error || null,
              loading: false,
            });
            // this.arrayholder = res;
      }


    _renderHeader(data) {
        return (
            <View style={{ height: 35, justifyContent: 'center', backgroundColor: '#eee', paddingLeft: 10}}>
                <Text>{data.sectionId}</Text>
            </View>
        )
    }

    addPool(data){
        let existingPool = this.state.pool;
        // existingPool.map(value=>value.name).sort().sort((a,b)=>{
        // })
        if(!_.find(existingPool,function(item){return item.name === data.name})){
           existingPool.push(data); 
           this.setState({pool:existingPool});
       }
        // console.log('clicked', t);
    }

    _renderCell(data) {
        return (
            <TouchableOpacity style={styles.cell} onPress={()=> data.that.addPool(data)}>
                <Image source={{uri:data.uri}} style={styles.placeholderCircle}/>
                <View style={styles.nameBox}>
                    <Text style={styles.nameText}>
                        {data.name}
                    </Text>
                    <Text style={styles.descriptionText}> Who is the AI if they don't know</Text>
                </View>
            </TouchableOpacity>
        );
    }

    searchFilterFunction = text => {
        // console.log(this.state.data);
        const newData = this.dataArray.filter(item => {
            const itemData = `${item.name.toUpperCase()}`;
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
        let groupedNewData = _.groupBy(newData, (data) => data.name[0].toUpperCase());
        this.setState({
            data: groupedNewData,
        });
    };

    drawKiView(){
        if (this.state.pool.length){
            // console.log('We are ready to create circle', this.state.pool)
            return (
                <View style={styles.kiContainer}>
                    {generateRowNoFunction(this.state.pool)}
                </View>
            )
        } else {
            return null;
        }
      }

    render() {
        return (
            <View style={{flex:1, backgroundColor:'white'}}>
                <Text style={styles.titleText}>Invite Friends</Text>
                {this.drawKiView()}
                <SearchBar
                    placeholder="Type Here..."
                    platform="ios"
                    containerStyle={{backgroundColor:'white'}}
                    // placeholderTextColor="rgb(7,43,49)"
                    onChangeText={text => this.searchFilterFunction(text)}
                    autoCorrect={false}

                    // showLoading={true}
                  /> 
                <AtoZList
                    sectionHeaderHeight={hRatio(35)}
                    cellHeight={hRatio(72)}
                    data={this.state.data}
                    renderCell={this._renderCell}
                    renderSection={this._renderHeader}
                    />
                <View style={styles.buttonContainer}>
                    <AwesomeButton
                        // progress
                        height={68/812*height}
                        backgroundColor="#FFFFFF"
                        borderRadius= {34/812*height}
                        onPress={(next) => {
                            let users = this.props.navigation.getParam('who');
                            let www = this.props.navigation.getParam('www');
                            users = users.concat(this.state.pool.map( (user) => {return user.uid;} ));
                            console.log('www:', www);
                            console.log('who:', users);
                            Fire.shared.startTasks(users, www);
                            this.props.navigation.navigate('Congrats',{friends:this.state.pool, ...www});
                        next();
                          }}>
                        <Text style={{fontSize:15, fontFamily:'GR', fontWeight:'bold'}}>Finish</Text>
                    </AwesomeButton>
                </View>
            </View>
        );
    }
}






const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 25,
        backgroundColor: '#fff',
    },
    swipeContainer: {
    },
    alphabetSidebar: {
        position: 'absolute',
        backgroundColor: 'transparent',
        top: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText:{
        marginTop:hRatio(121),
        color:'rgb(7,43,79)',
        fontFamily:'GSB',
        fontSize:36,
        paddingLeft:hRatio(20)
    },
    placeholderCircle: {
        width: wRatio(72),
        height: wRatio(72),
        borderRadius: wRatio(72)/2,
        marginRight: wRatio(24),
        marginLeft: wRatio(18),
    },
    nameBox:{
        flex:1,
    },
    nameText: {
        fontSize: 24,
        fontFamily:'GSB',
        color:'rgb(7,43,49)',
        marginTop:hRatio(2.5),
    },
    descriptionText:{
        marginTop:hRatio(12),
        marginBottom: hRatio(2.5),
        fontSize: 18,
        fontFamily:'GR',
        color: 'rgb(200,199,207)'
    },
    cell: {
        marginTop:hRatio(12),
        marginBottom:hRatio(12),
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    kiContainer: {
        width: width,
        height: 91/812*height,
        marginTop: 17/812*height, 
    },
    buttonContainer:{
        alignItems:'center',
        position:'absolute',
        bottom:hRatio(55),
        left: wRatio(175/2),
        backgroundColor:'transparent',
        shadowOffset:{width:0,height:10},
        shadowRadius: 30,
        shadowColor: "rgba(0,0,0,1)",
        shadowOpacity:0.2,
  },
});