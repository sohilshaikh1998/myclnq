import React from 'react';
import {BackHandler, Dimensions,View,Image,Text,StyleSheet,TouchableHighlight,TouchableOpacity} from 'react-native';

import {AppUtils} from "../../utils/AppUtils";
import {WebView} from 'react-native-webview';
import {Actions} from 'react-native-router-flux';
import { scale, verticalScale, moderateScale } from '../../utils/Scaling';
import images from "../../utils/images";

const {width, height} = Dimensions.get('window');
import { AppColors } from "../../shared/AppColors";
import CardView from "react-native-cardview";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../shared/AppStyles";
import ProgressLoader from "rn-progress-loader";
import ElevatedView from 'react-native-elevated-view';

import Toast from 'react-native-simple-toast';
import { SHApiConnector } from "../../network/SHApiConnector";
import { strings } from '../../locales/i18n';

class ArticleWebView extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.console("WebUrl",this.props.data.url);
        AppUtils.analyticsTracker('Article WebView')
        this.state={
            isLoading:true,
            isBookMark:!this.props.data.userArticle?false:this.props.data.userArticle.isBookedMark
        }
    }
    componentDidMount(){
        AppUtils.console("WebUrl",this.props);
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();
            return true;
        })
        this.props.data.isMain ? null : this.updateArticle();

    }
    async updateArticle() {

        try {

            let response = await SHApiConnector.updateArticleView(this.props.data._id);

            AppUtils.console("articleUpdateResponse", response);
            if (response.data.status) {

            }
            else {
            }

        } catch (e) {
            this.setState({
                isLoading: false,
            })

            AppUtils.console("Article", e);

        }
    }
    async updateBookmark() {

        try {
           let data ={isBookedMark: !this.state.isBookMark}
            let response = await SHApiConnector.updateArticleBookMark(this.props.data._id,data);

            AppUtils.console("articleBookmarkResponse", response);
            if (response.data.status) {
                this.setState({isBookMark:!this.state.isBookMark})

            }
            else {
            }

        } catch (e) {
            this.setState({
                isLoading: false,
            })

            AppUtils.console("Article", e);

        }
    }


    goBack() {
        Actions.pop()
        setTimeout(()=>{
            AppUtils.console("timeout","----->")
            Actions.refresh({update:true})
        },500);
    }
    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={5}>

                <View
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                    }}>
                    <TouchableHighlight underlayColor="transparent" onPress={()=>this.goBack()}
                        testID={"drawer"}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                                marginLeft: 8, tintColor: AppColors.blackColor

                            }}
                            source={require('../../../assets/images/blackarrow.png')}
                        />
                    </TouchableHighlight>
                </View>
                <View style={{ width: cellWidth, height: hp('6'), marginTop: hp('1'), alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                }}>
                    {this.props.data.isMain ? <View/> :
                    <TouchableHighlight onPress={() => this.updateBookmark()} underlayColor="transparent"
                        style={{ marginRight: 8 }}>
                        <Image
                            resizeMode={'contain'}
                            style={{
                                height: moderateScale(35),
                                width: moderateScale(35),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                            }}
                            source={this.state.isBookMark?require('../../../assets/images/bookmark.png'):require('../../../assets/images/addBookMark.png')}
                        />
                    </TouchableHighlight>
                    }
                </View>
            </ElevatedView>

        )
    }

    navToHomescreen() {
        Actions.MainScreen()
    }

    renderAndroid() {
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={5}>

                <TouchableHighlight onPress={()=>this.goBack()} underlayColor="transparent"
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center',
                        //backgroundColor: '#f18867',
                    }}>

                    <Image
                        style={{
                            height: moderateScale(30),
                            width: moderateScale(30),
                            marginTop: AppUtils.isX ? (16 + 18) : 0,
                            marginLeft: 8,
                            tintColor: AppColors.blackColor
                        }}
                        source={require('../../../assets/images/blackarrow.png')}
                        />
                </TouchableHighlight>

                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'center',
                }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>

                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                }}>
                {this.props.data.isMain ? <View/> :
                    <TouchableHighlight onPress={() => this.updateBookmark()} underlayColor="transparent"
                        style={{ marginRight: 12 }}>
                        <Image
                            resizeMode={'contain'}
                            style={{
                                height: moderateScale(35),
                                width: moderateScale(35),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                            }}
                            source={this.state.isBookMark?require('../../../assets/images/bookmark.png'):require('../../../assets/images/addBookMark.png')}
                            />
                    </TouchableHighlight>
                }
                </View>

            </ElevatedView>

        )
    }


    render() {
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
                {
                    (AppUtils.isIphone) ? this.renderIOS() : this.renderAndroid()
                }
            <WebView
                source={{uri: this.props.data.url}}
                style={{height: height, width: width}}
                automaticallyAdjustContentInsets={true}
                androidHardwareAccelerationDisabled={true}
                onLoadEnd={()=>{this.setState({isLoading:false})}}
                startInLoadingState={true}
                javaScriptEnabled={false}
                domStorageEnabled={false}
            />
            </View>
        )
    }


}
const styles = StyleSheet.create({
    textViewStyle: {
        alignSelf: 'center', height: hp(6), flexDirection: 'row',
        width: wp(90), borderBottomWidth: 1, borderColor: AppColors.backgroundGray
    },

    textTitleStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
    },

    textDataStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginLeft: wp(25),
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyRegular,
    },
    headerStyle: {
        height: (AppUtils.headerHeight),
        width: AppUtils.screenWidth,
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerText: {
        color: AppColors.blackColor,
        marginLeft: moderateScale(120),
        marginTop: (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    },
    headerTextIOS: {
        color: AppColors.blackColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});
export default ArticleWebView;
