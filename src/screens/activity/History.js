import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { AppColors } from '../../shared/AppColors';
import { moderateScale } from '../../utils/Scaling';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ElevatedView from 'react-native-elevated-view';
import images from '../../utils/images';
import Entypo from 'react-native-vector-icons/Entypo';
import { SHApiConnector } from '../../network/SHApiConnector';
import { create } from 'apisauce';
const axios = require('axios');
import AsyncStorage from '@react-native-community/async-storage';
import { AppStrings } from '../../shared/AppStrings';

const sampleDate = [
  { id: 1, date: '01', day: 'Mon' },
  { id: 2, date: '02', day: 'Tue' },
  { id: 3, date: '03', day: 'Wed' },
  { id: 4, date: '04', day: 'Thu' },
  { id: 5, date: '05', day: 'Fri' },
  { id: 6, date: '06', day: 'Sat' },
  { id: 7, date: '07', day: 'Sun' },
];

// const api = create({
//   baseURL: AppStrings.apiURL.baseURL,
//   headers: { 'content-type': 'application/json', apikey: process.env.apiKey },
// });

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedId: null,
      data: [],
      dates: []
    };
  }
  handleCardPress(id) {
    this.setState({ selectedId: id });
  }

  async componentDidMount(){
   
    await SHApiConnector.getUserMembershipPlan()
    .then(async res=>{
      console.log('>>>>>>>>>', JSON.stringify(res));
     
      await SHApiConnector.getHistory({
        "planId": res?.data[0].planId
      })
      .then(res=>{
        console.log('History========>>>',JSON.stringify(res))
        this.setState({data: res?.data});

        let arr = [];

        res?.data[0]?.dailyTrackings.map(i=>{
          arr.push(i)
        })
        this.setState({dates: arr});
      })
      .catch(err=>{
        console.log(err)
      })
      
    })

   
    
  }

  dateView() {
    return (
      <ElevatedView
        elevation={3}
        style={{
          width: wp(90),
          backgroundColor: AppColors.whiteColor,
          height: moderateScale(64),
          borderRadius: 15,
          marginTop: hp(3),
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: wp(3.5),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            style={{
              height: moderateScale(40),
              width: moderateScale(40),
              resizeMode: 'contain',
            }}
            source={images.calenderHistory}
          />
          <Text style={{ marginLeft: wp(2), fontSize: 16, fontWeight: '700', color: AppColors.textDarkGray }}>Month</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', width: wp(40), justifyContent: 'space-between' }}>
          <TouchableOpacity>
            <Entypo name="chevron-left" size={20} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 15, fontWeight: '400', color: AppColors.blackColor5 }}>July</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: AppColors.textDarkGray, marginLeft: wp(2) }}>2024</Text>
          </View>
          <TouchableOpacity>
            <Entypo name="chevron-right" size={20} />
          </TouchableOpacity>
        </View>
      </ElevatedView>
    );
  }
  historyCardInfo() {
    return (
      <ElevatedView
        elevation={3}
        style={{
          width: wp(90),
          backgroundColor: AppColors.whiteColor,
          height: moderateScale(122),
          borderRadius: 15,
          marginTop: hp(3),
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          paddingTop: hp(2),
        }}
      >
        <View
          style={{
            borderColor: AppColors.borderColor,
            borderWidth: 1,
            width: moderateScale(70),
            height: moderateScale(74),
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {this.state.data[0]?.isChallengeCompleted ? <View style={{ height: moderateScale(46),
              width: moderateScale(46), borderRadius: 30, backgroundColor:'#FFC7C7', marginTop: moderateScale(-35), alignItems:'center', justifyContent:'center'}}>
            <Image source={require('../../../assets/images/medal.png')} style={{
              height: moderateScale(36),
              width: moderateScale(36),
              resizeMode: 'contain',
              // marginTop: moderateScale(-35),
            }} />
          </View> :
          <Image
            style={{
              height: moderateScale(46),
              width: moderateScale(46),
              resizeMode: 'contain',
              marginTop: moderateScale(-35),
            }}
            source={images.stepsHistory}
          />}
          <Text style={{ fontSize: 14, fontWeight: '700', color: AppColors.textDarkGray }}>{'>'}{this.state.data[0]?.cutOffValue}</Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: AppColors.textLightGray }}>Steps</Text>
        </View>
        <View
          style={{
            borderColor: AppColors.borderColor,
            borderWidth: 1,
            width: moderateScale(70),
            height: moderateScale(74),
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {this.state.data[2]?.isChallengeCompleted ? <View style={{ height: moderateScale(46),
              width: moderateScale(46), borderRadius: 30, backgroundColor:'#FFC7C7', marginTop: moderateScale(-35), alignItems:'center', justifyContent:'center'}}>
            <Image source={require('../../../assets/images/medal.png')} style={{
              height: moderateScale(36),
              width: moderateScale(36),
              resizeMode: 'contain',
              // marginTop: moderateScale(-35),
            }} />
          </View> :<Image
            style={{
              height: moderateScale(46),
              width: moderateScale(46),
              resizeMode: 'contain',
              marginTop: moderateScale(-35),
            }}
            source={images.climbingAct}
          />}
          <Text style={{ fontSize: 14, fontWeight: '700', color: AppColors.textDarkGray }}>{'>'}{this.state.data[2]?.cutOffValue}</Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: AppColors.textLightGray }}>Floor Climb</Text>
        </View>
        <View
          style={{
            borderColor: AppColors.borderColor,
            borderWidth: 1,
            width: moderateScale(70),
            height: moderateScale(74),
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {this.state.data[3]?.isChallengeCompleted ? <View style={{ height: moderateScale(46),
              width: moderateScale(46), borderRadius: 30, backgroundColor:'#FFC7C7', marginTop: moderateScale(-35), alignItems:'center', justifyContent:'center'}}>
            <Image source={require('../../../assets/images/medal.png')} style={{
              height: moderateScale(36),
              width: moderateScale(36),
              resizeMode: 'contain',
              // marginTop: moderateScale(-35),
            }} />
          </View> :<Image
            style={{
              height: moderateScale(46),
              width: moderateScale(46),
              resizeMode: 'contain',
              marginTop: moderateScale(-35),
            }}
            source={images.screenTimeAct}
          />}
          <Text style={{ fontSize: 14, fontWeight: '700', color: AppColors.textDarkGray }}>{'<'}{this.state.data[3]?.cutOffValue} hrs.</Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: AppColors.textLightGray }}>Screen Time</Text>
        </View>
        <View
          style={{
            borderColor: AppColors.borderColor,
            borderWidth: 1,
            width: moderateScale(70),
            height: moderateScale(74),
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {this.state.data[1]?.isChallengeCompleted ? <View style={{ height: moderateScale(46),
              width: moderateScale(46), borderRadius: 30, backgroundColor:'#FFC7C7', marginTop: moderateScale(-35), alignItems:'center', justifyContent:'center'}}>
            <Image source={require('../../../assets/images/medal.png')} style={{
              height: moderateScale(36),
              width: moderateScale(36),
              resizeMode: 'contain',
              // marginTop: moderateScale(-35),
            }} />
          </View> :<Image
            style={{
              height: moderateScale(46),
              width: moderateScale(46),
              resizeMode: 'contain',
              marginTop: moderateScale(-35),
            }}
            source={images.sleepHrAct}
          />}
          <Text style={{ fontSize: 14, fontWeight: '700', color: AppColors.textDarkGray }}>{'>'}{this.state.data[1]?.cutOffValue} hrs.</Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: AppColors.textLightGray }}>Sleep</Text>
        </View>
      </ElevatedView>
    );
  }
  verticalLine() {
    return <View style={{ height: moderateScale(32), backgroundColor: AppColors.borderColor, width: moderateScale(1) }}></View>;
  }

  secondCard(i, count, totalDates) {
    return (
      <ElevatedView
        elevation={3}
        style={{
          width: wp(90),
          backgroundColor: AppColors.whiteColor,
          height: moderateScale(74),
          borderRadius: 15,
          marginTop: hp(1.3),
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}
      >
        <View>
          <Image
            style={{
              height: moderateScale(20),
              width: moderateScale(18),
              resizeMode: 'contain',
            }}
            source={images.stepHistoryOutline}
          />
          <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>{(this.state.data[0].dailyTrackings.indexOf(i) > -1) ? this.state.data[0]?.dailyTrackings[this.state.data[0].dailyTrackings.indexOf(i)]?.count
                                                                                                : '0'}</Text>
          <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Steps</Text>
        </View>
        {this.verticalLine()}
        <View>
          <Image
            style={{
              height: moderateScale(20),
              width: moderateScale(18),
              resizeMode: 'contain',
            }}
            source={images.kcalOutline}
          />
          <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>{(this.state.data[2].dailyTrackings.indexOf(i) > -1) ? this.state.data[2]?.dailyTrackings[this.state.data[2].dailyTrackings.indexOf(i)]?.count
                                                                                                : '0'}</Text>
          <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Floor Climb</Text>
        </View>
        {this.verticalLine()}

        <View>
          <Image
            style={{
              height: moderateScale(20),
              width: moderateScale(18),
              resizeMode: 'contain',
            }}
            source={images.timeOutline}
          />
          <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>{(this.state.data[3].dailyTrackings.indexOf(i) > -1) ? this.state.data[3]?.dailyTrackings[this.state.data[3].dailyTrackings.indexOf(i)]?.count
                                                                                                : '0'}</Text>
          <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Screen Time</Text>
        </View>
        {this.verticalLine()}

        <View>
          <Image
            style={{
              height: moderateScale(20),
              width: moderateScale(18),
              resizeMode: 'contain',
            }}
            source={images.distanceOutline}
          />
          <Text style={{ fontSize: 12, fontWeight: '700', color: AppColors.textDarkGray }}>{(this.state.data[1].dailyTrackings.indexOf(i) > -1) ? this.state.data[1]?.dailyTrackings[this.state.data[1].dailyTrackings.indexOf(i)]?.count
                                                                                                : '0'}</Text>
          <Text style={{ fontSize: 11, fontWeight: '400', color: AppColors.textLightGray }}>Sleep</Text>
        </View>
      </ElevatedView>
    );
  }

  calenderDate(date) {
    const { selectedId } = this.state;
    const isSelected = selectedId === date.id;
    return (
      <TouchableOpacity
        key={date.id}
        style={{
          backgroundColor: isSelected ? AppColors.primaryColor : AppColors.whiteColor,
          width: moderateScale(46),
          height: moderateScale(84),
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: hp(3),
          marginLeft: wp(1.5),
        }}
        onPress={() => this.handleCardPress(date.id)}
      >
        <Text style={{ fontSize: 17, fontWeight: '800', color: isSelected ? AppColors.whiteColor : AppColors.textDarkGray }}>{date.date}</Text>
        <Text style={{ fontSize: 14, fontWeight: '400', color: isSelected ? AppColors.whiteColor : AppColors.textLightGray, marginTop: hp(1) }}>
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: AppColors.lightGray,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.dateView()}
          <View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              {sampleDate.map((date) => this.calenderDate(date))}
            </ScrollView>
          </View>

          {this.historyCardInfo()}
          {this.state?.dates?.map((i, count) =><View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: AppColors.textDarkGray, marginTop: hp(3), marginLeft: wp(5) }}>{i.date}</Text>
            {this.secondCard(i, count, this.state.dates.length)}
          </View>)}
          <View style={{ marginBottom: 20 }}></View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    marginLeft: wp(3),
    marginRight: wp(6),
  },
});

export default History;
