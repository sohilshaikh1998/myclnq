import React from 'react';
import { View, Text, Image, Dimensions, NativeEventEmitter, Alert, Platform } from 'react-native';

import { verticalScale, moderateScale } from '../../utils/Scaling';

const { height } = Dimensions.get('window');
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import SHButtonDefault from '../../shared/SHButtonDefault';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import images from '../../utils/images';
import { strings } from '../../locales/i18n';
import config from '../../../config';
import ProgressLoader from 'rn-progress-loader';
import { Actions } from 'react-native-router-flux';
import ZoomUs from 'react-native-zoom-us';
// import RNZoomUsBridge, { RNZoomUsBridgeEventEmitter } from '@mokriya/react-native-zoom-us-bridge';
import CachedImage from '../../cachedImage/CachedImage';
import { AppUtils } from '../../utils/AppUtils';
import { SHApiConnector } from '../../network/SHApiConnector';

class DoctorAssigned extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doctorInfo: '',
      patientDetails: '',
    };
  }

  componentDidMount() {
    // console.log('CheckDoctorAssigned', this.props.doctorInfo);
    let doctorData = this.props.doctorInfo;
    let patientData = this.props.patientDetails;
    this.setState({
      doctorInfo: doctorData,
      patientDetails: patientData,
    });
    this.initZoom();
  }

  async initZoom() {
    // if (RNZoomUsBridge) {
    //   try {
    //     await RNZoomUsBridge.initialize(config.zoom.ZOOM_APP_KEY, config.zoom.ZOOM_SECRET_KEY)
    //       .then()
    //       .catch((err) => {
    //         console.warn(err);
    //         Alert.alert('error!', err.message);
    //       });
    //   } catch (e) {
    //     console.log('CheckZoomInitError', e);
    //   }
    // }

    // const jwtToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCLVdhMmR0d1JuNjNKOXR3RzZIMEpRIiwiZXhwIjoxNzE1MDE5NjY3MzUxLCJpYXQiOjE3MTUwMTkxNjd9.hFo8f-OjPI2pJhJn5DR0figoOj-PJC7ggZvTDuuhuMU'

    // await ZoomUs.initialize({
    //   clientKey: config.zoom.CLIENT_ID,
    //   clientSecret: config.zoom.CLIENT_SECRET,
    //   jwtToken:jwtToken
    // })
  }

  _renderFirst() {
    return (
      <View style={{ backgroundColor: AppColors.whiteColor, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ marginTop: moderateScale(70), justifyContent: 'center', alignItems: 'center' }}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: moderateScale(20),
              fontFamily: AppStyles.fontFamilyDemi,
              color: AppColors.primaryColor,
              textAlign: 'center',
              lineHeight: hp(4),
            }}
          >
            {strings('common.waitingRoom.doctorAssigned')} {'\n'}
            {strings('common.waitingRoom.toYou')}
          </Text>

          <CachedImage
            style={{
              width: hp(25),
              height: hp(25),
              borderRadius: 3000,
              marginTop: hp(2),
              alignSelf: 'center',
            }}
            source={{ uri: AppUtils.handleNullImg(this.state.doctorInfo.profilePic) }}
          />

          <View
            style={{
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginHorizontal: wp(5),
              marginTop: hp(10),
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(18),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.blackColor,
                marginTop: verticalScale(15),
                textAlign: 'center',
              }}
            >
              Dr. {this.state.doctorInfo.doctorName} ({this.state.doctorInfo.departmentName})
            </Text>
            <Text
              style={{
                fontSize: moderateScale(16),
                fontFamily: AppStyles.fontFamilyMedium,
                color: AppColors.grey,
                marginTop: verticalScale(10),
                textAlign: 'center',
              }}
            >
              {strings('common.waitingRoom.myclnq')}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: moderateScale(100),
          }}
        >
          <SHButtonDefault
            btnText={strings('common.waitingRoom.joinCall')}
            style={{ borderRadius: wp(2) }}
            btnTextColor={AppColors.whiteColor}
            btnPressBackground={AppColors.instantVideoTheme}
            onBtnClick={() => this.joinCall(this.state.doctorInfo)}
          />
        </View>
      </View>
    );
  }

  async joinCall(data) {
    console.log('CheckZoomInfo', data);
    if (data.meetingId) {
      try {
        this.setState({ isLoading: true });
        let meetingStatus = await this.getMeetingStatus(data.meetingId);

        if (
          meetingStatus.code &&
          (meetingStatus.code === 3001 || meetingStatus.code === 1001 || meetingStatus.code === 3000 || meetingStatus.code === 1001)
        ) {
          this.setState({ isLoading: false });
          setTimeout(() => {
            Alert.alert(strings('doctor.alertTitle.consultationCompleted'), strings('doctor.alertMsg.consultationCompleted'), [
              {
                text: 'OK',
                onPress: () => {
                  Actions.MainScreen();
                },
              },
            ]);
          }, 1000);
        } else {
          if (meetingStatus.status === 'waiting') {
            this.setState({ isLoading: false });
            setTimeout(() => {
              Alert.alert('', strings('doctor.alertMsg.consultaionNotStarted'));
            }, 1000);
          } else {
            // await RNZoomUsBridge.initialize(config.zoom.ZOOM_APP_KEY, config.zoom.ZOOM_SECRET_KEY)
            //   .then((result) => {
            //     console.log('CheckZoomInitializeResult2', result);
            //     this.setState({ isLoading: false });
            //     if (Platform.OS == 'android') {
            //       setTimeout(() => {
            //         Actions.MainScreen();
            //       }, 2000);
            //     }
            //   })
            //   .catch((err) => {
            //     Alert.alert(strings('common.waitingRoom.somethingWentWrong'), err.message);
            //   });
            // await RNZoomUsBridge.joinMeeting(
            //   data.meetingId,
            //   this.state.patientDetails.firstName + ' ' + this.state.patientDetails.lastName,
            //   data.password
            // )
            //   .then((result) => {
            //     this.setState({ isLoading: false });
            //     setTimeout(() => {
            //       Actions.MainScreen();
            //     }, 2000);
            //   })
            //   .catch((err) => {
            //     console.log('err1', err);
            //     this.setState({ isLoading: false });
            //     Alert.alert(strings('common.waitingRoom.somethingWentWrong'), err.message);
            //   });
     


            const zoomData = {
              meetingId:  data.meetingId,
              role: 0,
            };

    


   

            const zoomSign = await SHApiConnector.getZoomSignature(zoomData);

            await ZoomUs.initialize({
              clientKey: config.zoom.CLIENT_ID,
              clientSecret: config.zoom.CLIENT_SECRET,
              jwtToken:zoomSign?.data?.signature,
              disableShowVideoPreviewWhenJoinMeeting:false,
              domain:config.zoom.DOMAIN,
            }).then(response=>{
              console.log(response)
            }).catch(err=>{
              console.log(err,'error')
            })
            await ZoomUs.joinMeeting({
              userName: this.state.patientDetails.firstName + ' ' + this.state.patientDetails.lastName,
              meetingNumber: data.meetingId,
              autoConnectAudio: true,
              password: data.password,
              // noVideo:false,
            }) 
               .then(async(result) => {
                  this.setState({ isLoading: false });
                  await ZoomUs.muteMyVideo(false).catch(error=>{
                    console.log(error,'error in mute')
                  })
                  setTimeout(() => {
                    Actions.MainScreen();
                  }, 2000);
                })
                .catch((err) => {
                  console.log('err1', err);
                  this.setState({ isLoading: false });
                  Alert.alert(strings('common.waitingRoom.somethingWentWrong'), err.message);
                });
        
          }
        }
      } catch (error) {
        console.log(error,'error')
        this.setState({ isLoading: false });
        alert(strings('common.waitingRoom.somethingWentWrong'));
      }
    }
  }

  async getMeetingStatus(meetingId) {
    this.setState({ isLoading: true });
    let zoomOAuth = await SHApiConnector.getZoomAccessToken(config.zoom.ACCOUNT_ID);
    this.setState({ isLoading: false });
    console.log('CheckAccessToken', zoomOAuth.data.access_token);

    let url = `https://api.zoom.us/v2/meetings/${meetingId}`;

    return await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${zoomOAuth.data.access_token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log('CheckJson', json);
        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
        {this._renderFirst()}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }
}

export default DoctorAssigned;
