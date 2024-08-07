import React from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import { verticalScale, moderateScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import images from '../../utils/images';
import { strings } from '../../locales/i18n';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Actions } from 'react-native-router-flux';

const { height } = Dimensions.get('window');

class AppointmentRequested extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: this.props.amount,
      currency: this.props.currency,
      isWavedOff: this.props.isWavedOff,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      Actions.CountdownTimer({
        requestId: this.props.requestId,
        patientDetails: this.props.patientDetails
      });
    }, 3000);
  }

  _renderConfirmScreen() {
    return (
      <View style={{ backgroundColor: AppColors.whiteColor, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ marginTop: moderateScale(90) }}>
          <Image
            style={{ height: height / 2.6, width: wp(80), borderRadius: hp(8), alignSelf: 'center' }}
            resizeMode={'cover'}
            source={images.walkThrough1}
          />
          <View
            style={{
              marginHorizontal: wp(4),
              marginTop: hp(8),
            }}
          >
            {this.state.isWavedOff ? (
              <></>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AntDesign
                  name="checkcircleo"
                  size={22}
                  style={{
                    color: AppColors.greenColor2,
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}
                />
                <Text
                  style={{
                    marginHorizontal: hp(1),
                    fontSize: hp(2.2),
                    color: AppColors.blackColor,
                    fontFamily: AppStyles.fontFamilyMedium,
                  }}
                >
                  {strings('common.waitingRoom.paymentAuthorization')}
                </Text>
              </View>
            )}

            <Text
              allowFontScaling={false}
              style={{
                fontSize: moderateScale(18),
                fontFamily: AppStyles.fontFamilyDemi,
                color: AppColors.colorHeadings,
                textAlign: 'center',
                marginTop: verticalScale(20),
              }}
            >
              {strings('common.waitingRoom.appointmentReceived')}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: moderateScale(15),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.greyColor,
                lineHeight: hp(2.5),
                marginTop: verticalScale(20),
                textAlign: 'center',
              }}
            >
              {this.state.isWavedOff
                ? strings('common.waitingRoom.confirmTextWaveOff')
                : strings('common.waitingRoom.confirmText', {
                    currency: this.state.currency,
                    amount: this.state.amount,
                  })}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: moderateScale(15),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.blackColor2,
                marginTop: verticalScale(20),
                textAlign: 'center',
              }}
            >
              {strings('common.waitingRoom.nextScreen')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    return <View style={{ flex: 1, backgroundColor: AppColors.whiteColor, paddingBottom: 20 }}>{this._renderConfirmScreen()}</View>;
  }
}

export default AppointmentRequested;
