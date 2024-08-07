import React from 'react';
import {Alert, Platform, StyleSheet, Text, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {SHApiConnector} from "../network/SHApiConnector";
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import ElevatedView from 'react-native-elevated-view'
import { strings } from '../locales/i18n';

class ProfileHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {

    }

    componentDidMount() {
        AppUtils.console("ProfileScreen")
    }

    logout() {
        let self = this;
        SHApiConnector.logout(function (err, stat) {
            if (stat) {
                try {
                    if (stat.logOutStatus) {

                        Alert.alert(
                            strings('doctor.alertTitle.userLoggedOut'),

                            strings('shared.logoutSuccess'),
                            [
                                {text: strings('shared.bookAppoint'), onPress: () => self.goHome()},
                                {text: strings('shared.reLogin'), onPress: () => self.login()}
                            ]
                        )
                    }

                } catch (err) {
                    console.error(err)
                }
            }

        })

    }

    goHome() {
        Actions.HomeScreenDash();
    }

    login() {
        Actions.LoginMobile({screen: "profile"});
    }

    editProfile() {
        Actions.EditProfile();
    }


    render() {
        return (

            <ElevatedView style={styles.headerStyle} elevation={5}>
                {/*<TouchableHighlight onPress={()=>this.logout()} underlayColor='transparent'>
                    <Image
                        style={{height:verticalScale(30),width:moderateScale(30)}}
                        source={require('../../assets/images/logout.png')}
                    />
                </TouchableHighlight>*/}
                <View style={{flex: 1, marginLeft: moderateScale(5)}}>
                    <Text allowFontScaling={false} style={styles.headerText}>{this.props.title}</Text>
                </View>

                {/*<TouchableHighlight onPress={() => this.logout()} underlayColor='transparent'
                                    style={{marginRight: moderateScale(5)}}>
                    <Image
                        style={{height: verticalScale(30), width: moderateScale(30)}}
                        source={require('../../assets/images/logout.png')}
                    />
                </TouchableHighlight>*/}
            </ElevatedView>

        )
    }
}

const styles = StyleSheet.create({

    headerStyle: {
        height: (AppUtils.headerHeight),
        width: AppUtils.screenWidth,
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        elevation: 5,
        flexDirection: 'row',
    },
    headerText: {
        color: AppColors.blackColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? 40 : (Platform.OS === 'ios' ? 16 : (verticalScale(15))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default ProfileHeader;
