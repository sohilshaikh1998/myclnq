import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { moderateScale, verticalScale } from '../utils/Scaling';
import { AppUtils } from '../utils/AppUtils';
import { AppStyles } from '../shared/AppStyles';
import { AppColors } from '../shared/AppColors';
import ElevatedView from 'react-native-elevated-view';

class HeaderwithBack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title:
        props.routeName === 'UserSignUp' ? (props.isNewUser ? (this.props.userDetail ? 'Complete Profile' : 'SignUp') : 'Registration') : props.title,
    };
  }

  render() {
    return AppUtils.isIphone ? this.renderIOS() : this.renderAndroid();
  }

  renderIOS() {
    const cellWidth = AppUtils.screenWidth / 5;
    return (
      <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={5}>
        {this.state.title == 'Registration' ? (
          <View
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: 'center',
              //backgroundColor: '#f18867',
            }}
          ></View>
        ) : (
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
        )}
        <View style={{ width: cellWidth * 3, height: AppUtils.headerHeight, justifyContent: 'center' }}>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.headerTextIOS}>
            {this.state.title}
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
    if (this.props.routeName == 'QuickRequest') {
      Actions.MainScreen();
    } else {
      Actions.pop();
    }
  }

  navToHomescreen() {
    console.log('CheckRout3: ', this.props.routeName);
    if (this.props.routeName == 'QuickRequest') {
      Actions.MainScreen();
    } else {
      Actions.pop();
    }
  }

  renderAndroid() {
    const cellWidth = AppUtils.screenWidth / 3;

    return (
      <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={0}>
        {this.state.title == 'Registration' ? (
          <View
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: 'center',
              //backgroundColor: '#f18867',
            }}
          ></View>
        ) : (
          <TouchableHighlight
            onPress={() => this.navToHomescreen()}
            underlayColor="transparent"
            style={{
              width: cellWidth,
              height: AppUtils.headerHeight,
              justifyContent: 'center',
              //backgroundColor: '#f18867',
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
        )}

        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: 'center',
          }}
        >
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={
              styles.headerTextIOS
            }
          >
            {this.state.title}
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
    alignSelf:Platform.OS === 'ios' ? 'center' : this.props?.isNewUser && this.props?.userDetail ? 'auto' : 'center' 
  },
});

export default HeaderwithBack;
