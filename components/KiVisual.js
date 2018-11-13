import React from 'react'; 
import {TouchableOpacity, Dimensions,ScrollView } from 'react-native'; 
import AsyncImageAnimated from '../components/AsyncImageAnimated';

const { width, height } = Dimensions.get("window");

export function generateRandomCircles(pool,sum,navigation) {  
  var NumCircles = pool.length ;

  var values = pool.sort((a,b)=>{return b.value-a.value})
  var counter = 0;
  var savedCirclesCounter = 0;
  //maximum number of bubbles to be tested
  var protection = NumCircles * 100;
  var overlapping = false;

  circles=[];

  while (circles.length < NumCircles &&
       counter < protection) {

    var randomX = Math.round(50+Math.random() * (width-80));
    var randomY = Math.round(50+Math.random() * (500/812*height-80));
    //perhaps better algorithm here
    var size = 15 + pool[savedCirclesCounter].value/sum* (width-15)/2;
    var opacity = 0.5 + 0.5 * (Math.max(0,5 - savedCirclesCounter)/5);  
    var uri = pool[savedCirclesCounter].uri;
    var name = pool[savedCirclesCounter].name;
    var uid = pool[savedCirclesCounter].uid;
    
    overlapping = false;
    //console.log('counter is currently at: ', counter);
    //console.log('added circles count is currently at: ', circles.length);
  
    // check that it is not overlapping with any existing circle
    for (var i = 0; i < circles.length; i++) {
      var existing = circles[i];
      var d = Math.hypot(randomX-existing.xPos,randomY-existing.yPos);
      //fixed 12 pixel seperation
      if (d < size + existing.width + 12) {
        // They are overlapping
        overlapping = true;
        // do not add to array
        break;
      }
    } 
    // add valid circles to array
    if (!overlapping) {
      var circle = {width:size, xPos:randomX, yPos:randomY,opacity:opacity,uri:uri,uid:uid,name:name};
      savedCirclesCounter++;
      circles.push(circle);      
    }   
    counter++;
  }
  //console.log('cirles to be rendered',circles);
  return clickBox(circles,navigation);
}

function clickBox(circles,navigation){
  return circles.map((element, index) => {
    // console.log('dararda', element);
    return(
      <TouchableOpacity
        key={index}
        onPress={
          () => navigation.navigate("ViewOther", {
            uri: element.uri,
            name: element.name,
            uid: element.uid,
          })
        }
        style={{    
          position:'absolute',
          width: element.width*2,
          height: element.width*2, 
          borderRadius: element.width,
          shadowOffset:{width:0,height:10},
          shadowRadius: 20,
          shadowColor: "rgba(0,0,0,1)",
          shadowOpacity:0.4,
          top: element.yPos-element.width,
          left: element.xPos-element.width}}>
        <AsyncImageAnimated
          style={{
            position:'absolute',
            width: element.width*2,
            height: element.width*2, 
            borderRadius: element.width,
            opacity:element.opacity,

          }}
          source={{
            uri: element.uri
          }}
          placeholderColor='purple'
          animationStyle='fade'/>
      </TouchableOpacity>
      );
  })
}


export function generateCirclesRow(pool) {
  //this needs to be changed w.r.t. time not array value
  //var values = pool.sort((a,b)=>{return b.value-a.value})

  return (
    <ScrollView
      horizontal
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      snapToInterval={68/812*height+5}
      style={{
        paddingBottom:15,
        paddingTop:8,
      }}
      contentContainerStyle={{
        paddingLeft: 16,
        paddingRight: 16,
        justifyContent:"center",
      }}
      decelerationRate='fast'>
      {pool.map((element, index) => (
        <AsyncImageAnimated
          key={index}
          style={{
            marginHorizontal: 4,
            width: 68/812*height,
            height: 68/812*height,
            borderRadius: 34/812*height,
            shadowOffset:{width:0,height:5},
            shadowRadius: 5,
            shadowColor: "rgba(0,0,0,1)",
            shadowOpacity:0.2}}
          source={{
            uri: element.uri
          }}
          placeholderColor='#cfd8dc'
          animationStyle='fade'
          >
        </AsyncImageAnimated>
      ))}
    </ScrollView>
  );
}

export function generateMultiChoiceCirclesRow(pool, onPressItem, picked) {
  return (
    <ScrollView
      horizontal
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      snapToInterval={68/812*height+5}
      style={{
        paddingBottom:15,
        paddingTop:8,
      }}
      contentContainerStyle={{
        paddingLeft: 16,
        paddingRight: 16,
        justifyContent:"center",
      }}
      decelerationRate='fast'>
      {pool.map((element, index) => (
        <TouchableOpacity key={index} onPress={() => onPressItem(index)}>
          <AsyncImageAnimated
            style={{
              marginHorizontal: 4,
              width: 68/812*height,
              height: 68/812*height,
              opacity: (picked.has(index) ? 1.0 : 0.5),
              borderRadius: 34/812*height,
              shadowOffset:{width:0,height:5},
              shadowRadius: 5,
              shadowColor: "rgba(0,0,0,1)",
              shadowOpacity:0.2}}
            source={{
              uri: element.uri
            }}
            placeholderColor='#cfd8dc'
            animationStyle='fade'
            >
          </AsyncImageAnimated>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}