import React, { Component, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, Dimensions } from 'react-native';
import { moderateScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import images from '../../utils/images';
import * as Progress from 'react-native-progress';
import { AppStyles } from '../../shared/AppStyles';
import Entypo from 'react-native-vector-icons/Entypo';
import { ProgressChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import CustomRingProgress from '../../components/CustomRingProgress';
import AsyncStorage from '@react-native-community/async-storage';
import { GlobalContext } from '../../GlobalContext';
import { googleFitCode } from '../../components/getStepsCount';

//SOHIL_CODE

const { width, height } = Dimensions.get('window');

const data = {
  data: [0.6, 0.8],
};
const chartConfig = {
  backgroundGradientFrom: AppColors.GrayBg,
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: AppColors.GrayBg,
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(255, 72, 72, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};
const propsRings = {
  activeStrokeWidth: 25,
  inActiveStrokeWidth: 25,
  inActiveStrokeOpacity: 0.2,
};

const activityOptions = [
  {
    id: 1,
    imgLeft: images.sleepBk,
    time: 'Yesterday, 10:00 AM',
    progress: 0.5,
    title: 'Sleep Score',
    value: '4678',
    imgHeight: moderateScale(15),
    imgWidth: moderateScale(22),
  },
  {
    id: 2,
    imgLeft: images.HrtBk,
    time: 'Yesterday, 10:00 AM',
    progress: 0.5,
    title: 'Heart Rate',
    value: '4678',
    imgHeight: moderateScale(20),
    imgWidth: moderateScale(23),
  },
  {
    id: 3,
    imgLeft: images.oxygen2,
    time: 'Yesterday, 10:00 AM',
    progress: 0.5,
    title: 'Blood Oxygen',
    value: '4678',
    imgHeight: moderateScale(20),
    imgWidth: moderateScale(20),
  },
  {
    id: 4,
    imgLeft: images.thermo,
    time: 'Yesterday, 10:00 AM',
    progress: 0.5,
    title: 'Temperature',
    value: '4678',
    imgHeight: moderateScale(26),
    imgWidth: moderateScale(25),
  },
  // {
  //   id: 5,
  //   imgLeft: images.footStep,
  //   time: 'Yesterday, 10:00 AM',
  //   progress: 0.5,
  //   title: 'Steps Done',
  //   value: '4678',
  //   imgHeight: moderateScale(19),
  //   imgWidth: moderateScale(18),
  // },
  // {
  //   id: 6,
  //   imgLeft: images.footStep,
  //   time: 'Yesterday, 10:00 AM',
  //   progress: 0.5,
  //   title: 'Blood Pressure',
  //   value: '4678',
  //   imgHeight: moderateScale(19),
  //   imgWidth: moderateScale(18),
  // },
  // {
  //   id: 7,
  //   imgLeft: images.monitorHrRate,
  //   time: 'Yesterday, 10:00 AM',
  //   progress: 0.5,
  //   title: 'Resting Heart Rate',
  //   value: '4678',
  //   imgHeight: moderateScale(23),
  //   imgWidth: moderateScale(22),
  // },
];
const footerItem = [
  {
    id: 5,
    imgLeft: images.footStep,
    time: 'Yesterday, 10:00 AM',
    progress: 0.5,
    title: 'Steps Done',
    value: '4678',
    imgHeight: moderateScale(19),
    imgWidth: moderateScale(18),
  },
  {
    id: 6,
    imgLeft: images.report,
    time: 'Yesterday, 10:00 AM',
    progress: 0.5,
    title: 'Blood Pressure',
    value: '4678',
    imgHeight: moderateScale(27),
    imgWidth: moderateScale(27),
  },
  {
    id: 7,
    imgLeft: images.monitorHrRate,
    time: 'Yesterday, 10:00 AM',
    progress: 0.5,
    title: 'Resting Heart Rate',
    value: '4678',
    imgHeight: moderateScale(23),
    imgWidth: moderateScale(22),
  },
];
class BodyBeatDash extends Component {
  static contextType = GlobalContext;
  constructor(props) {
    super(props);

    this.state = {
      temperature: 0,
      ScreenTime: 0,
      bpL: 0,
      bpH: 0,

      selectedActivities: [],
      totalSteps: 1,
      isSmartWatchConnect: false,
      floorClimb: 0,
    };
    this.cardView = this.cardView.bind(this);
    this.mainCardView = this.mainCardView.bind(this);
  }

  async stepsData() {
    await googleFitCode();
    const res = (await AsyncStorage.getItem('stepCount')) || 1;
    this.setState({ totalSteps: res });
    const floors = res / 1500;
    this.setState({ floorClimb: parseInt(floors) });
  }

  async componentDidMount() {
    // Anurag's code //

    const selectedDeviceIdFromAsync = await AsyncStorage.getItem('deviceId');
    if (!selectedDeviceIdFromAsync) {
      this.setState({ isSmartWatchConnect: false });
      this.stepsData();
    } else {
      this.setState({ isSmartWatchConnect: true });
    }

    ///

    const selectedActivities = JSON.parse(await AsyncStorage.getItem('selectedActivities'));
    this.setState({
      selectedActivities: [...selectedActivities],
    });
  }

  calculateProgress = (value, goalValue) => {
    const numValue = Number(goalValue);

    if (isNaN(numValue) || numValue === 0) {
      console.log('Invalid input or division by zero');
      return 0;
    }

    const actualValue = value / numValue;
    return actualValue;
  };

  mainCardView() {
    const { globalData } = this.context;

    let stepValue, stepValueClimb, sleepScore;
    if (!this.state.isSmartWatchConnect) {
      //Anurag's Code//
      stepValue = this.calculateProgress(this.state.totalSteps, 7000);
      stepValueClimb = this.state.selectedActivities.includes(2)
        ? this.calculateProgress(parseInt(this.state.totalSteps / 1500), 7000)
        : this.state.selectedActivities.includes(3)
        ? this.calculateProgress(Number(globalData.sleepGlobal), 600)
        : this.calculateProgress(globalData.screenTime, 600);
      sleepScore = this.calculateProgress(Number(globalData.sleepGlobal), 600);
    } else {
      //SOHIL_CODE

      stepValue = this.calculateProgress(globalData.stepGlobal, 7000);
      stepValueClimb = this.state.selectedActivities.includes(2)
        ? this.calculateProgress(globalData.stepClimbGlobal, 1000)
        : this.state.selectedActivities.includes(3)
        ? this.calculateProgress(Number(globalData.sleepGlobal), 600)
        : this.calculateProgress(globalData.screenTime, 600);
      sleepScore = this.calculateProgress(Number(globalData.sleepGlobal), 600);
    }

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          Actions.History();
        }}
      >
        <View style={styles.mainCard}>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: hp(2) }} key={stepValueClimb}>
            <CustomRingProgress
              radius={100}
              strokeWidth={25}
              progress={Number(stepValue)}
              percentage={Math.round(Number(stepValue) * 100)}
              trackColor={AppColors.primaryColor}
            />
            <View style={{ position: 'absolute' }}>
              <CustomRingProgress
                radius={70}
                strokeWidth={25}
                progress={Number(stepValueClimb)}
                percentage={Math.round(Number(stepValueClimb) * 100)}
                trackColor={AppColors.redTrackColor}
              />
            </View>
            <View style={{ alignItems: 'center', marginTop: moderateScale(56), position: 'absolute' }}>
              <Image
                style={{
                  height: moderateScale(17),
                  width: moderateScale(18),
                  resizeMode: 'contain',
                }}
                source={images.stepLeg}
              />
              <Text style={{ textAlign: 'center', textTransform: 'uppercase', fontWeight: '700', fontSize: 10, color: AppColors.blackColor5 }}>
                TODAY
              </Text>
              <Text style={{ textAlign: 'center', fontWeight: '800', fontSize: 14, color: AppColors.blackColor4 }}>
                {this.state.isSmartWatchConnect ? globalData.stepGlobal : this.state.totalSteps}
              </Text>
              <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 12, color: AppColors.checkTickRed }}>Goal: 7000{'\n'}steps</Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: 'transparent',
              // marginTop: hp(5.5),
            }}
          >
            <Image
              style={{
                height: moderateScale(71),
                width: moderateScale(71),
                resizeMode: 'contain',
                position: 'absolute',
                left: moderateScale(130),
                top: moderateScale(10),
              }}
              source={images.crossHair}
            />

            <View style={styles.mainCardRowCon}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    style={{
                      height: moderateScale(18),
                      width: moderateScale(18),
                      resizeMode: 'contain',
                    }}
                    source={images.footStep}
                  />
                  <Text style={styles.mainCardVal}>{this.state.isSmartWatchConnect ? globalData.stepGlobal : this.state.totalSteps}</Text>
                  <Text style={styles.mainCardTxt}>Steps</Text>
                </View>
                <Text style={styles.mainCardDesc}>Total Steps completed</Text>
              </View>
              {/* ----------- */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    style={{
                      height: moderateScale(31),
                      width: moderateScale(27),
                      resizeMode: 'contain',
                    }}
                    source={images.sleepRed}
                  />
                  <Text style={styles.mainCardValRed}>{Math.round(sleepScore * 100)}</Text>
                  <Text style={styles.mainCardTxt}>/100</Text>
                </View>

                <Text style={styles.mainCardDesc}>Average Sleep Score</Text>
              </View>
            </View>

            {/* -------------- */}
            <View style={[styles.mainCardRowCon, { marginTop: hp(1) }]}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    style={{
                      height: moderateScale(18),
                      width: moderateScale(18),
                      resizeMode: 'contain',
                    }}
                    source={images.stairClimb}
                  />
                  <Text style={styles.mainCardVal}>{this.state.isSmartWatchConnect ? globalData.stepClimbGlobal : this.state.floorClimb}</Text>
                  <Text style={styles.mainCardTxt}>Floors Climb</Text>
                </View>

                <Text style={styles.mainCardDesc}>Total Floors Climbing</Text>
              </View>

              {/* ------------------------ */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    style={{
                      height: moderateScale(31),
                      width: moderateScale(27),
                      resizeMode: 'contain',
                    }}
                    source={images.sleepRed}
                  />
                  <Text style={styles.mainCardValRed}>{this.state.ScreenTime}</Text>
                  <Text style={styles.mainCardTxt}>/100</Text>
                </View>

                <Text style={styles.mainCardDesc}>Average Screen Time</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  cardView({ item }) {
    const { globalData } = this.context;
    const value =
      item?.title == 'Sleep Score'
        ? this.calculateProgress(globalData.sleepGlobal, 600)
        : item?.title == 'Blood Oxygen'
        ? this.calculateProgress(globalData.oxygenLevelGlobal, 120)
        : item?.title == 'Steps Done'
        ? this.calculateProgress(globalData.stepGlobal, 6000)
        : 0;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: AppColors.whiteColor,
          width: moderateScale(160),
          height: moderateScale(160),
          borderRadius: 5,
          marginHorizontal: wp(1.8),
          marginVertical: hp(1),
          elevation: 3,
        }}
        onPress={Actions.History}
        // onPress={Actions.Awards}
      >
        <View style={{ flexDirection: 'row', marginTop: moderateScale(8), alignItems: 'center', marginLeft: moderateScale(10) }}>
          <Image
            style={{
              height: item?.imgHeight,
              width: item?.imgWidth,
              resizeMode: 'contain',
            }}
            source={item?.imgLeft}
          />
          <View style={{ marginLeft: moderateScale(6) }}>
            <Text style={{ fontSize: 13, color: AppColors.textDarkGray, fontWeight: '500', textAlign: 'left' }}>{item?.title}</Text>
            <Text style={{ fontSize: 10, color: AppColors.textLightGray, fontWeight: '400', textAlign: 'left' }}>{item?.time}</Text>
          </View>
        </View>
        <Progress.Circle
          size={moderateScale(81)}
          progress={value}
          thickness={6}
          color={AppColors.primaryColor}
          unfilledColor={AppColors.unfilledGray}
          borderWidth={0}
          showsText={true}
          formatText={() => `${Math.round(value * 100)}%`}
          textStyle={styles.circleSubTextRed}
          strokeCap={'round'}
          style={{ alignSelf: 'center', marginTop: hp(2.5) }}
        >
          {/* <View style={styles.circleTextContainer}>
            <Text style={styles.circleSubTextDark}>90</Text>
            <Text style={styles.circleSubTextLight}>/100</Text>
          </View> */}
          {/* <Text style={styles.circleSubTextRed}>90%</Text> */}
          {/* <Text style={styles.circleSubTextRed}>4029</Text> */}
        </Progress.Circle>

        <View
          style={{
            flexDirection: 'row',
            marginTop: hp(2),
            alignItems: 'center',
            alignSelf: 'center',
          }}
        ></View>
      </TouchableOpacity>
    );
  }
  cardViewHrRate({ item }) {
    const { globalData } = this.context;
    return (
      <View
        style={{
          backgroundColor: AppColors.whiteColor,
          width: moderateScale(160),
          height: moderateScale(160),
          borderRadius: 5,
          marginHorizontal: wp(1.8),
          marginVertical: hp(1),
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', marginTop: moderateScale(8), alignItems: 'center', marginLeft: moderateScale(10) }}>
          <Image
            style={{
              height: item?.imgHeight,
              width: item?.imgWidth,
              resizeMode: 'contain',
            }}
            source={item?.imgLeft}
          />
          <View style={{ marginLeft: moderateScale(6) }}>
            <Text style={{ fontSize: 13, color: AppColors.textDarkGray, fontWeight: '500', textAlign: 'left' }}>{item?.title}</Text>
            <Text style={{ fontSize: 10, color: AppColors.textLightGray, fontWeight: '400', textAlign: 'left' }}>{item?.time}</Text>
          </View>
        </View>
        {item.id === 4 ? (
          <>
            <Image
              style={{
                height: moderateScale(35),
                width: moderateScale(83),
                resizeMode: 'contain',
                alignSelf: 'center',
                marginTop: hp(4),
              }}
              source={images.temperatureIco}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp(3.5), marginTop: hp(1) }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: AppColors.textDarkGray }}>{this.state.temperature}</Text>
              <View style={{ marginLeft: wp(2) }}>
                <Entypo name="circle" size={6} />
                <Text style={{ fontSize: 14, fontWeight: '400', color: AppColors.textLightGray, marginTop: hp(0.7), marginLeft: wp(1) }}>
                  Celsius
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Image
              style={{
                height: moderateScale(59),
                width: moderateScale(138),
                resizeMode: 'contain',
                alignSelf: 'center',
                marginTop: hp(2),
              }}
              source={item.id === 2 ? images.heartRateIco : images.restingHrRt}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp(3.5), marginTop: hp(1) }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: AppColors.textDarkGray }}>{globalData.heartRateGlobal}</Text>
              <Text style={{ fontSize: 14, fontWeight: '400', color: AppColors.textLightGray, marginLeft: wp(2) }}>BPM</Text>
            </View>
          </>
        )}
      </View>
    );
  }

  cardBigView({ item }) {
    return (
      <View
        style={{
          backgroundColor: AppColors.whiteColor,
          width: moderateScale(160),
          height: moderateScale(335),
          borderRadius: 5,
          marginHorizontal: wp(1.8),
          marginVertical: hp(1),
          elevation: 3,
          flex: 1,
        }}
      >
        <View style={{ flexDirection: 'row', marginTop: moderateScale(8), alignItems: 'center', marginLeft: moderateScale(10) }}>
          <Image
            style={{
              height: item?.imgHeight,
              width: item?.imgWidth,
              resizeMode: 'contain',
            }}
            source={item?.imgLeft}
          />
          <View style={{ marginLeft: moderateScale(6) }}>
            <Text style={{ fontSize: 13, color: AppColors.textDarkGray, fontWeight: '500', textAlign: 'left' }}>{item?.title}</Text>
            <Text style={{ fontSize: 10, color: AppColors.textLightGray, fontWeight: '400', textAlign: 'left' }}>{item?.time}</Text>
          </View>
        </View>

        {/* BP value */}
        <View style={{ alignSelf: 'center', width: moderateScale(90), height: hp(20), marginTop: hp(3), justifyContent: 'space-between' }}>
          <View style={{ alignSelf: 'flex-start' }}>
            <Text style={styles.bpVal}>{this.state.bpH}</Text>
            <Text style={styles.bpMetric}>mmHg</Text>
          </View>
          <Image
            style={{
              height: moderateScale(60),
              resizeMode: 'contain',
              alignSelf: 'center',
              marginTop: moderateScale(-10),
            }}
            source={images.slantingLine}
          />
          <View style={{ alignSelf: 'flex-end', marginTop: hp(-5) }}>
            <Text style={styles.bpVal}>{this.state.bpL}</Text>
            <Text style={styles.bpMetric}>mmHg</Text>
          </View>
        </View>
        <Image
          style={{
            height: moderateScale(100),
            width: moderateScale(109),
            resizeMode: 'contain',
            alignSelf: 'center',
            marginTop: hp(3),
          }}
          source={images.bloodPs}
        />
        <View
          style={{
            flexDirection: 'row',
            marginTop: hp(2),
            alignItems: 'center',
            alignSelf: 'center',
          }}
        ></View>
      </View>
    );
  }
  renderItem = ({ item }) => {
    if (item.id === 6) {
      return this.cardBigView({ item });
    } else if (item.id === 2 || item.id === 7 || item.id === 4) {
      return this.cardViewHrRate({ item });
    }
    return this.cardView({ item });
  };
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: AppColors.lightBgPink,
        }}
      >
        {this.mainCardView()}
        <FlatList
          data={activityOptions}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListFooterComponentStyle={{ paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
              <View>
                {this.cardView({ item: footerItem[0] })}
                {this.cardViewHrRate({ item: footerItem[2] })}
              </View>
              <View>{this.cardBigView({ item: footerItem[1] })}</View>
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  circleTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    marginLeft: moderateScale(23),
    marginTop: moderateScale(30),
  },
  circleSubTextRed: {
    position: 'absolute',
    marginLeft: moderateScale(28),
    marginTop: moderateScale(30),
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primaryColor,
  },
  circleTitle: {
    fontSize: 10,
    color: AppColors.blackColor5,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  circleSubText: {
    fontSize: 20,
    color: AppColors.blackColor4,
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: AppStyles.fontFamilyRegular,
  },
  listContent: {
    paddingBottom: hp(10),
    alignSelf: 'center',
    marginTop: hp(1),
  },
  row: {
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },

  mainCard: {
    backgroundColor: AppColors.GrayBg,
    width: wp(90),
    alignSelf: 'center',
    marginTop: hp(2),
    borderRadius: 10,
    elevation: 4,
    // height: moderateScale(271),
    height: moderateScale(310),
    marginBottom: hp(1),
  },
  mainCardVal: { marginLeft: moderateScale(2), fontSize: 20, color: AppColors.textDarkGray, fontWeight: '500' },
  mainCardTxt: { marginLeft: moderateScale(2), fontSize: 14, color: AppColors.textLightGray, fontWeight: '400' },
  mainCardDesc: { marginLeft: moderateScale(2), fontSize: 10, color: AppColors.blackColor4, fontWeight: '400' },
  mainCardValRed: { marginLeft: moderateScale(2), fontSize: 20, color: AppColors.colorHeadings, fontWeight: '500' },
  mainCardRowCon: { flexDirection: 'row', justifyContent: 'space-between', width: moderateScale(270), alignSelf: 'center' },
  circleSubTextDark: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textDarkGray,
  },
  circleSubTextLight: {
    fontSize: 10,
    fontWeight: '400',
    color: AppColors.textLightGray,
  },
  bpVal: {
    fontSize: 24,
    color: AppColors.textDarkGray,
    fontWeight: '700',
    textAlign: 'center',
  },
  bpMetric: {
    fontSize: 14,
    color: AppColors.textLightGray,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default BodyBeatDash;
