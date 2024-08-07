import React from 'react';
import {
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    PixelRatio,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import moment from 'moment'
import {AppUtils} from "../../utils/AppUtils";
import {AppStyles} from '../../shared/AppStyles';
import {AppColors} from "../../shared/AppColors";
import {moderateScale, verticalScale} from '../../utils/Scaling';
import {Actions} from 'react-native-router-flux';
import {SHApiConnector} from "../../network/SHApiConnector";
import ElevatedView from 'react-native-elevated-view'
import Spinner from "../../shared/Spinner";
import { strings } from '../../locales/i18n';

const {width, height} = Dimensions.get('window');

class BookingSuggestions extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Booking Suggestions');
        this.state = ({
            data: [],
            isModalOpen: true,
            docSelected: true,
            altDocSelected: false,
            isSubModelOpen: false,
            dataAvailable: false,
            isDataVisible: false,
            isLoading: false,
            latitude: '',
            longitude: ''
        })

        this.getBookingSuggestion = this.getBookingSuggestion.bind(this);
    }


    componentWillMount() {
        this.getBookingSuggestion();
        BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
    }


    goBack() {
        var self = this;
        Actions.ClinicDetails({
            clinicId: this.props.appointmentData.clinicId,
            latitude: self.state.latitude,
            longitude: self.state.longitude
        });

    }


    onCross() {
        this.setState({
            isModalOpen: false
        })
        Actions.pop();
    }

    docSelected() {
        this.setState({
            docSelected: true,
            altDocSelected: false
        })
    }


    getBookingSuggestion() {
        var self = this;
        self.setState({
            isLoading: true,
            longitude: this.props.appointmentData.longitude,
            latitude: this.props.appointmentData.latitude
        })
        var details = {
            doctorId: this.props.appointmentData.doctorId,
            departmentId: this.props.appointmentData.departmentId,
            clinicId: this.props.appointmentData.clinicId,
            slotStart: this.props.appointmentData.start,
            longitude: this.props.appointmentData.longitude,
            latitude: this.props.appointmentData.latitude
        }
        SHApiConnector.getBookingSuggestion(details, function (err, stat) {
            self.setState({isLoading: false});

            try {
                if (!err && stat) {
                    self.setState({isDataVisible: true});
                    if (stat.length == 0) {
                        AppUtils.userSessionValidation(function (loggedIn) {
                            if (!loggedIn) {
                                Actions.LoginMobile({appointmentData: self.props.appointmentData});
                                self.setState({isModalOpen: false})
                            } else {
                                Actions.Registration({appointmentData: self.props.appointmentData});
                                self.setState({isModalOpen: false})
                            }
                        })
                    } else {
                        self.setState({
                            data: stat,
                            isModalOpen: true
                        })
                    }

                }
            } catch (err) {
                console.error(err)
            }
        })
    }

    render() {
        return (
            <View style={[styles.modalContainer]}>
                {

                    (this.state.isModalOpen && this.state.isDataVisible) ? (

                        <ElevatedView elevation={4} style={{
                            backgroundColor: AppColors.whiteColor,
                            height: AppUtils.screenHeight - (AppUtils.headerHeight),
                            width: AppUtils.screenWidth - 20
                        }}>
                            <TouchableHighlight onPress={() => this.onCross()} style={{margin: verticalScale(10)}}
                                                underlayColor='transparent'>
                                <Image
                                    style={{alignSelf: 'flex-end'}}
                                    source={require('../../../assets/images/tutorial_close.png')}/>
                            </TouchableHighlight>
                            <ScrollView style={{height: height, marginBottom: verticalScale(25)}}>
                                <ElevatedView elevation={8} style={[styles.docAvailability, {
                                    marginTop: AppUtils.isIphone ? verticalScale(10) : verticalScale(50),
                                    marginBottom: AppUtils.isIphone ? verticalScale(10) : verticalScale(10)
                                }]}>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>

                                        <TouchableHighlight
                                            onPress={() => this.proceed(this.props.appointmentData, false)}
                                            underlayColor='transparent'>
                                            <Image style={[styles.doctImage, {
                                                height: PixelRatio.getPixelSizeForLayoutSize(18),
                                                width: PixelRatio.getPixelSizeForLayoutSize(18),
                                                borderRadius: (PixelRatio.getPixelSizeForLayoutSize(18)) / 2
                                            }]}
                                                   source={{uri: (AppUtils.handleNullImg(this.props.appointmentData.docImage))}}/>
                                        </TouchableHighlight>
                                        <TouchableHighlight
                                            onPress={() => this.proceed(this.props.appointmentData, false)}
                                            underlayColor='transparent'>
                                            <View style={styles.docSpecs}>
                                                <Text
                                                    style={styles.doctorName}>{this.props.appointmentData.docName}</Text>
                                                <Text
                                                    style={styles.speciality}>{this.props.appointmentData.docSpeciality}</Text>
                                                <Text style={styles.clinicName}
                                                      numberOfLines={1}>{this.props.appointmentData.clinicName}</Text>
                                            </View>
                                        </TouchableHighlight>
                                        <TouchableHighlight
                                            onPress={() => this.proceed(this.props.appointmentData, false)}
                                            underlayColor='transparent' style={{flex: 0.90, alignItems: 'flex-end'}}>
                                            <View style={{
                                                height: AppUtils.isIphone ? verticalScale(60) : verticalScale(90),
                                                width: moderateScale(100),
                                                borderRadius: AppUtils.isIphone ? 12 : moderateScale(25),
                                                backgroundColor: AppColors.primaryColor,
                                                justifyContent: 'center',
                                                flex: 0.75
                                            }}>
                                                <Text style={{
                                                    color: AppColors.whiteColor,
                                                    alignSelf: 'center',
                                                    fontFamily: AppStyles.fontFamilyRegular,
                                                    fontSize: moderateScale(10)
                                                }}>{strings('doctor.text.bookingOn')}</Text>
                                                <Text style={{
                                                    color: AppColors.whiteColor,
                                                    alignSelf: 'center',
                                                    fontFamily: AppStyles.fontFamilyRegularedium,
                                                    fontSize: moderateScale(10)
                                                }}> {moment.parseZone(this.props.appointmentData.start).format("DD MMM YYYY")}</Text>
                                                <Text style={{
                                                    color: AppColors.whiteColor,
                                                    alignSelf: 'center',
                                                    fontFamily: AppStyles.fontFamilyRegularedium,
                                                    fontSize: moderateScale(10)
                                                }}>@ {moment.parseZone(this.props.appointmentData.start).format("hh:mm a")}</Text>
                                            </View>
                                        </TouchableHighlight>
                                    </View>
                                </ElevatedView>
                                <Text style={{
                                    color: AppColors.blackColor,
                                    fontFamily: AppStyles.fontFamilyMedium,
                                    fontSize: moderateScale(12),
                                    marginTop: moderateScale(20),
                                    margin: moderateScale(12)
                                }}>{strings('doctor.text.fewMoreDoc', {name: this.props.appointmentData.docName})}</Text>

                                <FlatList
                                    data={this.state.data}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={(item) => this._render_doctor(item)}
                                    extraData={this.state}
                                />

                            </ScrollView>
                        </ElevatedView>

                    ) : (<View/>)}
                <Spinner visible={this.state.isLoading} textContent={""} textStyle={{color: '#FFF'}}/>
            </View>
        )
    }

    proceed(details, isOther) {
        var self = this;

        this.setState({
            isModalOpen: false,
            isSubModelOpen: false
        })


        if (isOther) {
            var build = {
                clinicId: details._id,
                doctorId: details.doctorsInClinic._id,
                start: details.slotDetails.slotTimings.slots.start,
                end: details.slotDetails.slotTimings.slots.end,
                daySlotId: details.slotDetails._id,
                shiftSlotId: details.slotDetails.slotTimings._id,
                slotId: details.slotDetails.slotTimings.slots._id,
                docName: details.doctorsInClinic.doctorName,
                docImage: details.doctorsInClinic.profilePic,
                docSpeciality: details.doctorsInClinic.departmentDetails.departmentName,
                clinicName: details.clinicName,
                shiftIndex: details.shiftIndex,
                slotIndex: details.slotIndex,
                queueNumber: details.slotDetails.slotTimings.slots.queueNumber,
                sequence: details.slotDetails.slotTimings.slots.sequence,
                departmentId: details.doctorsInClinic.department,
                doctorDescription: details.doctorsInClinic.doctorDescription ? details.doctorsInClinic.doctorDescription : ""
            }
            details = build;
            isOther = false;
        }

        AppUtils.userSessionValidation(function (loggedIn) {
            if (!loggedIn) {
                Actions.LoginMobile({appointmentData: details, isOther: isOther});
            } else {
                Actions.Registration({appointmentData: details, isOther: isOther});
            }
        })
    }

    selectedDoctor(item) {

        var arrayData = this.state.data;
        var dataLength = arrayData.length;
        for (var i = 0; i < dataLength; i++) {
            if (item.index == i) {
                arrayData[i].isSelected = true
                this.proceed(arrayData[i], true)
            } else {
                arrayData[i].isSelected = false
            }
        }

        this.setState({
            data: arrayData,
            altDocSelected: true,
            docSelected: false
        })
    }

    _render_doctor(item) {
        var startTime = item.item.slotDetails.slotTimings.slots.start
        var time = moment.parseZone(startTime).format("hh:mm a")
        AppUtils.console('sdzf4rrsdzxcsfxx', item.item.doctorsInClinic);
        return (
            <ElevatedView elevation={8} style={[styles.docAvailability, {
                marginTop: AppUtils.isIphone ? verticalScale(10) : verticalScale(50),
                marginBottom: AppUtils.isIphone ? verticalScale(10) : verticalScale(10)
            }]}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <TouchableHighlight onPress={() => this.selectedDoctor(item)} underlayColor='transparent'>
                        <Image style={[styles.doctImage, {
                            height: PixelRatio.getPixelSizeForLayoutSize(18),
                            width: PixelRatio.getPixelSizeForLayoutSize(18),
                            borderRadius: (PixelRatio.getPixelSizeForLayoutSize(18)) / 2
                        }]}
                               source={{uri: (AppUtils.handleNullImg(item.item.doctorsInClinic.profilePic))}}/>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.selectedDoctor(item)} underlayColor='transparent'>
                        <View style={styles.docSpecs}>
                            <Text style={styles.doctorName}
                                  numberOfLines={1}>{item.item.doctorsInClinic.doctorName}</Text>
                            <Text style={styles.speciality}
                                  numberOflines={1}>{item.item.doctorsInClinic.departmentDetails.departmentName}</Text>
                            <Text style={styles.clinicName} numberOfLines={1}>{item.item.clinicName}</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.selectedDoctor(item)} underlayColor='transparent' style={{
                        flex: 0.90,
                        alignItems: 'flex-end',
                        marginLeft: AppUtils.isIphone ? 15 : 0
                    }}>
                        <View style={{
                            height: AppUtils.isIphone ? verticalScale(60) : verticalScale(90),
                            width: moderateScale(100),
                            borderRadius: AppUtils.isIphone ? 12 : moderateScale(25),
                            backgroundColor: AppColors.primaryColor,
                            justifyContent: 'center',
                            flex: 0.75
                        }}>
                            <Text style={{
                                color: AppColors.whiteColor,
                                alignSelf: 'center',
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: moderateScale(10)
                            }}>{strings('doctor.text.bookingOn')}</Text>
                            <Text style={{
                                color: AppColors.whiteColor,
                                alignSelf: 'center',
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: moderateScale(10)
                            }}>{moment.parseZone(startTime).format("DD MMM YYYY")}</Text>
                            <Text style={{
                                color: AppColors.whiteColor,
                                alignSelf: 'center',
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: moderateScale(10)
                            }}>@ {time}</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            </ElevatedView>

        )
    }


}

