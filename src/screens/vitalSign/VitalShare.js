import React, { Component } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions,
    Platform,
    BackHandler,
    StyleSheet
} from 'react-native';

import { scale, verticalScale, moderateScale } from '../../utils/Scaling';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppUtils } from '../../utils/AppUtils';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';
import images from "../../utils/images";
import VitalCard from './card';
import { LineChart } from "react-native-chart-kit";
import { Actions } from "react-native-router-flux";
import ViewShot from "react-native-view-shot";
import Share from "react-native-share";
import ReactNativeBlobUtil from "react-native-blob-util";
import { strings } from '../../locales/i18n';
let RNFS = require('react-native-fs');


const { width, height } = Dimensions.get('window');

class ShareVitalSigns extends Component {
    constructor(props) {
        super(props);
        this.state = {
            today: false,
            sevenDays: true,
            oneMonth: false,
            test: "Heart Rate",

        }
    }


    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.onBackPress()
            return true;
        });
    }

    onBackPress() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({ update: true })
        }, 500);
    }

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, {
                flexDirection: 'row',
                paddingBottom: hp(3),
                paddingTop: hp(3),
                borderBottomWidth: hp(.1),
                borderColor: AppColors.greyBorder
            }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: wp(33),
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(2),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.vital.parameterName}</Text>
                </View>
                <TouchableOpacity style={{
                    width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center',
                    alignItems: 'flex-end'
                }}
                    onPress={() => this.takeScreenshot()}
                >
                    <Text
                        style={[styles.headerTextIOS, {
                            color: AppColors.colorHeadings,
                            fontSize: 12,
                            marginRight: wp(5)
                        }]}>{strings('vital.vital.share')}</Text>
                </TouchableOpacity>


            </View>

        )
    }

    renderAndroid() {

        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, {
                flexDirection: 'row',
                paddingBottom: hp(3),
                paddingTop: hp(2),
                borderBottomWidth: hp(.1),
                borderColor: AppColors.greyBorder
            }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: wp(33),
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(1),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.vital.parameterName}</Text>
                </View>
                <TouchableOpacity style={{
                    width: wp(33), height: (AppUtils.headerHeight), justifyContent: 'center',
                    alignItems: 'flex-end'
                }}
                    onPress={() => this.takeScreenshot()}
                >
                    <Text
                        style={[styles.headerTextIOS, {
                            color: AppColors.colorHeadings,
                            fontSize: 12,
                            marginRight: wp(5)
                        }]}>{strings('vital.vital.share')}</Text>
                </TouchableOpacity>

            </View>

        )
    }


    requestsToday = () => {
        this.setState({
            today: !this.state.today
        })
    }

    requestsSevenDays = () => {
        this.setState({
            sevenDays: !this.state.sevenDays
        })
    }
    requestsThirtyDays = () => {
        this.setState({
            oneMonth: !this.state.oneMonth
        })
    }

    takeScreenshot() {
        this.refs.viewShot.capture().then(uri => {
            AppUtils.console("do something with ", uri);

            (Platform.OS === 'ios') ? ReactNativeBlobUtil.ios.previewDocument(uri) :
                RNFS.readFile(uri, 'base64').then((res) => {
                    let urlString = 'data:image/jpeg;base64,' + res;
                    let options = {
                        url: urlString,
                        type: 'image/jpeg',
                    };
                    Share.open(options)
                        .then((res) => {
                            //AppUtils.console(res);
                        })
                        .catch((err) => {
                            err && AppUtils.console(err);
                        });
                });
        }).catch(e => {
            //AppUtils.console("szxcszx", e)
        })


    }

    render() {
        AppUtils.console("sdx34reds", this.props.relativeProfile);
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
                {AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()}

                <ViewShot style={{ backgroundColor: AppColors.whiteColor }} ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
                    <View style={{
                        flexDirection: 'row',
                        width: wp('90%'),
                        marginTop: hp('3%'),
                        marginLeft: wp('5%'),
                        height: hp('7%'),
                        backgroundColor: AppColors.whiteColor
                    }}>
                        <View style={{ width: wp('50%'), flexDirection: 'row', backgroundColor: AppColors.whiteColor }}>
                            <View style={{

                                alignSelf: 'center', alignItems: 'center', alignContent: 'center', backgroundColor: AppColors.whiteColor,
                            }}>
                                <Image
                                    source={{ uri: AppUtils.handleNullImg(this.props.relativeProfile.profilePic) }}
                                    style={{
                                        height: moderateScale(40),
                                        width: moderateScale(40),
                                        borderRadius: moderateScale(20)
                                    }}
                                    resizeMode={'cover'}
                                />
                            </View>
                            <View
                                style={{
                                    flex: 1, flexDirection: 'column',
                                    marginTop: (AppUtils.isIphone) ? hp(.8) : 0,
                                    justifyContent: 'center', marginLeft: wp('2%'),
                                }}>
                                <Text allowFontScaling={false} style={{
                                    fontSize: moderateScale(13),
                                    fontFamily: AppStyles.fontFamilyMedium,
                                    color: AppColors.blackColor,
                                }}
                                    numberOfLines={1}>{this.props.relativeProfile.firstName + " " + this.props.relativeProfile.lastName}</Text>
                                <Text allowFontScaling={false} style={{
                                    fontSize: moderateScale(8),
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    color: AppColors.textGrey,
                                    marginBottom: moderateScale(5)
                                }}
                                    numberOfLines={1}>{AppUtils.getAgeFromDateOfBirth(this.props.relativeProfile.dateOfBirth) + ", " + this.props.relativeProfile.gender}</Text>
                            </View>
                        </View>

                    </View>

                    <View style={{
                        marginTop: hp('3%'), height: hp('15%'), marginLeft: wp('5%'), width: wp('90%'),
                        flexDirection: 'row', backgroundColor: AppColors.whiteColor
                    }}>
                        <VitalCard title={'Average'} image={this.props.vital.parameterWhiteImage}
                            reading={this.props.average} unit={this.props.vital.parameterUnit} />
                        <VitalCard title={this.props.vitalViiewMinText} image={this.props.vital.parameterWhiteImage}
                            reading={this.props.minimum} unit={this.props.vital.parameterUnit} />
                        <VitalCard title={this.props.vitalViewMaxText} image={this.props.vital.parameterWhiteImage}
                            reading={this.props.maximum} unit={this.props.vital.parameterUnit} />


                    </View>

                    <View style={{
                        marginTop: hp('3%'), height: hp('4%'), marginLeft: wp('5%'), width: wp('90%'),
                        flexDirection: 'row', backgroundColor: AppColors.whiteColor
                    }}>
                        <Text style={{
                            fontSize: 25,
                            fontFamily: AppStyles.fontFamilyBold, color: AppColors.blackColor, alignSelf: 'flex-end'
                        }}>{this.props.average}</Text>
                        <Text style={{
                            color: AppColors.grey,
                            alignSelf: 'flex-end',
                            paddingLeft: wp('1%')
                        }}>{this.props.vital.parameterUnit}</Text>
                        <Text style={{
                            fontSize: 20,
                            fontFamily: AppStyles.fontFamilyMedium, color: AppColors.blackColor, alignSelf: 'flex-end'
                        }}>{'   ( ' + this.props.vital.parameterName + ' )'}</Text>
                    </View>
                    <View style={{
                        height: hp('4%'), marginLeft: wp('5%'), width: wp('90%'), flexDirection: 'row'
                    }}>
                        <Text style={{ color: AppColors.grey, alignSelf: 'flex-start' }}>{this.props.duration}</Text>
                    </View>
                    <View>
                        <LineChart
                            data={{
                                labels: this.props.vitalRecordDateList,
                                datasets: this.props.vitalRecordDataList,
                                legend: this.props.legend
                            }}
                            width={wp(90)} // from react-native
                            height={hp(40)}
                            withInnerLines={false}
                            withOuterLines={true}
                            withDots={true}
                            withShadow={true}
                            transparent={false}
                            yLabelsOffset={10}
                            segments={5}
                            fromZero={true}
                            chartConfig={{
                                backgroundColor: "white",
                                backgroundGradientFrom: "white",
                                backgroundGradientTo: "white",
                                decimalPlaces: 1, // optional, defaults to 2dp
                                color: (opacity = 1) => AppColors.colorHeadings,
                                labelColor: (opacity = 1) => AppColors.greyColor,
                                style: {
                                    borderRadius: 16,
                                    backgroundColor: 'white'
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "0",
                                    stroke: AppColors.colorHeadings
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                backgroundColor: 'white'
                            }}
                        />
                    </View>
                </ViewShot>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    textViewStyle: {
        alignSelf: 'center', height: hp(6), flexDirection: 'row',
        width: wp(90), borderColor: AppColors.backgroundGray
    },

    textTitleStyle: {
        flex: 1,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(5),
    },

    textDataStyle: {
        flex: 1,
        fontSize: 14,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginLeft: wp(25),
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyRegular
    },
    headerStyle: {
        height: (AppUtils.headerHeight),
        width: wp(100),
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerTextIOS: {
        color: AppColors.blackColor, textAlign: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (hp(1))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }, tab: {
        alignContent: 'center',
        justifyContent: 'center',
        height: hp('6%'),
        width: wp('30%'),
    },
    tabText: {

        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyMedium
    },
    menuText: { color: AppColors.blackColor, fontFamily: AppStyles.fontFamilyMedium },
    btnSubmit: {
        backgroundColor: '#ff4848',
        color: 'white',
        borderColor: '#ff4848',
        borderWidth: hp(.2),
        borderRadius: hp(1),
        width: wp(90),
        textAlign: 'center',
        paddingTop: hp(1.5),
        paddingBottom: hp(1.5),
        marginLeft: wp(2),
        fontSize: 16,
        fontFamily: AppStyles.fontFamilyRegular,
    },
    topBar: {
        flexDirection: 'row',
        width: wp(25),
        height: hp(1),
        borderRadius: hp(2),
        backgroundColor: AppColors.greyBorder,
        marginBottom: hp(3),
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    vitalHeadingText: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15,
        color: AppColors.blackColor,
        marginBottom: hp(3)
    },
    dividerVital: {
        width: wp('100%'),
        height: hp(2),
        flexDirection: 'row',
        backgroundColor: AppColors.backgroundGray,
        marginBottom: hp(1),
    }

});


export default ShareVitalSigns;
