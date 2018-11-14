import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Button } from 'react-native';
import { WebBrowser, Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';
import { REACT_APP_FOURSQUARE_ID, REACT_APP_FOURSQUARE_SECRET } from 'react-native-dotenv'

const venues = [{
                    label: 'Global Innovation Exchange',
                    value: '12280 NE District Way, Bellevue, WA 98005',
                },
                {
                    label: 'Odegaard library',
                    value: '4060 George Washington Lane Northeast, Seattle, WA 98195',
                },
                {
                    label: 'Husky Union Building',
                    value: '4001 E Stevens Way NE, Seattle, WA 98195',
                },
                {
                    label: 'IMA',
                    value: '3924 Montlake Blvd NE, Seattle, WA 98195',
                },
                {
                    label: 'Bellevue Starbucks',
                    value: '10214 NE 8th St Bellevue WA 98004',
                },
                {
                    label: 'Pike Starbucks',
                    value: '1912 Pike Pl Seattle WA 98101',
                },
                {
                    label: 'Space Needle',
                    value: '400 Broad St, Seattle, WA 98109',
                },
                {
                    label: 'Gas work Park',
                    value: '2101 N Northlake Way, Seattle, WA 98103',
                },
                {
                    label: 'LA Fitness Bellevue',
                    value: '550 106th Ave NE #215 Bellevue WA 98004',
                },
                {
                    label: 'Starbucks',
                    value: '4147 University Way NE Seattle WA 98105',
                }]


export default class DevelopmentScreen extends React.Component {
  static navigationOptions = {
    title: 'Development'
  }
    

  render() {
    return (
      <View style={styles.container}>
        <Button title="delete my pool" onPress={()=>{Fire.shared.deleteMyPool();}}/>
        <Button title="delete all pool" onPress={()=>{Fire.shared.deleteAllPool();}}/>
        <Button title="delete all notification" onPress={()=>{Fire.shared.deleteAllNotification();}}/>
        <Button title="generate a notification" onPress={()=>{Fire.shared.generateNotification();}}/>
        <Button title="transfer photos" onPress={()=>{Fire.shared.transferAllImages();}}/>
        <Button title="refresh personal pool" onPress={()=>{Fire.shared.getPersonalPool(0);}}/>
        <Button title="fetch list information" onPress ={getVenueIDs}/>
      </View>
    );
  }
}

  fetchMarkerPhoto = async (ID) =>{
    let fetchurl = "https://api.foursquare.com/v2/venues/"+ID+"?client_id="+REACT_APP_FOURSQUARE_ID+"&client_secret="+REACT_APP_FOURSQUARE_SECRET+"&v=20180323";
    try{
      let response = await fetch(fetchurl);
      let data = await response.json();
      // console.log('foursquare photo data: ', data.response.venue.bestPhoto)
      return data.response.venue.bestPhoto.prefix + "original" + data.response.venue.bestPhoto.suffix
      // the following code is for recommended search, research search in fetchurl with recommended return data.response.groups[0].items      
    }catch(err){
      console.log('Marker Photo Failed');
      // if (this.mountState) this.setState({
      //     errorMessage: err,
      // });
    }
  }


  getVenueIDs = async () =>{
    // console.log(venues);
    output=[];
    venues.map( (element, index) => {
    this.fetchMarkerData(element).then( (data) => {
      return Fire.shared.getPlaceURI(data.id, data).then( (uri) => {
        if (uri) {
          return {
            id: data.id,
            uri: uri,
            name: data.name,
            location: data.address,
          }
        } else {
          return this.fetchMarkerPhoto(data.id).then( (url) => {
            if (url) {
              Fire.shared.addPlaceURI(data.id, url);
              return {
                id: data.id,
                uri: url,
                name: data.name,
                location: data.address,
              }
            }else{
              return null;
            }
          });
        } 
      });
    }).then( (detailedInfo) => {
      // console.log('YAAAAA', detailedInfo)
      output.push(detailedInfo);
    //   this.setState({location,region,markers:markersInfo.filter((obj)=>obj)});
    // this.loadingMarkers = false;
    // console.log('total promise time', new Date().getTime() - v0);
    })
  });
  }


  fetchMarkerData = async (element) =>{
    //venues.map(async (element,index)=>{
      let fetchurl = "https://api.foursquare.com/v2/venues/search?client_id="+REACT_APP_FOURSQUARE_ID+"&client_secret="+REACT_APP_FOURSQUARE_SECRET+"&v=20180323&limit=3&near=" + element.value + "&query="  + element.label ;
      //console.log(fetchurl);
      try{  
        let response = await fetch(fetchurl);
        let data = await response.json();
        let name = data.response.venues[0].name;
        let id = data.response.venues[0].id;
        console.log(element.label,{name:name,id:id,address:address});
        let address = data.response.venues[0].location.formattedAddress
        return {name:name,id:id,address:address}
    }catch(err){
      console.log('this problem is not being fetched: ', element.label , fetchurl)     
    }
  }



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  optionsTitleText: {
    fontFamily :"mylodon-light",
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 9,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  optionText: {
    fontSize: 15,
    marginTop: 1,
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
});