const styles = StyleSheet.create({
    modalContainer: {
        height: height,
        width: width,
        backgroundColor: AppColors.lightGray,
        alignItems: 'center', justifyContent: 'center'
    },
    modalBox: {
        alignSelf: 'center',
        height: verticalScale(750),
        width: moderateScale(350),
        backgroundColor: AppColors.primaryColor,
        elevation: 5
    },
    docAvailability: {
        height: AppUtils.isIphone ? verticalScale(80) : verticalScale(120),
        width: moderateScale(310),
        marginTop: verticalScale(50),
        alignSelf: 'center',
        borderRadius: AppUtils.isIphone ? moderateScale(10) : moderateScale(35),
        backgroundColor: AppColors.whiteColor,
        borderColor: AppColors.textGray,
        flexDirection: 'column',
        elevation: moderateScale(5),
    },
    altDocAvailability: {
        height: verticalScale(120),
        width: moderateScale(304),
        marginTop: verticalScale(10),
        alignSelf: 'center',
        borderRadius: moderateScale(35),
        borderColor: AppColors.textGray,
        backgroundColor: AppColors.whiteColor,
        flexDirection: 'column',
        elevation: moderateScale(5),
    },
    doctImage: {
        height: verticalScale(50),
        width: moderateScale(50),
        borderRadius: moderateScale(25),
    },
    doctorName: {
        fontFamily: AppStyles.fontFamilyBold,
        fontSize: moderateScale(10),
        color: AppColors.blackColor
    },
    speciality: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(10),
        color: AppColors.blackColor
    },
    clinicName: {
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: moderateScale(10),
        color: AppColors.blackColor,
        width: moderateScale(100)
    },
    buttonBorder: {
        height: AppUtils.isIphone ? moderateScale(20) : moderateScale(25),
        margin: moderateScale(10),
        width: AppUtils.isIphone ? moderateScale(20) : moderateScale(25),
        borderRadius: AppUtils.isIphone ? moderateScale(10) : moderateScale(15),
        borderWidth: 1,
        justifyContent: 'center',
        borderColor: AppColors.radioBorderColor
    },
    buttonItem: {
        height: AppUtils.isIphone ? moderateScale(16) : moderateScale(20),
        width: AppUtils.isIphone ? moderateScale(16) : moderateScale(20),
        borderRadius: AppUtils.isIphone ? moderateScale(8) : moderateScale(10),
        alignSelf: 'center',
        backgroundColor: AppColors.primaryColor
    },
    docSpecs: {
        flexDirection: 'column',
        flex: 0.75,
        marginLeft: moderateScale(10),
        justifyContent: 'center', width: moderateScale(130)
    },
    clinicbuttonView: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: width,
        height: verticalScale(50),
        marginTop: verticalScale(20),
        marginBottom: verticalScale(20)
    },
    proceedButton: {
        height: verticalScale(50),
        width: moderateScale(120),
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        backgroundColor: AppColors.primaryColor,
    },
    proceedText: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: moderateScale(15),
    },

})


export default BookingSuggestions;
