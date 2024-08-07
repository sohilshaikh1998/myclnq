import React from 'react';
import { Dimensions, Image, Platform, TouchableOpacity, Text, TouchableHighlight, View, StyleSheet } from 'react-native';

import { Actions } from 'react-native-router-flux';
import { AppStyles } from '../../shared/AppStyles';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { AppUtils } from '../../utils/AppUtils';
import { IndicatorViewPager, PagerDotIndicator } from 'react-native-best-viewpager';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { strings } from '../../locales/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import { AppStrings } from '../../shared/AppStrings';

const { width, height } = Dimensions.get('window');

class HelpTour extends React.Component {
  constructor(props) {
    AppUtils.analyticsTracker('Help Tour');
    super();
    super(props);
  }

  _renderFirst() {
    return (
      <View>
        <View style={{ flexDirection: 'column' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
            }}
          >
            <View style={styles.imgContainer}>
            <Image
              style={styles.img}
              resizeMode="cover"
              source={require('../../../assets/images/location_1.png')}
            />
            </View>
       
          </View>
          <View
            style={{
              width: width - moderateScale(50),
              marginLeft: moderateScale(25),
              marginTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
            }}
          >
            <Text style={styles.header}>{strings('doctor.helpTour.clinicNearBy')}</Text>

            <View style={styles.secondaryContainer}>
              <Text style={styles.bulletPoint}>{'\u2022'}</Text>

              <View
                style={{
                  marginTop: verticalScale(15),
                  marginLeft: verticalScale(4),
                }}
              >
                <Text style={styles.secondaryPoints}>{strings('doctor.helpTour.findClinics')}</Text>
              </View>
            </View>

            <View style={styles.thirdContainer}>
              <Text style={styles.bulletPoint}>{'\u2022'}</Text>

              <View
                style={{
                  marginTop: verticalScale(15),
                  marginLeft: verticalScale(4),
                }}
              >
                <Text style={styles.secondaryPoints}>{strings('doctor.helpTour.qualityHealth')}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderSecond() {
    return (
      <View>
        <View style={{ flexDirection: 'column' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
            }}
          >
            <View style={styles.imgContainer}>
            <Image
              style={styles.img}
              resizeMode="cover"
              source={require('../../../assets/images/appointment.png')}
            />
            </View>
          
          </View>
          <View
            style={{
              width: width - moderateScale(50),
              marginLeft: moderateScale(25),
              marginTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
            }}
          >
            <Text style={styles.header}>{strings('doctor.helpTour.guaranteAppoint')}</Text>
            <View style={styles.secondaryContainer}>
              <Text style={styles.bulletPoint}>{'\u2022'}</Text>
              <View
                style={{
                  marginTop: verticalScale(15),
                  marginLeft: verticalScale(4),
                }}
              >
                <Text style={styles.secondaryPoints}>{strings('doctor.helpTour.viewDoctorSlot')}</Text>
              </View>
            </View>

            <View style={styles.thirdContainer}>
              <Text style={styles.bulletPoint}>{'\u2022'}</Text>

              <View
                style={{
                  marginTop: verticalScale(15),
                  marginLeft: verticalScale(4),
                }}
              >
                <Text style={styles.secondaryPoints}>{strings('doctor.helpTour.manageappointments')}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderThird() {
    return (
      <View>
        <View style={{ flexDirection: 'column' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
            }}
          >
            <View style={styles.imgContainer}>
              <Image style={styles.img} resizeMode="cover" source={require('../../../assets/images/medical-services.png')} />
            </View>
          </View>

          <View
            style={{
              width: width - moderateScale(50),
              marginLeft: moderateScale(25),
              marginTop: verticalScale(20),
            }}
          >
            <Text style={styles.header}>{strings('doctor.helpTour.medicalServices')}</Text>
            <View style={styles.secondaryContainer}>
              <Text style={styles.bulletPoint}>{'\u2022'}</Text>

              <View style={{ marginTop: verticalScale(15), marginLeft: verticalScale(4) }}>
                <Text style={styles.secondaryPoints}>
                  {/* {strings('doctor.helpTour.getNotif')} */}
                  Ambulance: Book an ambulance instantly or schedule service in advance.
                </Text>
              </View>
            </View>

            <View style={styles.secondaryContainer}>
              <Text style={styles.bulletPoint}>{'\u2022'}</Text>

              <View style={{ marginTop: verticalScale(15), marginLeft: verticalScale(4) }}>
                <Text style={styles.secondaryPoints}>
                  {/* {strings('doctor.helpTour.getNotif')} */}
                  House call: Bringing convenience to the mobility bound patients & Geriartric group.
                </Text>
              </View>
            </View>

            <View style={styles.secondaryContainer}>
              <Text style={styles.bulletPoint}>{'\u2022'}</Text>

              <View style={{ marginTop: verticalScale(15), marginLeft: verticalScale(4) }}>
                <Text style={styles.secondaryPoints}>
                  {/* {strings('doctor.helpTour.getNotif')} */}
                  Caregiver: Assistance in daily activities, preventing falls and injuries providing emotional support and companionship.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            alignSelf: 'flex-end',
            height: verticalScale(170),
            marginTop: hp(10),
            width: wp(100),
          }}
        >
          <TouchableOpacity onPress={() => this.homeScreen()} underlayColor="transparent"></TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderFourth() {
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
          }}
        >
          <View style={styles.imgContainer}>
            <Image style={styles.img} resizeMode="cover" source={require('../../../assets/images/remote-monitoring.png')} />
          </View>
        </View>

        <View
          style={{
            width: width - moderateScale(50),
            marginLeft: moderateScale(25),
            marginTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
          }}
        >
          <Text style={styles.header}>{strings('doctor.helpTour.remoteMonitoring')}</Text>

          <View style={styles.secondaryContainer}>
            <Text style={styles.bulletPoint}>{'\u2022'}</Text>

            <View style={{ marginTop: verticalScale(15), marginLeft: verticalScale(4) }}>
              <Text
                style={{
                  fontSize: moderateScale(16),
                  fontFamily: AppStyles.fontFamilyMedium,
                  color: AppColors.textGray,
                }}
              >
                Enabling chronic care management remotely.
              </Text>
            </View>
          </View>
          <View style={styles.secondaryContainer}>
            <Text style={styles.bulletPoint}>{'\u2022'}</Text>

            <View style={{ marginTop: verticalScale(15), marginLeft: verticalScale(4) }}>
              <Text style={styles.secondaryPoints}>Send health data to your clinicians through wearables or remote monitoring devices.</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            alignSelf: 'flex-end',
            // height: verticalScale(120),
            marginTop: hp(5),
            width: wp(100),
          }}
        >
          <TouchableOpacity onPress={() => this.homeScreen()} underlayColor="transparent">
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingRight: moderateScale(12),
                paddingLeft: moderateScale(12),
                height: verticalScale(30),
                borderRadius: moderateScale(15),
                alignSelf: 'center',
                marginBottom: moderateScale(7),
                marginRight: wp(2),
                backgroundColor: AppColors.colorHeadings,
              }}
            >
              <Text
                style={{
                  fontSize: AppUtils.isIphone ? moderateScale(15) : moderateScale(12),
                  fontFamily: AppStyles.fontFamilyMedium,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: AppColors.whiteColor,
                  textAlign: 'center',
                }}
              >
                {strings('doctor.helpTour.letStart')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async homeScreen() {
    // Actions.HomeScreenDash();
    await AsyncStorage.setItem(AppStrings.contracts.firstTimeUser, JSON.stringify('false'));
    Actions.LoginOptions();
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
        <IndicatorViewPager testID="HelpTour" style={{ flex: 0.95 }} indicator={this._renderDotIndicator()}>
          {this._renderSecond()}
          {this._renderFirst()}

          {this._renderThird()}
          {this._renderFourth()}
        </IndicatorViewPager>
      </View>
    );
  }

  _renderDotIndicator() {
    return (
      <PagerDotIndicator
        selectedDotStyle={{
          backgroundColor: AppColors.primaryColor,
          width: verticalScale(20),
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          alignSelf: 'flex-start',
        }}
        dotStyle={{ backgroundColor: AppColors.radioBorderColor }}
        pageCount={4}
        titles={strings('doctor.helpTour.next')}
      />
    );
  }
}

const styles = StyleSheet.create({
  imgContainer: {
    backgroundColor: 'rgb(248,248,248)',
    overflow: 'hidden',
    //  flex:1,
    height: 330,
    width: 330,
    //  backgroundColor:'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 165,
    marginTop:verticalScale(30)

  },
  img: {
    display: 'flex',
    width: 220,
    height: 220,
    borderRadius: 220 / 2,
  },
  secondaryContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  thirdContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    fontSize: moderateScale(16),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.primaryColor,
  },
  secondaryPoints: {
    fontSize: moderateScale(16),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.textGray,
  },
  header: {
    fontSize: moderateScale(20),
    fontFamily: AppStyles.fontFamilyBold,
    color: AppColors.primaryColor,
  },
});

export default HelpTour;
