import { Text, View, Image, StyleSheet } from 'react-native';
import React, { Component } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import ElevatedView from 'react-native-elevated-view';
import images from '../../utils/images';
import { strings } from '../../locales/i18n';

export class DoctorBusy extends Component {
  render() {
    return (
      <View style={{ backgroundColor: AppColors.whiteColor, flex: 1, }}>
        <View style={{ paddingTop: wp(5), marginHorizontal: hp(1) }}>
          <Image
            style={{ height: hp(35), width: wp(80), alignSelf: 'center', marginVertical: hp(10) }}
            resizeMode={'cover'}
            source={images.doctorBusy}
          />
          <Text style={styles.headingStyle}>
          {strings('common.waitingRoom.allDoctorsBusy')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                Actions.reset('DoctorBusy');
                Actions.QuickRequest({ consultType: 'video' });
              }}
            >
              <ElevatedView elevation={4} style={styles.buttonStyle}>
                <Entypo
                  name="video-camera"
                  size={17}
                  style={{
                    color: AppColors.blackColor,
                    paddingRight: hp(1),
                  }}
                />
                <Text style={styles.textStyle}>{strings('common.waitingRoom.videoConsult')}</Text>
              </ElevatedView>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Actions.HomeScreenDash()}>
              <ElevatedView elevation={4} style={styles.buttonStyle}>
                <FontAwesome5
                  name="clinic-medical"
                  size={17}
                  style={{
                    color: AppColors.blackColor,
                    paddingRight: hp(1),
                  }}
                />
                <Text style={styles.textStyle}>{strings('common.waitingRoom.clinicAppointment')}</Text>
              </ElevatedView>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => Actions.MainScreen()}>
            <ElevatedView elevation={4} style={styles.buttonStyle}>
              <Text style={styles.textStyle}>{strings('common.waitingRoom.backHome')}</Text>
            </ElevatedView>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headingStyle: {
    fontSize: hp(2),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.blackColor,
    lineHeight: hp(3),
    marginHorizontal: hp(1),
    marginBottom: hp(8),
  },
  textStyle: {
    fontSize: hp(1.8),
    alignContent: 'center',
    textAlign: 'center',
    fontFamily: AppStyles.fontFamilyDemi,
    color: AppColors.blackColor,
    lineHeight: hp(3),
  },
  buttonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.whiteChange,
    paddingHorizontal: hp(1.5),
    paddingVertical: hp(1.8),
    borderRadius: hp(1),
    margin: hp(1),
  },
});

export default DoctorBusy;
