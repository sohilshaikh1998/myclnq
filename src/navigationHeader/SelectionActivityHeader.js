import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { moderateScale, verticalScale } from '../utils/Scaling';
import { AppUtils } from '../utils/AppUtils';
import { AppStyles } from '../shared/AppStyles';
import { AppColors } from '../shared/AppColors';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import careGiverHomeScreenStyle from '../screens/caregiver/caregiverHome/caregiverHomeScreenStyle';
import images from './../utils/images';
import ElevatedView from 'react-native-elevated-view';

class SelectionActivityHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHome: true,
    };
  }

  wagonSettings() {
    Actions.Settings();
  }

  render() {
    return AppUtils.isIphone ? this.renderIOS() : this.renderAndroid();
  }

  renderIOS() {
    return (
      <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={5}>
        <TouchableHighlight
          onPress={() => this.goBack()}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          <Image
            style={{
              height: moderateScale(30),
              width: moderateScale(30),
              marginTop: AppUtils.isX ? 16 + 18 : 16,
              marginLeft: 8,
            }}
            source={require('../../assets/images/blackarrow.png')}
          />
        </TouchableHighlight>
        <View style={{ width: cellWidth * 3, height: AppUtils.headerHeight, justifyContent: 'center' }}>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: AppUtils.isX ? 16 + 18 : 16,
          }}
        ></View>
      </ElevatedView>
    );
  }

  goBack() {
    Actions.MainScreen();
  }

  navToHomescreen() {
    Actions.MainScreen();
  }

  renderAndroid() {
    AppUtils.console('sdfvdsedv', this.props);
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={0}>
        <TouchableHighlight
          onPress={() => this.goBack()}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          <Image
            style={{
              height: moderateScale(30),
              width: moderateScale(30),
              marginTop: AppUtils.isX ? 16 + 18 : 0,
              marginLeft: 8,
            }}
            source={require('../../assets/images/blackarrow.png')}
          />
        </TouchableHighlight>

        <View
          style={{
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          <Text allowFontScaling={false} numberOfLines={1} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>

        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        ></View>
      </ElevatedView>
    );
  }
}

const styles = StyleSheet.create({
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
  },
  headerText: {
    color: AppColors.blackColor,
    marginLeft: moderateScale(100),
    marginTop: Platform.OS === 'ios' ? 16 : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  headerTextIOS: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === 'ios' ? 16 : verticalScale(5),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(14),
    alignSelf: Platform.OS === 'ios' ? 'center' : this.props?.isNewUser && this.props?.userDetail ? 'auto' : 'center',
  },
});

export default SelectionActivityHeader;
