import React from 'react'; 
import {TouchableOpacity, Dimensions } from 'react-native'; 
import AsyncImageAnimated from '../components/AsyncImageAnimated';

const { width, height } = Dimensions.get("window");


class KiVisual extends React.Component {
  constructor(props) {
      super(props);
  }


  generateCircles = (pool,sum,navigation) => {  
    var NumCircles = pool.length ;

    var values = pool.sort((a,b)=>{return b.value-a.value})
    var counter = 0;
    var savedCirclesCounter = 0;
    //maximum number of bubbles to be tested
    var protection = NumCircles * 10;
    var overlapping = false;

    circles=[];

    while (circles.length < NumCircles &&
         counter < protection) {

      var randomX = Math.round(50+Math.random() * (width-130));
      var randomY = Math.round(50+Math.random() * (height*13/24-130));
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
    return this.clickBox(circles,navigation);
  }

  clickBox(circles,navigation){
    return circles.map((element, index) => {
      console.log('dararda', element);
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
}


KiVisual.shared = new KiVisual();
export default KiVisual;